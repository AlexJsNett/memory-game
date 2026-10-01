import { loadCards } from './cards.js';
import { el } from './dom.js';
import { createGame } from './game.js';
import { createModal } from './modal.js';
import { createLeaderboardContent, createWinContent } from './screens.js';
import {
  MAX_NAME_LENGTH,
  loadPlayerName,
  loadPlayerStats,
  loadResults,
  normalizeName,
  savePlayerName,
  saveResult,
} from './storage.js';
import { createView } from './view.js';

function start(images) {
  const modal = createModal();
  let playerName = loadPlayerName();
  let game;

  function startNewGame() {
    modal.close();
    game.newGame();
  }

  function showWinModal(moves, name) {
    modal.open(
      createWinContent({ moves, playerName: name, onNewGame: startNewGame, onClose: modal.close }),
    );
  }

  function handleWin(moves) {
    const name = normalizeName(playerName);
    saveResult({ moves, name });
    showWinModal(moves, name);
  }

  function showLeaderboard() {
    modal.open(
      createLeaderboardContent({
        results: loadResults(),
        players: loadPlayerStats(),
        currentName: playerName,
        onClose: modal.close,
      }),
    );
  }

  function changePlayerName(value) {
    playerName = value;
    savePlayerName(value);
  }

  const view = createView({
    images,
    playerName,
    maxNameLength: MAX_NAME_LENGTH,
    onPlayerNameChange: changePlayerName,
    onNewGame: startNewGame,
    onLeaderboard: showLeaderboard,
    onCardClick: (index) => game.flip(index),
  });

  game = createGame({
    images,
    onChange: view.render,
    onWin: handleWin,
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
