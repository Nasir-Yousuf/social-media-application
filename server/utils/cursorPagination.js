const mongoose = require('mongoose');

/**
 * Deterministic Chronological Cursor Pagination
 * Uses (createdAt, _id) compound tie-breaker to guarantee zero duplicates or skipped items.
 *
 * Cursor format: <ISO_DATE>_<OBJECT_ID> (e.g. "2026-11-15T07:30:00.000Z_673708a0d4c5b35c05c1d9b3")
 */

/**
 * Encodes a document into a cursor string
 * @param {Object} doc - Document with createdAt and _id
 * @returns {string|null}
 */
function encodeCursor(doc) {
  if (!doc) return null;
  const createdAt = doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString();
  const id = doc._id ? doc._id.toString() : '';
  return `${createdAt}_${id}`;
}

/**
 * Decodes a cursor string into date and ObjectId
 * @param {string} cursorStr
 * @returns {{ createdAt: Date, _id: mongoose.Types.ObjectId } | null}
 */
function decodeCursor(cursorStr) {
  if (!cursorStr || typeof cursorStr !== 'string') return null;

  try {
    let clean = cursorStr.trim();
    // Support base64 encoded cursor if provided
    if (!clean.includes('_') && /^[A-Za-z0-9+/=]+$/.test(clean)) {
      try {
        clean = Buffer.from(clean, 'base64').toString('utf8');
      } catch (_) {}
    }

    const lastUnderscore = clean.lastIndexOf('_');
    if (lastUnderscore === -1) return null;

    const datePart = clean.substring(0, lastUnderscore);
    const idPart = clean.substring(lastUnderscore + 1);

    const date = new Date(datePart);
    if (isNaN(date.getTime())) return null;

    if (!mongoose.Types.ObjectId.isValid(idPart)) return null;
    const objectId = new mongoose.Types.ObjectId(idPart);

    return { createdAt: date, _id: objectId };
  } catch (_) {
    return null;
  }
}

/**
 * Builds cursor condition object for MongoDB query
 * @param {string} cursorStr
 * @param {number} sortOrder - -1 for descending (newest first), 1 for ascending (oldest first)
 * @returns {Object|null}
 */
function buildCursorQuery(cursorStr, sortOrder = -1) {
  const decoded = decodeCursor(cursorStr);
  if (!decoded) return null;

  const { createdAt, _id } = decoded;

  if (sortOrder === -1) {
    // Newer first: fetch items strictly older than the cursor
    return {
      $or: [
        { createdAt: { $lt: createdAt } },
        { createdAt: createdAt, _id: { $lt: _id } },
      ],
    };
  } else {
    // Older first: fetch items strictly newer than the cursor
    return {
      $or: [
        { createdAt: { $gt: createdAt } },
        { createdAt: createdAt, _id: { $gt: _id } },
      ],
    };
  }
}

/**
 * Executes cursor pagination on a Mongoose Model
 * Falls back to page-based skip/limit when cursor is omitted and page is passed.
 *
 * @param {mongoose.Model} Model
 * @param {Object} options
 * @returns {Promise<{ items: Array, nextCursor: string|null, hasMore: boolean, total?: number }>}
 */
async function executeCursorPagination(Model, options = {}) {
  const {
    baseQuery = {},
    cursor = null,
    page = null,
    limit = 20,
    sortOrder = -1,
    select = '',
    populate = [],
    countTotal = false,
  } = options;

  const parsedLimit = Math.min(Math.max(1, parseInt(limit, 10) || 20), 100);

  // If a valid cursor is provided, use deterministic cursor pagination
  const cursorFilter = cursor ? buildCursorQuery(cursor, sortOrder) : null;

  if (cursorFilter || !page) {
    const query = cursorFilter ? { $and: [baseQuery, cursorFilter] } : baseQuery;

    let mongoQuery = Model.find(query)
      .sort({ createdAt: sortOrder, _id: sortOrder })
      .limit(parsedLimit + 1); // Query 1 extra item to determine hasMore in a single query

    if (select) mongoQuery = mongoQuery.select(select);
    if (populate.length > 0) {
      populate.forEach((pop) => {
        mongoQuery = mongoQuery.populate(pop);
      });
    }

    const items = await mongoQuery.exec();
    const hasMore = items.length > parsedLimit;
    if (hasMore) {
      items.pop(); // Remove the extra probe item
    }

    const lastItem = items.length > 0 ? items[items.length - 1] : null;
    const nextCursor = hasMore && lastItem ? encodeCursor(lastItem) : null;

    let total = undefined;
    if (countTotal) {
      total = await Model.countDocuments(baseQuery);
    }

    return {
      items,
      nextCursor,
      hasMore,
      limit: parsedLimit,
      ...(total !== undefined ? { total } : {}),
    };
  }

  // Legacy fallback: page & skip based
  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const skip = (parsedPage - 1) * parsedLimit;

  let mongoQuery = Model.find(baseQuery)
    .sort({ createdAt: sortOrder, _id: sortOrder })
    .skip(skip)
    .limit(parsedLimit + 1);

  if (select) mongoQuery = mongoQuery.select(select);
  if (populate.length > 0) {
    populate.forEach((pop) => {
      mongoQuery = mongoQuery.populate(pop);
    });
  }

  const items = await mongoQuery.exec();
  const hasMore = items.length > parsedLimit;
  if (hasMore) {
    items.pop();
  }

  const lastItem = items.length > 0 ? items[items.length - 1] : null;
  const nextCursor = hasMore && lastItem ? encodeCursor(lastItem) : null;

  let total = undefined;
  if (countTotal) {
    total = await Model.countDocuments(baseQuery);
  }

  return {
    items,
    nextCursor,
    hasMore,
    page: parsedPage,
    limit: parsedLimit,
    ...(total !== undefined ? { total } : {}),
  };
}

module.exports = {
  encodeCursor,
  decodeCursor,
  buildCursorQuery,
  executeCursorPagination,
};
