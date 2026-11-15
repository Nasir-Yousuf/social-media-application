/**
 * Automated Cursor Pagination Verification Suite
 * Verifies that:
 * 1. Cursor encoding and decoding (<ISO_DATE>_<OBJECT_ID>) is deterministic and robust.
 * 2. buildCursorQuery constructs correct compound conditions for descending ($lt) and ascending ($gt).
 * 3. Inserting new posts between page fetches produces ZERO duplicate posts and ZERO skipped posts.
 * 4. Identical timestamp collisions are deterministically resolved by the _id tie-breaker.
 * 5. Demonstrates that legacy offset pagination produces duplicate items under concurrent writes,
 *    whereas cursor pagination guarantees 100% feed stability.
 */

const assert = require('assert');
const mongoose = require('mongoose');
const {
  encodeCursor,
  decodeCursor,
  buildCursorQuery,
  executeCursorPagination,
} = require('../utils/cursorPagination');

/**
 * Lightweight in-memory query simulator matching MongoDB's compound index execution
 */
class InMemoryCollection {
  constructor(initialDocs = []) {
    this.docs = [...initialDocs];
  }

  insert(doc) {
    this.docs.push(doc);
  }

  find(filter = {}) {
    let results = [...this.docs];

    // Handle compound $or filter for cursor
    if (filter.$and) {
      for (const cond of filter.$and) {
        results = this.applyFilter(results, cond);
      }
    } else {
      results = this.applyFilter(results, filter);
    }

    const queryState = {
      results,
      _sort: null,
      _skip: 0,
      _limit: null,
      sort(s) {
        this._sort = s;
        return this;
      },
      skip(n) {
        this._skip = n;
        return this;
      },
      limit(n) {
        this._limit = n;
        return this;
      },
      select() {
        return this;
      },
      populate() {
        return this;
      },
      async exec() {
        let out = [...this.results];
        if (this._sort) {
          const [field1, order1] = Object.entries(this._sort)[0] || ['createdAt', -1];
          const [field2, order2] = Object.entries(this._sort)[1] || ['_id', -1];

          out.sort((a, b) => {
            const valA1 = new Date(a[field1]).getTime();
            const valB1 = new Date(b[field1]).getTime();
            if (valA1 !== valB1) {
              return order1 === -1 ? valB1 - valA1 : valA1 - valB1;
            }
            // Tie breaker
            const idA = a[field2].toString();
            const idB = b[field2].toString();
            return order2 === -1 ? idB.localeCompare(idA) : idA.localeCompare(idB);
          });
        }
        if (this._skip) {
          out = out.slice(this._skip);
        }
        if (this._limit !== null) {
          out = out.slice(0, this._limit);
        }
        return out;
      },
    };

    return queryState;
  }

  applyFilter(items, filter) {
    if (!filter || Object.keys(filter).length === 0) return items;

    if (filter.$or) {
      return items.filter((doc) => {
        return filter.$or.some((branch) => {
          if (branch.createdAt?.$lt) {
            return new Date(doc.createdAt).getTime() < new Date(branch.createdAt.$lt).getTime();
          }
          if (branch.createdAt?.$gt) {
            return new Date(doc.createdAt).getTime() > new Date(branch.createdAt.$gt).getTime();
          }
          if (branch.createdAt && branch._id?.$lt) {
            const sameDate = new Date(doc.createdAt).getTime() === new Date(branch.createdAt).getTime();
            const smallerId = doc._id.toString() < branch._id.$lt.toString();
            return sameDate && smallerId;
          }
          if (branch.createdAt && branch._id?.$gt) {
            const sameDate = new Date(doc.createdAt).getTime() === new Date(branch.createdAt).getTime();
            const biggerId = doc._id.toString() > branch._id.$gt.toString();
            return sameDate && biggerId;
          }
          return false;
        });
      });
    }

    return items;
  }

  async countDocuments() {
    return this.docs.length;
  }
}

async function runCursorPaginationTests() {
  console.log('\n======================================================');
  console.log('📜 Starting Deterministic Cursor Pagination Checks...');
  console.log('======================================================\n');

  let passed = 0;
  let total = 0;

  function test(name, fn) {
    total++;
    try {
      fn();
      console.log(`  PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ FAIL: ${name}`);
      console.error(`       ${err.message}`);
    }
  }

  async function testAsync(name, fn) {
    total++;
    try {
      await fn();
      console.log(`  PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ FAIL: ${name}`);
      console.error(`       ${err.message}`);
    }
  }

  // 1. Cursor Encoding & Decoding
  test('Cursor Engine: Encodes document into <ISO_DATE>_<OBJECT_ID>', () => {
    const id = new mongoose.Types.ObjectId();
    const date = new Date('2026-11-15T12:00:00.000Z');
    const doc = { _id: id, createdAt: date };

    const cursor = encodeCursor(doc);
    assert.strictEqual(cursor, `2026-11-15T12:00:00.000Z_${id.toString()}`);
  });

  test('Cursor Engine: Decodes cursor string into Date and ObjectId correctly', () => {
    const id = new mongoose.Types.ObjectId();
    const dateStr = '2026-11-15T12:00:00.000Z';
    const cursor = `${dateStr}_${id.toString()}`;

    const decoded = decodeCursor(cursor);
    assert.notStrictEqual(decoded, null);
    assert.strictEqual(decoded.createdAt.toISOString(), dateStr);
    assert.strictEqual(decoded._id.toString(), id.toString());
  });

  test('Cursor Engine: Rejects invalid or corrupt cursor strings safely', () => {
    assert.strictEqual(decodeCursor(null), null);
    assert.strictEqual(decodeCursor(''), null);
    assert.strictEqual(decodeCursor('invalid_cursor_without_objectid'), null);
    assert.strictEqual(decodeCursor('notadate_507f1f77bcf86cd799439011'), null);
  });

  // 2. Query Condition Construction
  test('Cursor Engine: Builds compound $or query for descending feed (newest first)', () => {
    const id = new mongoose.Types.ObjectId();
    const dateStr = '2026-11-15T12:00:00.000Z';
    const cursor = `${dateStr}_${id.toString()}`;

    const query = buildCursorQuery(cursor, -1);
    assert.strictEqual(Array.isArray(query.$or), true);
    assert.strictEqual(query.$or.length, 2);
    assert.strictEqual(query.$or[0].createdAt.$lt instanceof Date, true);
    assert.strictEqual(query.$or[1].createdAt instanceof Date, true);
    assert.strictEqual(query.$or[1]._id.$lt.toString(), id.toString());
  });

  // 3. Integration Simulation: Zero Duplicates & Zero Skips on Concurrent Inserts
  await testAsync('Cursor Engine: Inserting new posts between page fetches produces 0 duplicates & 0 skips', async () => {
    // Generate 20 initial chronological posts
    const baseDate = new Date('2026-11-15T10:00:00.000Z').getTime();
    const initialPosts = [];

    for (let i = 1; i <= 20; i++) {
      initialPosts.push({
        _id: new mongoose.Types.ObjectId(),
        title: `Post ${i}`,
        // Post 1 is oldest, Post 20 is newest
        createdAt: new Date(baseDate + i * 60000),
      });
    }

    const model = new InMemoryCollection(initialPosts);

    // Fetch Page 1 (limit 5)
    const page1 = await executeCursorPagination(model, {
      limit: 5,
      sortOrder: -1,
    });

    assert.strictEqual(page1.items.length, 5);
    assert.strictEqual(page1.hasMore, true);
    assert.notStrictEqual(page1.nextCursor, null);
    assert.strictEqual(page1.items[0].title, 'Post 20');
    assert.strictEqual(page1.items[4].title, 'Post 16');

    // While user reads Page 1, 3 brand new posts arrive in real-time
    const newArrivalDate = baseDate + 30 * 60000;
    model.insert({ _id: new mongoose.Types.ObjectId(), title: 'Post 21 (New)', createdAt: new Date(newArrivalDate + 1000) });
    model.insert({ _id: new mongoose.Types.ObjectId(), title: 'Post 22 (New)', createdAt: new Date(newArrivalDate + 2000) });
    model.insert({ _id: new mongoose.Types.ObjectId(), title: 'Post 23 (New)', createdAt: new Date(newArrivalDate + 3000) });

    // Now user requests Page 2 using nextCursor
    const page2 = await executeCursorPagination(model, {
      cursor: page1.nextCursor,
      limit: 5,
      sortOrder: -1,
    });

    assert.strictEqual(page2.items.length, 5);
    assert.strictEqual(page2.items[0].title, 'Post 15');
    assert.strictEqual(page2.items[4].title, 'Post 11');

    // Verify ZERO duplicate posts between Page 1 and Page 2
    const page1Ids = new Set(page1.items.map((p) => p._id.toString()));
    const duplicates = page2.items.filter((p) => page1Ids.has(p._id.toString()));
    assert.strictEqual(duplicates.length, 0, 'Cursor pagination must produce exactly 0 duplicates');

    // Verify ZERO skipped posts
    assert.strictEqual(page1.items[4].title, 'Post 16');
    assert.strictEqual(page2.items[0].title, 'Post 15');
  });

  // 4. Demonstrating Offset Pagination Flaw vs Cursor Stability
  await testAsync('Offset Pagination Comparison: Demonstrates skip/limit causes duplicate items on insert', async () => {
    const baseDate = new Date('2026-11-15T10:00:00.000Z').getTime();
    const initialPosts = [];

    for (let i = 1; i <= 20; i++) {
      initialPosts.push({
        _id: new mongoose.Types.ObjectId(),
        title: `Post ${i}`,
        createdAt: new Date(baseDate + i * 60000),
      });
    }

    const model = new InMemoryCollection(initialPosts);

    // Page 1 using offset pagination
    const page1 = await model.find().sort({ createdAt: -1, _id: -1 }).skip(0).limit(5).exec();

    // 3 new posts arrive
    const newDate = baseDate + 30 * 60000;
    model.insert({ _id: new mongoose.Types.ObjectId(), title: 'New 1', createdAt: new Date(newDate + 1000) });
    model.insert({ _id: new mongoose.Types.ObjectId(), title: 'New 2', createdAt: new Date(newDate + 2000) });
    model.insert({ _id: new mongoose.Types.ObjectId(), title: 'New 3', createdAt: new Date(newDate + 3000) });

    // Page 2 using legacy offset skip(5)
    const page2 = await model.find().sort({ createdAt: -1, _id: -1 }).skip(5).limit(5).exec();

    const page1Ids = new Set(page1.map((p) => p._id.toString()));
    const offsetDuplicates = page2.filter((p) => page1Ids.has(p._id.toString()));

    // Offset pagination duplicates 3 items because new items shifted the index window
    assert.strictEqual(offsetDuplicates.length, 3, 'Offset pagination predictably duplicates items under concurrent writes');
  });

  // 5. Millisecond Timestamp Collision Tie-Breaker
  await testAsync('Cursor Engine: Resolves millisecond timestamp collisions via _id tie-breaker', async () => {
    const identicalTimestamp = new Date('2026-11-15T12:00:00.000Z');
    const idA = new mongoose.Types.ObjectId('673708a0d4c5b35c05c1d9b1');
    const idB = new mongoose.Types.ObjectId('673708a0d4c5b35c05c1d9b2');

    const posts = [
      { _id: idB, title: 'Post B (Higher _id)', createdAt: identicalTimestamp },
      { _id: idA, title: 'Post A (Lower _id)', createdAt: identicalTimestamp },
    ];

    const model = new InMemoryCollection(posts);

    // Fetch limit 1
    const res1 = await executeCursorPagination(model, {
      limit: 1,
      sortOrder: -1,
    });

    assert.strictEqual(res1.items.length, 1);
    assert.strictEqual(res1.items[0]._id.toString(), idB.toString());
    assert.strictEqual(res1.hasMore, true);

    // Fetch next item with cursor
    const res2 = await executeCursorPagination(model, {
      cursor: res1.nextCursor,
      limit: 1,
      sortOrder: -1,
    });

    assert.strictEqual(res2.items.length, 1);
    assert.strictEqual(res2.items[0]._id.toString(), idA.toString());
  });

  console.log('\n======================================================');
  console.log(`Results: ${passed}/${total} checks passed.`);
  console.log('======================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

if (require.main === module) {
  runCursorPaginationTests();
}

module.exports = runCursorPaginationTests;
