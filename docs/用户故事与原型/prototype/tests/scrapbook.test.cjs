const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
function boot(){
  const store=new Map();
  const ctx={structuredClone,Date,Math,console,document:{addEventListener(){}},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)},
    T:(zh,en)=>zh,L:x=>typeof x==='object'?x.zh:x,esc:x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),
    bird:()=>'<svg viewBox="0 0 220 150"><circle cx="100" cy="75" r="30"/></svg>',sp:c=>c==='unresolved'?'待鉴定':c,render(){},renderApp(){},toast(){},
    push(name){ctx.S.history.push(ctx.S.view);ctx.S.view={name};},replace(name){ctx.S.view={name};},goTab(name){ctx.S.view={name};}};
  vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(__dirname,'../dist/scrapbook.js'),'utf8')+'\nthis.J=J;',ctx);
  ctx.S={journal:ctx.J.state(),view:{name:'journal'},history:[],records:[{id:'mine',owner:'me',species:'unresolved',time:'',notes:'pending note',media:{kind:'photo',color:'#123456'}},{id:'other',owner:'other',species:'tit',time:'2026-10-21',media:{kind:'photo'}},{id:'audio',owner:'me',species:'unresolved',media:{kind:'sound'}}],collect:new Set(['mine','other'])};
  ctx.J.addSamples();
  return {ctx,J:ctx.J,store};
}
const snapshot=x=>JSON.stringify(x);
test('date filtering does not assign unknown capture dates or use others/audio as collection images',()=>{
 const {J}=boot();J.s.source='collection';J.s.from='2026-10-20';J.s.to='2026-10-22';
 assert.equal(J.visibleAssets().length,1);assert.equal(J.visibleAssets()[0].time,'');assert.equal(J.visibleAssets()[0].recordId,'mine');
 J.s.unknown=false;assert.equal(J.visibleAssets().length,0);
 J.s.source='sample';assert.equal(J.visibleAssets().length,4);
});
test('selection order survives filtering and is used by generation',()=>{
 const {J}=boot();J.s.selected=['sample-3','sample-1'];J.s.source='album';assert.equal(J.visibleAssets().length,0);
 assert.equal(J.chosen().map(x=>x.id).join(','),'sample-3,sample-1');
 const d=J.make(J.chosen(),'3:4','nature');assert.equal(d.elements.find(x=>x.type==='photo').asset.id,'sample-3');
});
test('crop confirmation changes only display parameters; cancel preserves the old crop',()=>{
 const {J}=boot();const d=J.make(J.chosen(),'3:4','nature');J.s.current=d;
 const e=d.elements.find(x=>x.type==='photo');J.s.selectedElement=e.id;const original=e.src;
 J.click('j-crop');J.s.crop.zoom=2;J.click('j-crop-cancel');assert.equal(e.crop.zoom,1);assert.equal(e.src,original);
 J.click('j-crop');J.s.crop.zoom=2;J.click('j-crop-confirm');assert.equal(e.crop.zoom,2);assert.equal(e.src,original);
 J.click('j-undo');assert.equal(J.selected().crop.zoom,1);J.click('j-redo');assert.equal(J.selected().crop.zoom,2);
});
test('reflow preview/cancellation retains edits; application and undo restore the entire prior composition',()=>{
 const {J}=boot();const d=J.make(J.chosen(),'3:4','nature');J.s.current=d;
 d.elements.find(e=>e.type==='photo').crop.zoom=2;d.background.color='#abcdef';
 const caption=d.elements.find(e=>e.id.startsWith('caption'));caption.text='人工文字 / custom caption';
 const before=snapshot(d);J.click('j-layout');J.s.ratio='4:3';J.click('j-layout-preview');
 assert.equal(snapshot(J.s.current),before);J.click('j-layout-cancel');assert.equal(snapshot(J.s.current),before);
 J.click('j-layout');J.s.ratio='1:1';J.click('j-layout-preview');J.click('j-layout-apply');
 assert.equal(J.s.current.ratio,'1:1');assert.equal(J.s.current.elements.find(e=>e.id===caption.id).text,caption.text);
 J.click('j-undo');assert.equal(snapshot(J.s.current),before);
});
test('explicit local saving restores editable objects and never changes source observations',()=>{
 const {J,ctx,store}=boot();const records=snapshot(ctx.S.records);J.s.current=J.make(J.chosen(),'3:4','nature');
 J.s.current.elements.find(e=>e.type==='photo').crop.x=.8;
 assert.equal(J.save(),true);assert.equal(J.s.modified,false);
 const restored=J.state();assert.equal(restored.drafts.length,1);assert.equal(restored.drafts[0].elements.find(e=>e.type==='photo').crop.x,.8);
 assert.equal(snapshot(ctx.S.records),records);assert.ok(store.size);
});
test('quota failures retain the working model and do not claim a successful save',()=>{
 const {J,ctx}=boot();J.s.current=J.make(J.chosen(),'3:4','nature');J.s.modified=true;
 const before=snapshot(J.s.current);ctx.localStorage.setItem=()=>{throw Error('quota');};
 assert.equal(J.save(),false);assert.equal(J.s.modified,true);assert.equal(J.s.drafts.length,0);assert.equal(snapshot(J.s.current),before);assert.equal(J.s.error,'storage');
});
test('generation preserves unresolved labels and unique element IDs even with repeated assets',()=>{
 const {J}=boot();const assets=J.chosen(),d=J.make([...assets,assets[0]],'4:3','magazine');
 assert.equal(new Set(d.elements.map(x=>x.id)).size,d.elements.length);assert.ok(d.elements.some(x=>x.text==='待鉴定'));
 const before=snapshot(d);J.svg(d,false);assert.equal(snapshot(d),before);
});
test('unsafe caption markup is escaped in SVG and editable model remains separate',()=>{
 const {J}=boot();const d=J.make(J.chosen(),'1:1','minimal');d.elements.find(e=>e.type==='text').text='<script>alert(1)</script>';
 const svg=J.svg(d,false);assert.ok(!svg.includes('<script>'));assert.ok(svg.includes('&lt;script&gt;'));
});
