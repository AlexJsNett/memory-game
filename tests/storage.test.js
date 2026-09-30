import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatDate, loadResults, saveResult, sortResults, STORAGE_KEY } from '../src/storage.js';

function fakeStorage(initial = {}) {
  const data = { ...initial };
  return {
    getItem: (key) => data[key] ?? null,
    setItem: (key, value) => {
      data[key] = value;
    },
  };
}

test('sorts by moves, then earlier game first', () => {
  const sorted = sortResults([
    { moves: 12, ts: 5 },
    { moves: 10, ts: 9 },
    { moves: 10, ts: 3 },
  ]);
  assert.deepEqual(sorted, [
    { moves: 10, ts: 3 },
    { moves: 10, ts: 9 },
    { moves: 12, ts: 5 },
  ]);
});

test('formats date as DD.MM.YYYY with zero padding', () => {
  assert.equal(formatDate(new Date(2026, 2, 5, 13, 45).getTime()), '05.03.2026');
});

test('keeps only 10 best results', () => {
  const storage = fakeStorage();
  for (let moves = 30; moves >= 15; moves -= 1) saveResult(moves, moves, storage);
  const results = loadResults(storage);
  assert.equal(results.length, 10);
  assert.equal(results[0].moves, 15);
  assert.equal(results[9].moves, 24);
});

test('broken storage data gives empty leaderboard', () => {
  assert.deepEqual(loadResults(fakeStorage({ [STORAGE_KEY]: '{oops' })), []);
  assert.deepEqual(loadResults(fakeStorage({ [STORAGE_KEY]: '{"a":1}' })), []);
  assert.deepEqual(loadResults(fakeStorage({ [STORAGE_KEY]: '[{"moves":"x"}]' })), []);
});

test('save does not throw when storage fails', () => {
  const storage = {
    getItem: () => null,
    setItem: () => {
      throw new Error('quota');
    },
  };
  assert.doesNotThrow(() => saveResult(12, 1, storage));
});
