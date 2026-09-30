import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const FORBIDDEN = [
  /\.innerHTML\s*=/,
  /\.outerHTML\s*=/,
  /insertAdjacentHTML/,
  /document\.write(ln)?\s*\(/,
  /DOMParser/,
  /createContextualFragment/,
  /\b(alert|confirm|prompt)\s*\(/,
];

function collect(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? collect(path) : [path];
  });
}

const files = collect('src').filter((file) => file.endsWith('.js'));
let failed = false;

for (const file of files) {
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, index) => {
    for (const pattern of FORBIDDEN) {
      if (pattern.test(line)) {
        failed = true;
        console.error(`${file}:${index + 1}: forbidden ${pattern} -> ${line.trim()}`);
      }
    }
  });
}

const html = readFileSync('index.html', 'utf8');
const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/)?.[1] ?? '';
const withoutScripts = body.replace(/<script[\s\S]*?<\/script>/g, '').trim();
if (withoutScripts) {
  failed = true;
  console.error('index.html: <body> must contain only <script>');
}

if (failed) {
  process.exit(1);
}
console.log(`ok: ${files.length} files checked`);
