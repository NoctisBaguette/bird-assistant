import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(resolve(root, 'dist/index.html'), 'utf8');
const css = readFileSync(resolve(root, 'dist/style.css'), 'utf8');
const scrapbookCss = readFileSync(resolve(root, 'dist/scrapbook.css'), 'utf8');
const scrapbookJs = readFileSync(resolve(root, 'dist/scrapbook.js'), 'utf8');
const voiceJs = readFileSync(resolve(root, 'dist/journal-voice.js'), 'utf8');
const recognitionCss = readFileSync(resolve(root, 'dist/recognition.css'), 'utf8');
const recognitionJs = readFileSync(resolve(root, 'dist/recognition.js'), 'utf8');
const experienceCss = readFileSync(resolve(root, 'dist/experience.css'), 'utf8');
const experienceJs = readFileSync(resolve(root, 'dist/experience.js'), 'utf8');
const js = readFileSync(resolve(root, 'dist/app.js'), 'utf8');
if (/<\/script/i.test(js + scrapbookJs + voiceJs + recognitionJs + experienceJs)) throw new Error('Escape embedded script closing tags before packaging.');
const bundled = html.replace('<link rel="stylesheet" href="style.css">', () => `<style>${css}</style>`)
  .replace('<link rel="stylesheet" href="scrapbook.css">', () => `<style>${scrapbookCss}</style>`)
  .replace('<script src="scrapbook.js"></script>', () => `<script>${scrapbookJs}</script>`)
  .replace('<script src="journal-voice.js"></script>', () => `<script>${voiceJs}</script>`)
  .replace('<link rel="stylesheet" href="recognition.css">', () => `<style>${recognitionCss}</style>`)
  .replace('<script src="recognition.js"></script>', () => `<script>${recognitionJs}</script>`)
  .replace('<link rel="stylesheet" href="experience.css">', () => `<style>${experienceCss}</style>`)
  .replace('<script src="experience.js"></script>', () => `<script>${experienceJs}</script>`)
  .replace('<script src="app.js"></script>', () => `<script>${js}</script>`);
writeFileSync(resolve(root, 'dist/bird-assistant-prototype-offline-v0.11.html'), bundled);
process.stdout.write('Offline HTML generated.\n');
