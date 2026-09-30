export const PAIRS_TOTAL = 8;
export const MISMATCH_DELAY = 1000;

export const STATUS = {
  PLAYING: 'playing',
  CHECKING: 'checking',
  WON: 'won',
};

export function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function buildDeck(images) {
  const pairs = images.flatMap((image) => [image, image]);
  return shuffle(pairs).map((image, index) => ({
    uid: index,
    imageId: image.id,
    isOpen: false,
    isMatched: false,
  }));
}

export function createGame({ images, onChange, onWin, delay = MISMATCH_DELAY }) {
  let state;
  let firstIndex = null;
  let timerId = null;
  let gameId = 0;

  function emit() {
    onChange(state);
  }

  function newGame() {
    clearTimeout(timerId);
    timerId = null;
    firstIndex = null;
    gameId += 1;
    state = {
      gameId,
      status: STATUS.PLAYING,
      cards: buildDeck(images),
      moves: 0,
      pairs: 0,
    };
    emit();
  }

  function closeMismatch(id, indexes) {
    if (id !== gameId) return;
    for (const index of indexes) {
      state.cards[index].isOpen = false;
    }
    timerId = null;
    state.status = STATUS.PLAYING;
    emit();
  }

  function flip(index) {
    const card = state.cards[index];
    if (state.status !== STATUS.PLAYING) return;
    if (!card || card.isOpen || card.isMatched) return;

    card.isOpen = true;

    if (firstIndex === null) {
      firstIndex = index;
      emit();
      return;
    }

    const first = state.cards[firstIndex];
    const pair = [firstIndex, index];
    firstIndex = null;
    state.moves += 1;

    if (first.imageId === card.imageId) {
      first.isMatched = true;
      card.isMatched = true;
      state.pairs += 1;

      if (state.pairs === PAIRS_TOTAL) {
        state.status = STATUS.WON;
        emit();
        onWin(state.moves);
        return;
      }
      emit();
      return;
    }

    state.status = STATUS.CHECKING;
    const id = gameId;
    timerId = setTimeout(() => closeMismatch(id, pair), delay);
    emit();
  }

  return { newGame, flip };
}
