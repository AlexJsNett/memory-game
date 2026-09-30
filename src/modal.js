import { el } from './dom.js';

const SCROLL_LOCK_CLASS = 'scroll-locked';

/**
 * Shared modal shell for every dialog in the app.
 * Content is passed to open(); the shell only knows how to show and hide it.
 * Escape and backdrop click close the dialog, cleanup runs in the "close" event
 * so it also works for the native Escape handling of <dialog>.
 */
export function createModal() {
  const content = el('div', { className: 'modal__content' });
  const dialog = el('dialog', { className: 'modal' }, content);
  let pointerStartedOnBackdrop = false;

  dialog.addEventListener('pointerdown', (event) => {
    pointerStartedOnBackdrop = event.target === dialog;
  });

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog && pointerStartedOnBackdrop) close();
  });

  dialog.addEventListener('close', () => {
    document.body.classList.remove(SCROLL_LOCK_CLASS);
    content.replaceChildren();
  });

  function open(node) {
    content.replaceChildren(node);
    document.body.classList.add(SCROLL_LOCK_CLASS);
    if (!dialog.open) dialog.showModal();
  }

  function close() {
    if (dialog.open) dialog.close();
  }

  return { element: dialog, open, close };
}

/** Builds content shared by all modals: title, body and a row of buttons. */
export function createModalContent({ title, body, actions }) {
  return el(
    'div',
    { className: 'modal__box' },
    el('h2', { className: 'modal__title', text: title }),
    body,
    el('div', { className: 'modal__actions' }, ...actions),
  );
}
