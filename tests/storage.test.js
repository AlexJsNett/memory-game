import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_NAME,
  STATS_KEY,
  STORAGE_KEY,
  formatDate,
  loadPlayerName,
  loadPlayerStats,
  loadResults,
  normalizeName,
  savePlayerName,
  saveResult,
  sortResults,
} from '../src/storage.js';

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
  for (let moves = 30; moves >= 15; moves -= 1) saveResult({ moves, name: 'A', ts: moves }, storage);
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
  assert.doesNotThrow(() => saveResult({ moves: 12, name: 'A', ts: 1 }, storage));
});

test('result keeps player name, empty name becomes default', () => {
  const storage = fakeStorage();
  saveResult({ moves: 10, name: '  Алекс  ', ts: 1 }, storage);
  saveResult({ moves: 11, name: '   ', ts: 2 }, storage);
  const results = loadResults(storage);
  assert.equal(results[0].name, 'Алекс');
  assert.equal(results[1].name, DEFAULT_NAME);
});

test('old results without a name are still shown', () => {
  const storage = fakeStorage({ [STORAGE_KEY]: '[{"moves":12,"ts":5}]' });
  assert.deepEqual(loadResults(storage), [{ moves: 12, ts: 5, name: DEFAULT_NAME }]);
});

test('name is trimmed and limited to 20 characters', () => {
  assert.equal(normalizeName('x'.repeat(50)).length, 20);
  assert.equal(normalizeName(undefined), DEFAULT_NAME);
});

test('player stats are grouped by name ignoring case', () => {
  const storage = fakeStorage();
  saveResult({ moves: 12, name: 'Ann', ts: 1 }, storage);
  saveResult({ moves: 10, name: 'ann', ts: 2 }, storage);
  saveResult({ moves: 15, name: 'Bob', ts: 3 }, storage);
  const stats = loadPlayerStats(storage);
  assert.deepEqual(stats, [
    { name: 'Ann', wins: 2, best: 10, total: 22 },
    { name: 'Bob', wins: 1, best: 15, total: 15 },
  ]);
});

test('stats keep games that fell out of top 10', () => {
  const storage = fakeStorage();
  for (let moves = 8; moves < 22; moves += 1) saveResult({ moves, name: 'Ann', ts: moves }, storage);
  assert.equal(loadResults(storage).length, 10);
  assert.equal(loadPlayerStats(storage)[0].wins, 14);
});

test('broken stats data gives empty list', () => {
  assert.deepEqual(loadPlayerStats(fakeStorage({ [STATS_KEY]: '{oops' })), []);
  assert.deepEqual(loadPlayerStats(fakeStorage({ [STATS_KEY]: '[{"name":1}]' })), []);
});

test('player name is saved and loaded', () => {
  const storage = fakeStorage();
  assert.equal(loadPlayerName(storage), '');
  savePlayerName('  Ann ', storage);
  assert.equal(loadPlayerName(storage), 'Ann');
});
