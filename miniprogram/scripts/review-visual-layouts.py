"""Measure the current WXML/CSS projection; this is not native camera/map acceptance."""
import asyncio
import json
from pathlib import Path
from playwright.async_api import async_playwright


async def main():
    import argparse
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('directory')
    parser.add_argument('--browser', default='/usr/bin/chromium')
    args = parser.parse_args()
    root = Path(args.directory).resolve()
    results, failures = [], []
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=args.browser, headless=True,
                                         args=['--no-sandbox', '--allow-file-access-from-files'])
        page = await browser.new_page(reduced_motion='reduce')
        for file in sorted(root.glob('*.html')):
            kind, dimensions = file.stem.rsplit('-', 1)
            w, h = map(int, dimensions.split('x'))
            await page.set_viewport_size({'width': w, 'height': h})
            await page.goto(file.as_uri())
            await page.evaluate('document.fonts.ready')
            metrics = await page.evaluate('''() => {
              const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,right:r.right,bottom:r.bottom}};
              const one=s=>{const e=document.querySelector(s);return e?rect(e):null};
              const groups=[...document.querySelectorAll('.record-action-content')].map(e=>({group:rect(e),cell:rect(e.parentElement),icon:rect(e.querySelector('img')),text:rect(e.querySelector('span'))}));
              return {width:document.documentElement.scrollWidth,composer:one('.composer'),history:one('.chat-messages'),chat:one('.chat-page'),nav:one('.chat-heading'),groups,
                share:[...document.querySelectorAll('.record-share-actions>button')].map(rect),
                toggles:[...document.querySelectorAll('.publish-toggle')].map(rect),
                close:[...document.querySelectorAll('.social-sheet-title button,.choice-close,.calendar-close')].map(rect)};
            }''')
            row = {'kind': kind, 'window': [w, h], **metrics}
            results.append(row)
            def fail(reason):
                failures.append({'kind': kind, 'window': [w, h], 'reason': reason})
            if metrics['width'] > w + 2:
                fail('horizontal page overflow')
            if metrics['chat']:
                composer, history = metrics['composer'], metrics['history']
                if not composer or composer['bottom'] > h + 1 or abs(composer['bottom'] - h) > 2:
                    fail('composer is not at the bottom of the available window')
                if not history or history['h'] < 10 or (composer and history['bottom'] > composer['y'] + 1):
                    fail('message history overlaps the composer or has no space')
            for group in metrics['groups']:
                if group['icon']['right'] > group['text']['x'] - 3:
                    fail('reaction icon/text gap collapsed')
                if abs(group['group']['x'] + group['group']['w']/2 - group['cell']['x'] - group['cell']['w']/2) > 2:
                    fail('reaction content is not centered in its cell')
            if len(metrics['share']) == 2 and metrics['share'][1]['y'] - metrics['share'][0]['bottom'] < 8:
                fail('share actions have no vertical spacing')
            for close in metrics['close']:
                if abs(close['w'] - close['h']) > 1:
                    fail('close control is squashed')
            for toggle in metrics['toggles']:
                if abs(toggle['w'] - 42) > 1 or abs(toggle['h'] - 26) > 1:
                    fail('publication switch was squeezed by its label')
            if w in (320, 365, 768) and kind in ('chat', 'chatEmpty', 'friends', 'noteList', 'publish', 'review', 'threadedPost', 'journalDeck', 'mapIdle', 'profile', 'groupSettings'):
                await page.screenshot(path=str(root / f'{kind}-{w}.png'), scale='css')
        await browser.close()
    (root/'visual-layout-metrics.json').write_text(json.dumps(results, ensure_ascii=False, indent=2))
    (root/'visual-layout-result.json').write_text(json.dumps({'cases': len(results), 'failures': failures}, ensure_ascii=False, indent=2))
    print(json.dumps({'cases': len(results), 'failures': failures}, ensure_ascii=False), flush=True)
    if failures:
        raise SystemExit(1)


asyncio.run(main())
