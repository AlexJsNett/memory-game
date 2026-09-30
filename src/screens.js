import { el } from './dom.js';
import { createModalContent } from './modal.js';
import { formatDate } from './storage.js';

function button(text, onClick, className = 'button') {
  return el('button', { className, text, attrs: { type: 'button' }, on: { click: onClick } });
}

export function createWinContent({ moves, onNewGame, onClose }) {
  return createModalContent({
    title: 'Победа!',
    body: el('p', { className: 'modal__text', text: `Вы нашли все пары за ${moves} ходов.` }),
    actions: [
      button('Новая игра', onNewGame, 'button button--primary'),
      button('Закрыть', onClose),
    ],
  });
}

function createResultsTable(results) {
  const head = el(
    'tr',
    {},
    el('th', { text: 'Место', attrs: { scope: 'col' } }),
    el('th', { text: 'Ходы', attrs: { scope: 'col' } }),
    el('th', { text: 'Дата', attrs: { scope: 'col' } }),
  );
  const rows = results.map((result, index) =>
    el(
      'tr',
      {},
      el('td', { text: String(index + 1) }),
      el('td', { text: String(result.moves) }),
      el('td', { text: formatDate(result.ts) }),
    ),
  );

  return el(
    'table',
    { className: 'results' },
    el('thead', {}, head),
    el('tbody', {}, ...rows),
  );
}

export function createLeaderboardContent({ results, onClose }) {
  const body = results.length
    ? createResultsTable(results)
    : el('p', { className: 'modal__text', text: 'Пока нет результатов' });

  return createModalContent({
    title: 'Таблица лидеров',
    body,
    actions: [button('Закрыть', onClose)],
  });
}
