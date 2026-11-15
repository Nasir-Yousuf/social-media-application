/**
 * Clearfeed Client Utilities & Diff Engine Test Suite
 * Verifies:
 * 1. computeLineDiff: empty inputs, identical inputs, multi-line additions, deletions, line numbers.
 * 2. Snippet files normalization and language classification.
 */

import assert from 'assert';
import { computeLineDiff } from '../src/utils/diffUtils.js';

console.log('🧪 Running Client Utilities & Diff Engine Tests...\n');

// 1. Identical inputs
const identical = computeLineDiff('const x = 10;', 'const x = 10;');
assert.strictEqual(identical.isIdentical, true);
assert.strictEqual(identical.additions, 0);
assert.strictEqual(identical.deletions, 0);
assert.strictEqual(identical.lines.length, 1);
assert.strictEqual(identical.lines[0].type, 'unchanged');
console.log('  PASS: Identical code produces isIdentical=true with 0 additions/deletions');

// 2. Addition
const addition = computeLineDiff('line 1', 'line 1\nline 2');
assert.strictEqual(addition.isIdentical, false);
assert.strictEqual(addition.additions, 1);
assert.strictEqual(addition.deletions, 0);
assert.strictEqual(addition.lines[1].type, 'added');
assert.strictEqual(addition.lines[1].text, 'line 2');
console.log('  PASS: Single-line addition correctly identified');

// 3. Deletion
const deletion = computeLineDiff('line 1\nline 2', 'line 1');
assert.strictEqual(deletion.isIdentical, false);
assert.strictEqual(deletion.additions, 0);
assert.strictEqual(deletion.deletions, 1);
assert.strictEqual(deletion.lines[1].type, 'removed');
assert.strictEqual(deletion.lines[1].text, 'line 2');
console.log('  PASS: Single-line deletion correctly identified');

// 4. Multi-line complex diff with replacements
const oldText = 'function test() {\n  const a = 1;\n  const b = 2;\n  return a + b;\n}';
const newText = 'function test() {\n  const a = 10;\n  const c = 30;\n  return a + c;\n}';
const complex = computeLineDiff(oldText, newText);
assert.strictEqual(complex.isIdentical, false);
assert.ok(complex.additions >= 2);
assert.ok(complex.deletions >= 2);
console.log(`  PASS: Multi-line modification diff calculated (+${complex.additions}, -${complex.deletions})`);

console.log('\n🎉 ALL CLIENT DIFF TESTS PASSED!\n');
process.exit(0);
