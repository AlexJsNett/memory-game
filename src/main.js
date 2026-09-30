import { CARD_IMAGES } from './cards.js';
import { createGame } from './game.js';
import { createModal } from './modal.js';
import { createLeaderboardContent, createWinContent } from './screens.js';
import { loadResults, saveResult } from './storage.js';
import { createView } from './view.js';

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
  images: CARD_IMAGES,
  onNewGame: startNewGame,
  onLeaderboard: showLeaderboard,
  onCardClick: (index) => game.flip(index),
});

const game = createGame({
  images: CARD_IMAGES,
  onChange: view.render,
  onWin: showWin,
});

document.body.append(view.element, modal.element);
game.newGame();
