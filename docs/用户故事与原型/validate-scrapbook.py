import json
from pathlib import Path
root=Path(__file__).resolve().parent
a=json.loads((root/'scrapbook-design.en.json').read_text())
b=json.loads((root/'scrapbook-design.zh-CN.json').read_text())
assert a['version']==b['version']=='0.8'
for key,count in [('stories',6),('screens',8)]:
 assert len(a[key])==len(b[key])==count
 assert [x['id'] for x in a[key]]==[x['id'] for x in b[key]]
 assert len({x['id'] for x in a[key]})==count
screens={x['id'] for x in a['screens']}
stories={x['id'] for x in a['stories']}
for x,y in zip(a['stories'],b['stories']):
 assert x['pages']==y['pages'] and set(x['pages'])<=screens
 assert x['priority']==y['priority'] and x['difficulty']==y['difficulty']
 assert len(x['conditions'])==len(y['conditions'])>=4
 for item,path in [(x,root/'en/09-scrapbook-design.md'),(y,root/'08-scrapbook-design.md')]:
  doc=path.read_text()
  assert item['title'] in doc
  assert all(c in doc for c in item['conditions'])
for x in a['screens']:assert set(x['stories'])<=stories
print('PASS: 6 paired journal stories, 8 screens/states and acceptance parity')
