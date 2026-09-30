import { loadCards } from './cards.js';
import { el } from './dom.js';
import { createGame } from './game.js';
import { createModal } from './modal.js';
import { createLeaderboardContent, createWinContent } from './screens.js';
import { loadResults, saveResult } from './storage.js';
import { createView } from './view.js';

function start(images) {
  const modal = createModal();

  function startNewGame() {
    modal.close();
    game.newGame();
  }

  function showWin(moves) {
    saveResult(moves);
    modal.open(createWinContent({ moves, onNewGame: startNewGame, onClose: modal.close }));
  }

  function showLeaderboard() {
    modal.open(createLeaderboardContent({ results: loadResults(), onClose: modal.close }));
  }

  const view = createView({
    images,
    onNewGame: startNewGame,
    onLeaderboard: showLeaderboard,
    onCardClick: (index) => game.flip(index),
  });

  const game = createGame({
    images,
    onChange: view.render,
    onWin: showWin,
  });

  document.body.append(view.element, modal.element);
  game.newGame();
}

function showError(error) {
  document.body.append(
    el('p', { className: 'app-error', text: 'Не удалось загрузить игру. Обновите страницу.' }),
  );
  console.error(error);
}

loadCards().then(start).catch(showError);
