export function el(tag, options = {}, ...children) {
  const { className, text, attrs, dataset, on } = options;
  const node = document.createElement(tag);

  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;

  for (const [name, value] of Object.entries(attrs ?? {})) {
    node.setAttribute(name, value);
  }
  for (const [key, value] of Object.entries(dataset ?? {})) {
    node.dataset[key] = value;
  }
  for (const [event, handler] of Object.entries(on ?? {})) {
    node.addEventListener(event, handler);
  }

  node.append(...children);
  return node;
}
