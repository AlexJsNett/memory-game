import { el } from './dom.js';
import { createModalContent } from './modal.js';
import { formatDate, isSamePlayer } from './storage.js';

function button(text, onClick, className = 'button') {
  return el('button', { className, text, attrs: { type: 'button' }, on: { click: onClick } });
}

function createTable(headings, rows) {
  return el(
    'table',
    { className: 'results' },
    el(
      'thead',
      {},
      el('tr', {}, ...headings.map((text) => el('th', { text, attrs: { scope: 'col' } }))),
    ),
    el('tbody', {}, ...rows),
  );
}

function createRow(cells, isCurrent) {
  return el(
    'tr',
    { className: isCurrent ? 'is-current' : '' },
    ...cells.map((text) => el('td', { text: String(text) })),
  );
}

export function createWinContent({ moves, playerName, onNewGame, onClose }) {
  return createModalContent({
    title: 'Победа!',
    body: el('p', {
      className: 'modal__text',
      text: `${playerName}, вы нашли все пары за ${moves} ходов.`,
    }),
    actions: [
      button('Новая игра', onNewGame, 'button button--primary'),
      button('Закрыть', onClose),
    ],
  });
}

function createResultsTable(results, currentName) {
  return createTable(
    ['Место', 'Игрок', 'Ходы', 'Дата'],
    results.map((result, index) =>
      createRow(
        [index + 1, result.name, result.moves, formatDate(result.ts)],
        isSamePlayer(result.name, currentName),
      ),
    ),
  );
}

function createPlayersTable(players, currentName) {
  return createTable(
    ['Игрок', 'Побед', 'Лучший', 'Средний'],
    players.map((player) =>
      createRow(
        [player.name, player.wins, player.best, (player.total / player.wins).toFixed(1)],
        isSamePlayer(player.name, currentName),
      ),
    ),
  );
}

export function createLeaderboardContent({ results, players, currentName, onClose }) {
  const body = results.length
    ? el(
        'div',
        {},
        createResultsTable(results, currentName),
        el('h3', { className: 'modal__subtitle', text: 'Сравнение игроков' }),
        createPlayersTable(players, currentName),
      )
    : el('p', { className: 'modal__text', text: 'Пока нет результатов' });

  return createModalContent({
    title: 'Таблица лидеров',
    body,
    actions: [button('Закрыть', onClose)],
  });
}
