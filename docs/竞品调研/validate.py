import json,re
from pathlib import Path
from urllib.parse import unquote
ROOT=Path(__file__).resolve().parent
def links():
 for f in ROOT.rglob('*.md'):
  for link in re.findall(r'\[[^\]]*\]\(([^)]+)\)',f.read_text()):
   if link.startswith(('https:','http:','#','mailto:')):continue
   path=unquote(link.split('#')[0])
   assert (f.parent/path).exists(),f'{f}: missing {path}'

d=json.loads((ROOT/'competitor-review.json').read_text())
assert len(d['products'])==8 and len(d['dimensions'])==9
ids=[p['id'] for p in d['products']];assert len(set(ids))==8
known={s[0] for s in d['sources']}
for p in d['products']:
 assert set(p['fields'])==set(d['dimensions'])
 for v in p['fields'].values():
  assert set(v)=={'zh','en'} and all(v.values())
  for text in v.values():
   for group in re.findall(r'\[([A-Z][A-Z0-9, ]*)\]',text):
    assert all(k.strip() in known for k in group.split(','))
links()
print('PASS: 8 products, 9 paired dimensions, source codes and local links')
