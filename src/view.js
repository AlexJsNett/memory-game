import { el } from './dom.js';
import { PAIRS_TOTAL, STATUS } from './game.js';


function createCard(card, index, image) {
  return el(
    'button',
    { className: 'card', attrs: { type: 'button' }, dataset: { index: String(index) } },
    el(
      'div',
      { className: 'card__inner', attrs: { 'aria-hidden': 'true' } },
      el('div', { className: 'card__side card__cover' }),
      el(
        'div',
        { className: 'card__side card__face' },
        el('img', { className: 'card__img', attrs: { src: image.src, alt: '', draggable: 'false' } }),
      ),
    ),
  );
}

function updateCard(node, card, index, image) {
  const isVisible = card.isOpen || card.isMatched;
  node.classList.toggle('is-open', isVisible);
  node.classList.toggle('is-matched', card.isMatched);
  node.setAttribute(
    'aria-label',
    isVisible ? `Карта ${index + 1}: ${image.alt}` : `Карта ${index + 1}, закрыта`,
  );
  node.setAttribute('aria-disabled', String(isVisible));
}

/**
 * Builds the whole UI with createElement.
 * Returns the root element and render(state) which syncs the DOM with the game state.
 */
export function createView({ images, onNewGame, onLeaderboard, onCardClick }) {
  const imageById = new Map(images.map((image) => [image.id, image]));

  const movesValue = el('span', { className: 'stats__value', text: '0' });
  const pairsValue = el('span', { className: 'stats__value', text: `0 из ${PAIRS_TOTAL}` });
  const board = el('div', { className: 'board', attrs: { role: 'group', 'aria-label': 'Игровое поле' } });
  let renderedGameId = null;

  board.addEventListener('click', (event) => {
    const cardNode = event.target.closest('.card');
    if (cardNode) onCardClick(Number(cardNode.dataset.index));
  });

  const root = el(
    'div',
    { className: 'app' },
    el(
      'header',
      { className: 'header' },
      el('h1', { className: 'header__title', text: 'Memory Game' }),
      el(
        'div',
        { className: 'header__buttons' },
        el('button', {
          className: 'button button--primary',
          text: 'Новая игра',
          attrs: { type: 'button' },
          on: { click: onNewGame },
        }),
        el('button', {
          className: 'button',
          text: 'Таблица лидеров',
          attrs: { type: 'button' },
          on: { click: onLeaderboard },
        }),
      ),
    ),
    el(
      'main',
      { className: 'main' },
      el(
        'div',
        { className: 'stats', attrs: { 'aria-live': 'polite' } },
        el('p', { className: 'stats__item' }, 'Ходы: ', movesValue),
        el('p', { className: 'stats__item' }, 'Пары: ', pairsValue),
      ),
      board,
    ),
  );

  function render(state) {
    if (renderedGameId !== state.gameId) {
      board.replaceChildren(
        ...state.cards.map((card, index) => createCard(card, index, imageById.get(card.imageId))),
      );
      renderedGameId = state.gameId;
    }

    state.cards.forEach((card, index) => {
      updateCard(board.children[index], card, index, imageById.get(card.imageId));
    });

    board.classList.toggle('is-locked', state.status !== STATUS.PLAYING);
    movesValue.textContent = String(state.moves);
    pairsValue.textContent = `${state.pairs} из ${PAIRS_TOTAL}`;
  }

  return { element: root, render };
}
