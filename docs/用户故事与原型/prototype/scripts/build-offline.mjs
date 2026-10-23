import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(resolve(root, 'dist/index.html'), 'utf8');
const css = readFileSync(resolve(root, 'dist/style.css'), 'utf8');
const js = readFileSync(resolve(root, 'dist/app.js'), 'utf8');
if (/<\/script/i.test(js)) throw new Error('Escape embedded script closing tags before packaging.');
const bundled = html.replace('<link rel="stylesheet" href="style.css">', () => `<style>${css}</style>`)
  .replace('<script src="app.js"></script>', () => `<script>${js}</script>`);
writeFileSync(resolve(root, 'dist/bird-assistant-prototype-offline-v0.5.html'), bundled);
process.stdout.write('Offline HTML generated.\n');
