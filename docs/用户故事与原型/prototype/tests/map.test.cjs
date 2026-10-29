const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
test('wheel and two-pointer pinch refresh clusters in the next animation frame without dragging or releasing',()=>{
 const src=fs.readFileSync(path.join(__dirname,'../dist/app.js'),'utf8'),events={},frames=[];
 const layer={innerHTML:''},style={setProperty(name,value){this[name]=value;}},world={style,querySelector:()=>layer};
 const el={isConnected:true,querySelector:()=>world,addEventListener:(n,fn)=>events[n]=fn,setPointerCapture(){}};
 const ctx={S:{map:{z:1,x:0,y:0,filter:'public',date:'all',species:'all'},pins:[{available:true,location:{place:'lake'}},{available:true,location:{place:'wood'}}],records:[]},
  T:zh=>zh,L:x=>x.zh,esc:String,icon:()=>'',places:{lake:{zh:'湖畔'},wood:{zh:'林间'}},document:{querySelectorAll:()=>[el]},requestAnimationFrame:fn=>{frames.push(fn);return frames.length;}};
 vm.createContext(ctx);vm.runInContext(src.slice(src.indexOf('function mapData()'),src.indexOf('function mainMap('))+src.slice(src.indexOf('function bindMap(){'),src.lastIndexOf('\nreset();')),ctx);ctx.bindMap();
 const target={closest:()=>null},flush=()=>{while(frames.length)frames.shift()();},count=()=>[...layer.innerHTML.matchAll(/class="map-pin group"/g)].length;
 let prevented=false;events.wheel({target,deltaY:100,preventDefault(){prevented=true;}});flush();events.wheel({target,deltaY:100,preventDefault(){}});flush();
 assert.equal(prevented,true);assert.equal(count(),1);assert.match(layer.innerHTML,/data-id="all"/);
 events.wheel({target,deltaY:-100,preventDefault(){}});flush();events.wheel({target,deltaY:-100,preventDefault(){}});flush();assert.equal(count(),2);
 events.pointerdown({target,pointerId:1,clientX:0,clientY:0});events.pointerdown({target,pointerId:2,clientX:100,clientY:0});
 events.pointermove({pointerId:2,clientX:75,clientY:0});flush();assert.equal(count(),1);
 events.pointermove({pointerId:2,clientX:140,clientY:0});flush();assert.equal(count(),2);assert.match(style.transform,/scale\(1.4\)/);
});
