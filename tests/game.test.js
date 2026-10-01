import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createGame, shuffle, STATUS, PAIRS_TOTAL } from '../src/game.js';

const IMAGES = Array.from({ length: PAIRS_TOTAL }, (_, i) => ({ id: `img${i}` }));

function setup(delay = 20) {
  let state;
  const wins = [];
  const game = createGame({
    images: IMAGES,
    delay,
    onChange: (next) => {
      state = next;
    },
    onWin: (moves) => wins.push(moves),
  });
  game.newGame();
  return { game, wins, get: () => state };
}

const findPair = (cards) => {
  const first = cards.findIndex((c) => !c.isMatched);
  const second = cards.findIndex((c, i) => i !== first && !c.isMatched && c.imageId === cards[first].imageId);
  return [first, second];
};

const findMismatch = (cards) => {
  const first = cards.findIndex((c) => !c.isMatched);
  const second = cards.findIndex((c, i) => i !== first && !c.isMatched && c.imageId !== cards[first].imageId);
  return [first, second];
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

test('shuffle keeps all items', () => {
  const input = [1, 2, 3, 4, 5];
  assert.deepEqual([...shuffle(input)].sort(), input);
});

test('new game has 16 closed cards and zero counters', () => {
  const { get } = setup();
  assert.equal(get().cards.length, 16);
  assert.ok(get().cards.every((c) => !c.isOpen && !c.isMatched));
  assert.equal(get().moves, 0);
  assert.equal(get().pairs, 0);
});

test('match keeps cards open and counts move and pair', () => {
  const { game, get } = setup();
  const [a, b] = findPair(get().cards);
  game.flip(a);
  assert.equal(get().moves, 0);
  game.flip(b);
  assert.equal(get().moves, 1);
  assert.equal(get().pairs, 1);
  assert.ok(get().cards[a].isOpen && get().cards[b].isMatched);
});

test('same card twice is ignored', () => {
  const { game, get } = setup();
  game.flip(0);
  game.flip(0);
  assert.equal(get().moves, 0);
});

test('mismatch locks board and closes after delay', async () => {
  const { game, get } = setup(20);
  const [a, b] = findMismatch(get().cards);
  game.flip(a);
  game.flip(b);
  assert.equal(get().status, STATUS.LOCKED_BY_MISMATCH);
  assert.equal(get().moves, 1);

  const other = get().cards.findIndex((c, i) => i !== a && i !== b);
  game.flip(other);
  assert.equal(get().cards[other].isOpen, false);

  await wait(40);
  assert.equal(get().status, STATUS.PLAYING);
  assert.ok(!get().cards[a].isOpen && !get().cards[b].isOpen);
});

test('new game during mismatch resets immediately and cancels timer', async () => {
  const { game, get } = setup(20);
  const [a, b] = findMismatch(get().cards);
  game.flip(a);
  game.flip(b);
  game.newGame();
  assert.equal(get().status, STATUS.PLAYING);
  assert.equal(get().moves, 0);

  game.flip(0);
  await wait(40);
  assert.ok(get().cards[0].isOpen, 'stale timer must not close cards of the new game');
});

test('finding all pairs wins once with move count', () => {
  const { game, wins, get } = setup();
  for (let i = 0; i < PAIRS_TOTAL; i += 1) {
    const [a, b] = findPair(get().cards);
    game.flip(a);
    game.flip(b);
  }
  assert.equal(get().status, STATUS.WON);
  assert.deepEqual(wins, [PAIRS_TOTAL]);

  game.flip(0);
  assert.equal(get().moves, PAIRS_TOTAL);
});
