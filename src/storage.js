export const STORAGE_KEY = 'rss-memory-game:leaderboard';
export const PLAYER_KEY = 'rss-memory-game:player';
export const STATS_KEY = 'rss-memory-game:players';
export const LEADERBOARD_SIZE = 10;
export const MAX_NAME_LENGTH = 20;
export const DEFAULT_NAME = 'Аноним';

export function normalizeName(name) {
  const trimmed = String(name ?? '').trim().slice(0, MAX_NAME_LENGTH);
  return trimmed || DEFAULT_NAME;
}

export function isSamePlayer(a, b) {
  return normalizeName(a).toLowerCase() === normalizeName(b).toLowerCase();
}

export function sortResults(results) {
  return [...results].sort((a, b) => a.moves - b.moves || a.ts - b.ts);
}

export function formatDate(ts) {
  const date = new Date(ts);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}.${month}.${date.getFullYear()}`;
}

function readJson(key, storage) {
  try {
    return JSON.parse(storage.getItem(key));
  } catch {
    return null;
  }
}

function writeJson(key, value, storage) {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {}
}

function isValidResult(item) {
  return (
    item !== null &&
    typeof item === 'object' &&
    Number.isFinite(item.moves) &&
    Number.isFinite(item.ts)
  );
}

function isValidStats(item) {
  return (
    item !== null &&
    typeof item === 'object' &&
    typeof item.name === 'string' &&
    Number.isFinite(item.wins) &&
    Number.isFinite(item.best) &&
    Number.isFinite(item.total)
  );
}

export function loadResults(storage = globalThis.localStorage) {
  const parsed = readJson(STORAGE_KEY, storage);
  if (!Array.isArray(parsed)) return [];
  const results = parsed
    .filter(isValidResult)
    .map((item) => ({ moves: item.moves, ts: item.ts, name: normalizeName(item.name) }));
  return sortResults(results).slice(0, LEADERBOARD_SIZE);
}

export function loadPlayerStats(storage = globalThis.localStorage) {
  const parsed = readJson(STATS_KEY, storage);
  if (!Array.isArray(parsed)) return [];
  return parsed
    .filter(isValidStats)
    .sort((a, b) => a.best - b.best || b.wins - a.wins || a.name.localeCompare(b.name));
}

function addToStats(stats, name, moves) {
  const existing = stats.find((item) => isSamePlayer(item.name, name));
  if (!existing) {
    return [...stats, { name, wins: 1, best: moves, total: moves }];
  }
  return stats.map((item) =>
    item === existing
      ? { ...item, wins: item.wins + 1, best: Math.min(item.best, moves), total: item.total + moves }
      : item,
  );
}

export function saveResult({ moves, name, ts = Date.now() }, storage = globalThis.localStorage) {
  const playerName = normalizeName(name);
  const results = sortResults([...loadResults(storage), { moves, ts, name: playerName }]).slice(
    0,
    LEADERBOARD_SIZE,
  );
  writeJson(STORAGE_KEY, results, storage);
  writeJson(STATS_KEY, addToStats(loadPlayerStats(storage), playerName, moves), storage);
  return results;
}

export function loadPlayerName(storage = globalThis.localStorage) {
  try {
    return storage.getItem(PLAYER_KEY) ?? '';
  } catch {
    return '';
  }
}

export function savePlayerName(name, storage = globalThis.localStorage) {
  try {
    storage.setItem(PLAYER_KEY, String(name).trim().slice(0, MAX_NAME_LENGTH));
  } catch {}
}
