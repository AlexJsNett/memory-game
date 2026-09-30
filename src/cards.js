export async function loadCards() {
  const response = await fetch('./data/cards.json');
  if (!response.ok) {
    throw new Error(`Failed to load cards: ${response.status}`);
  }
  return response.json();
}
