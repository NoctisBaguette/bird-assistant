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

a=json.loads((ROOT/'story-design.en.json').read_text())
b=json.loads((ROOT/'story-design.zh-CN.json').read_text())
assert len(a['stories'])==len(b['stories'])==19
assert len(a['screens'])==len(b['screens'])==28
for key in ('stories','screens'):
 ids=[x['id'] for x in a[key]]
 assert len(ids)==len(set(ids))
 assert ids==[x['id'] for x in b[key]]
stories={s['id'] for s in a['stories']};screens={s['id'] for s in a['screens']}
for x,y in zip(a['stories'],b['stories']):
 assert x['pages']==y['pages']
 assert all(p in screens for p in x['pages'])
 assert len(x['conditions'])==len(y['conditions']) and x['conditions']
 for k in ('priority','difficulty'):
  assert x[k]==y[k] or {'High':'高','Medium':'中','Low':'低'}.get(x[k])==y[k]
for x in a['screens']:assert set(x['stories'])<=stories
for k in ('rules','backlog'):assert [x[0] for x in a[k]]==[x[0] for x in b[k]]
links()
print('PASS: 19 paired stories, 28 paired screens, references and local links')
