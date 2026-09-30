export const STORAGE_KEY = 'rss-memory-game:leaderboard';
export const LEADERBOARD_SIZE = 10;

/** Fewer moves first, earlier game first on a tie. */
export function sortResults(results) {
  return [...results].sort((a, b) => a.moves - b.moves || a.ts - b.ts);
}

/** DD.MM.YYYY in local time. */
export function formatDate(ts) {
  const date = new Date(ts);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}.${month}.${date.getFullYear()}`;
}

function isValidResult(item) {
  return (
    item !== null &&
    typeof item === 'object' &&
    Number.isFinite(item.moves) &&
    Number.isFinite(item.ts)
  );
}

export function loadResults(storage = globalThis.localStorage) {
  try {
    const parsed = JSON.parse(storage.getItem(STORAGE_KEY));
    if (!Array.isArray(parsed)) return [];
    return sortResults(parsed.filter(isValidResult)).slice(0, LEADERBOARD_SIZE);
  } catch {
    return [];
  }
}

export function saveResult(moves, ts = Date.now(), storage = globalThis.localStorage) {
  const results = sortResults([...loadResults(storage), { moves, ts }]).slice(0, LEADERBOARD_SIZE);
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(results));
  } catch {
    // storage is unavailable or full: the game keeps working without a leaderboard
  }
  return results;
}
