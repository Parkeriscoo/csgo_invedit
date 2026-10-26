// Minimal Valve KeyValues parser; duplicate keys keep the last value.
export function parseKeyValues(text) {
  const root = {}, stack = [root];
  let key = null, i = 0;
  const n = text.length;
  while (i < n) {
    const c = text[i];
    if (c === '/' && text[i + 1] === '/') { while (i < n && text[i] !== '\n') i++; continue; }
    if (c === '{') {
      const child = {};
      stack.at(-1)[key] = child; stack.push(child); key = null; i++; continue;
    }
    if (c === '}') {
      if (stack.length < 2) throw new Error('Unbalanced braces in items_game.txt.');
      stack.pop(); key = null; i++; continue;
    }
    if (c === '"') {
      let value = '';
      i++;
      while (i < n && text[i] !== '"') {
        if (text[i] === '\\' && i + 1 < n) i++;
        value += text[i++];
      }
      i++;
      if (key === null) key = value;
      else { stack.at(-1)[key] = value; key = null; }
      continue;
    }
    i++;
  }
  if (stack.length !== 1) throw new Error('Unbalanced braces in items_game.txt.');
  return root;
}

export function parseItemsGame(text) {
  const root = parseKeyValues(text).items_game;
  if (!root?.items) throw new Error('This does not look like an items_game.txt file.');
  const ids = section => new Set(Object.keys(root[section] ?? {}).filter(k => /^\d+$/.test(k)).map(Number));
  return { items: ids('items'), paintKits: ids('paint_kits'), stickerKits: ids('sticker_kits') };
}
