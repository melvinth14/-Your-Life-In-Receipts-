import test from 'node:test';
import assert from 'node:assert/strict';
import { clean, parseCsv, safeDate } from '../src/data/csv.js';
import { categoryLabel, filterReceipts } from '../src/domain/receipts.js';

test('parseCsv preserves commas inside quoted cells', () => {
  const rows = parseCsv('name,note\n"Cafe, Central","A small receipt"\n');

  assert.deepEqual(rows, [{ name: 'Cafe, Central', note: 'A small receipt' }]);
});

test('parseCsv trims values and skips blank rows', () => {
  const rows = parseCsv(' name , value \n first , 42 \n\n');

  assert.deepEqual(rows, [{ name: 'first', value: '42' }]);
});

test('safeDate returns null for invalid input', () => {
  assert.equal(safeDate('not a date'), null);
  assert.ok(safeDate('2024-01-20 20:00'));
});

test('clean uses fallback only for empty and null-like values', () => {
  assert.equal(clean('', 'fallback'), 'fallback');
  assert.equal(clean('null', 'fallback'), 'fallback');
  assert.equal(clean('music', 'fallback'), 'music');
});

test('filterReceipts searches and sorts without mutating the source array', () => {
  const newest = { name: 'Midnight City', sub: 'M83', category: 'music', place: '', type: 'music', date: new Date('2024-02-01') };
  const oldest = { name: 'Morning Train', sub: 'travel', category: 'travel', place: 'Pune', type: 'money', date: new Date('2023-02-01') };
  const receipts = [oldest, newest];

  assert.deepEqual(filterReceipts(receipts, { filter: 'music', query: 'midnight' }), [newest]);
  assert.deepEqual(filterReceipts(receipts), [newest, oldest]);
  assert.deepEqual(receipts, [oldest, newest]);
  assert.equal(categoryLabel('fitness_and_medical'), 'Fitness And Medical');
});