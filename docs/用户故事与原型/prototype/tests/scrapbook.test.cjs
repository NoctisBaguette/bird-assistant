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

test('text width rewraps title and body without scaling fonts; canvas overflow is visibly ellipsized without data loss',()=>{
 const {J}=boot();J.s.current=J.make(J.chosen(),'3:4','nature');J.s.selectedElement='title';const e=J.selected();
 e.contentTitle='标题保留在同一个元素';e.text='长正文用于验证换行和画布溢出。'.repeat(20);J.fitText(e);
 const size=e.fontSize,titleSize=e.titleSize,wide=e.h;
 J.update({name:'jWidth',type:'range',value:200});J.commitEdit();
 assert.equal(e.fontSize,size);assert.equal(e.titleSize,titleSize);assert.ok(e.h>wide);
 const complete=e.text;e.y=J.s.current.height-140;J.fitText(e);const layout=J.textLayout(e,J.s.current);
 assert.equal(layout.overflow,true);assert.ok(layout.visible.at(-1).text.endsWith('…'));assert.equal(e.text,complete);
 assert.ok(J.svg(J.s.current,false).includes('…'));assert.ok(e.h<=140);
});
test('one edit transaction covers a typing session and no-op edits or selection preserve redo',()=>{
 const {J}=boot();J.s.current=J.make(J.chosen(),'3:4','nature');J.s.selectedElement='title';const initial=snapshot(J.s.current);
 for(const text of ['一','一段','一段完整文字'])J.update({name:'jText',type:'textarea',value:text});
 assert.equal(J.s.past.length,0);J.commitEdit();assert.equal(J.s.past.length,1);
 const final=snapshot(J.s.current);J.click('j-undo');assert.equal(snapshot(J.s.current),initial);
 J.click('j-deselect');assert.equal(J.s.future.length,1);
 J.update({name:'jElement',type:'select-one',value:'title'});
 J.update({name:'jText',type:'textarea',value:J.selected().text});J.commitEdit();assert.equal(J.s.future.length,1);
 J.click('j-redo');assert.equal(snapshot(J.s.current),final);
});
test('mixed add, title/body, background, crop, layering and delete undo/redo restore every element and attribute',()=>{
 const {J}=boot();J.s.current=J.make(J.chosen(),'3:4','nature');const states=[snapshot(J.s.current)];
 const step=fn=>{fn();J.commitEdit();states.push(snapshot(J.s.current));};
 step(()=>J.click('j-add-text'));const id=J.s.selectedElement;
 step(()=>J.update({name:'jTextTitle',type:'text',value:'旅行感想'}));
 step(()=>J.update({name:'jText',type:'textarea',value:'等了很久，终于看到了它。'}));
 step(()=>J.update({name:'jBackground',type:'color',value:'#ddeeff'}));
 step(()=>J.click('j-add-decoration','flower'));
 step(()=>J.click('j-forward')); // At the top: this is intentionally a no-op.
 states.pop();
 J.s.selectedElement=J.s.current.elements.find(x=>x.type==='photo').id;
 step(()=>{J.click('j-crop');J.s.crop.zoom=1.8;J.s.crop.x=.7;J.click('j-crop-confirm');});
 J.s.selectedElement=id;step(()=>J.click('j-backward'));step(()=>J.click('j-delete-element'));
 for(let i=states.length-2;i>=0;i--){J.click('j-undo');assert.equal(snapshot(J.s.current),states[i]);}
 for(let i=1;i<states.length;i++){J.click('j-redo');assert.equal(snapshot(J.s.current),states[i]);}
});
test('photo numbers survive moves and deletion; labels follow the nine canvas regions',()=>{
 const {J}=boot();const d=J.make(J.chosen(),'3:4','minimal');J.s.current=d;const photos=d.elements.filter(x=>x.type==='photo');
 const p=photos[0],number=p.photoNumber;p.x=0;p.y=0;p.w=100;p.h=100;assert.match(J.elementLabel(p),/左上/);
 p.x=d.width-100;p.y=d.height-100;assert.match(J.elementLabel(p),/右下/);assert.equal(p.photoNumber,number);
 J.s.selectedElement=photos[1].id;J.click('j-delete-element');assert.equal(p.photoNumber,number);assert.equal(d.nextPhotoNumber,5);
});
test('writing requests bundle only chosen and required linked photos plus layout budget and user instructions',()=>{
 const {J}=boot();const d=J.make(J.chosen(),'3:4','nature');J.s.current=d;const photos=d.elements.filter(x=>x.type==='photo');
 Object.assign(J.s.ai,{target:'new',photoId:photos[2].id,photos:[photos[0].id],purpose:'reflection',prompt:'鸟 #3 很胆小，等了两个小时。'});
 const request=J.writingRequest();assert.equal(request.images.length,2);assert.equal(request.instruction,J.s.ai.prompt);
 assert.ok(request.images.every(x=>x.src.startsWith('data:')));assert.equal(request.images[1].unresolved,true);
 assert.ok(request.target.suggestedCharacters>0);assert.ok(request.target.availableHeight>0);
 assert.equal(request.constraints.inventPersonalExperience,false);assert.ok(!request.images.some(x=>x.elementId===photos[1].id));
});
test('generated writing requires preview and explicit application, one undo restores old title/body; failures retain work',async()=>{
 const {J}=boot();J.s.current=J.make(J.chosen(),'3:4','nature');const initial=snapshot(J.s.current);
 Object.assign(J.s.ai,{target:'title',prompt:'根据我的经历写一段感想。'});
 J.writingAdapter=async()=>({title:'树影里的等待',body:'等了两个小时，终于看见了那只胆小的鸟。'});
 await J.generateWriting();assert.equal(snapshot(J.s.current),initial);assert.equal(J.s.ai.result.title,'树影里的等待');
 J.click('j-ai-apply');assert.equal(J.s.current.elements.find(x=>x.id==='title').contentTitle,'树影里的等待');
 J.click('j-undo');assert.equal(snapshot(J.s.current),initial);
 J.writingAdapter=async()=>{throw Error('offline');};await J.generateWriting();assert.ok(J.s.ai.error);assert.equal(J.s.ai.prompt,'根据我的经历写一段感想。');assert.equal(snapshot(J.s.current),initial);
});
test('reflow keeps standalone and linked title/body content and stable photo identity while varying the composition',()=>{
 const {J}=boot();J.s.current=J.make(J.chosen(),'3:4','nature');const before=J.s.current;
 before.elements.find(e=>e.id==='title').text='My whole-journal reflection';
 J.click('j-add-text');const extra=J.selected();extra.contentTitle='独立标题';extra.text='一段单独的感想';
 const oldPhotos=before.elements.filter(e=>e.type==='photo').map(e=>[e.id,e.photoNumber]);
 J.click('j-layout');J.click('j-layout-preview');const first=J.copy(J.s.pending);J.click('j-layout-preview');const second=J.s.pending;
 assert.equal(second.elements.find(e=>e.id==='title').text,'My whole-journal reflection');assert.equal(second.elements.find(e=>e.id===extra.id).contentTitle,'独立标题');
 assert.equal(snapshot(second.elements.filter(e=>e.type==='photo').map(e=>[e.id,e.photoNumber])),snapshot(oldPhotos));
 assert.notEqual(first.layoutVariant,second.layoutVariant);assert.notEqual(snapshot(first.elements.filter(e=>e.type==='photo')),snapshot(second.elements.filter(e=>e.type==='photo')));
});
test('legacy v1 saved drafts migrate to content-sized text without deleting any source or full text',()=>{
 const {J,store}=boot();const d=J.make(J.chosen(),'3:4','minimal');d.schemaVersion=1;const e=d.elements.find(e=>e.type==='text');delete e.contentTitle;e.text='Legacy notes';e.h=900;
 store.set(J.key,JSON.stringify([d]));const restored=J.state().drafts[0];assert.equal(restored.schemaVersion,2);assert.equal(restored.elements.find(x=>x.id===e.id).text,'Legacy notes');assert.ok(restored.elements.find(x=>x.id===e.id).h<100);assert.equal(restored.elements.length,d.elements.length);
});
test('late writing responses cannot attach to another journal or replace its content',async()=>{
 const {J}=boot();J.s.current=J.make(J.chosen(),'3:4','nature');J.s.ai.prompt='Write from my notes';J.s.ai.target='title';let respond;
 J.writingAdapter=()=>new Promise(resolve=>respond=resolve);const running=J.generateWriting();
 J.open(J.make(J.chosen(),'1:1','minimal'));const other=snapshot(J.s.current);respond({title:'Old response',body:'From the previous journal'});await running;
 assert.equal(snapshot(J.s.current),other);assert.equal(J.s.ai.result,null);assert.equal(J.s.ai.busy,false);
});
