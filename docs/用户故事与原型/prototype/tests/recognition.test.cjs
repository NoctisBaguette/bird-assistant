const {test}=require('node:test');
const assert=require('node:assert/strict');
const {RecognitionSession}=require('../dist/recognition.js');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
test('offline capture works without an identification response; album failure preserves the capture',()=>{
 const s=new RecognitionSession();const a=s.capture('photo','offline');const b=s.capture('photo','low-storage');
 assert.ok(a);assert.equal(b.album,'failed');assert.equal(s.assets.length,2);assert.equal(s.analysis,'idle');assert.equal(s.selection,'unresolved');
});
test('recovery is bounded, opt-in and idempotent; a deliberate capture suppresses automatic substitutes',()=>{
 const s=new RecognitionSession();s.finish();assert.equal(s.assets.length,2);assert.equal(s.chosen().length,0);assert.ok(s.assets.every(a=>a.origin==='recovery'&&a.album==='not-saved'));
 s.finish();assert.equal(s.assets.length,2);s.toggle(s.assets[0].id);assert.equal(s.chosen().length,1);
 const captured=new RecognitionSession();captured.capture();captured.finish();assert.equal(captured.assets.length,1);
});
test('paused camera, camera denial, low storage and an import-only review do not fabricate recovery frames',()=>{
 for(const scenario of ['camera-denied','denied','low-storage']){const s=new RecognitionSession();s.finish(scenario);assert.equal(s.assets.length,0);}
 const paused=new RecognitionSession();paused.phase='paused';assert.equal(paused.capture(),null);paused.finish();assert.equal(paused.assets.length,0);
 const imported=new RecognitionSession();imported.phase='inactive';imported.add('sound','import');imported.finish();assert.equal(imported.assets.length,1);
});
test('session capture cap prevents unbounded evidence growth without replacing kept media',()=>{
 const s=new RecognitionSession();for(let i=0;i<6;i++)assert.ok(s.capture());const ids=s.assets.map(a=>a.id);
 assert.equal(s.capture(),null);assert.deepEqual(s.assets.map(a=>a.id),ids);
});
test('cancelled and superseded analysis responses cannot overwrite current evidence or user choices',()=>{
 const s=new RecognitionSession();const a=s.add('photo','import');s.selection='tit';const old=s.beginAnalysis();s.invalidate();
 assert.equal(s.complete(old),false);assert.equal(s.assets[0],a);assert.equal(s.selection,'tit');
 const newer=s.beginAnalysis();s.toggle(a.id);assert.equal(s.complete(newer),false);assert.equal(s.result,null);assert.equal(s.analysis,'idle');
});
test('analysis failure retains mixed evidence and retry completes without confirming a species',()=>{
 const s=new RecognitionSession();s.add('photo','import');s.add('video','import');s.add('sound','import');const ids=s.chosen().map(a=>a.id);
 assert.equal(s.complete(s.beginAnalysis(),'analysis-error'),true);assert.equal(s.analysis,'error');assert.deepEqual(s.chosen().map(a=>a.id),ids);
 assert.equal(s.complete(s.beginAnalysis(),'live-disagree'),true);assert.equal(s.result.disagree,true);assert.equal(s.selection,'unresolved');
});
test('changing selected evidence invalidates a completed result rather than presenting stale findings',()=>{
 const s=new RecognitionSession();const a=s.add('photo','import');s.complete(s.beginAnalysis());assert.equal(s.analysis,'done');s.remove(a.id);
 assert.equal(s.analysis,'idle');assert.equal(s.result,null);assert.equal(s.beginAnalysis(),null);
});
test('finishing a recording retains one intentional video with its duration',()=>{
 const s=new RecognitionSession();s.beginVideo();s.duration=13;s.finish();assert.equal(s.recording,false);assert.equal(s.assets.length,1);
 assert.equal(s.assets[0].kind,'video');assert.equal(s.assets[0].duration,13);assert.equal(s.assets[0].origin,'shutter');
});
test('save handoff carries every selected item, keeps original model evidence and preserves the user species choice',()=>{
 const context={module:{exports:{}},Set,URL,clearInterval(){},clearTimeout(){},Date,console,sp:x=>x,T:zh=>zh};
 vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(__dirname,'../dist/recognition.js'),'utf8')+'\nglobalThis.controller=R;globalThis.session=new RecognitionSession();',context);
 const s=context.session;s.add('video','import');s.add('photo','import');s.add('sound','import');s.selection='tit';s.complete(s.beginAnalysis());
 context.S={recognition:s,forms:{},records:[]};let called=false;context.startSave=()=>{called=true;};context.controller.action('r-save');
 assert.equal(called,true);assert.equal(context.S.input.bundle.length,3);assert.equal(context.S.input.media.kind,'photo');assert.equal(context.S.forms.candidates.selected,'tit');
 assert.equal(context.S.input.assessment.items[0].species,'sparrow');assert.equal(context.S.input.bundle[0].origin,'import');
});
test('audio-only capture works with camera denied and is never presented as saved to a photo album',()=>{
 const s=new RecognitionSession();const audio=s.capture('sound','camera-denied');assert.ok(audio);assert.equal(audio.album,'not-applicable');assert.equal(audio.duration,3);
 assert.equal(s.capture('photo','camera-denied'),null);
});
test('analysis segment validation preserves the original file and invalidates old results only on a valid change',()=>{
 const s=new RecognitionSession();const a=s.add('video','import',{url:'blob:original',duration:60});s.complete(s.beginAnalysis());
 assert.equal(s.setSegment(a.id,10,20),true);assert.deepEqual(a.segment,{from:10,to:20});assert.equal(a.url,'blob:original');assert.equal(s.result,null);
 assert.equal(s.setSegment(a.id,30,20),false);assert.equal(s.setSegment(a.id,10,70),false);assert.deepEqual(a.segment,{from:10,to:20});
});
test('changing clue focus preserves both analysis streams, selected evidence and user name',()=>{
 const s=new RecognitionSession();s.add('photo','shutter');s.chooseName('tit');const token=s.beginAnalysis();s.focusOn('audio');
 assert.equal(s.audio,true);assert.equal(s.mode,'quick');assert.equal(s.chosen().length,1);assert.equal(s.selection,'tit');assert.equal(s.complete(token),true);
 s.focusOn('visual');assert.equal(s.result.visualSpecies,'sparrow');assert.equal(s.selection,'tit');
});
test('an optional manually entered name never overwrites model evidence and can return to unresolved',()=>{
 const s=new RecognitionSession();s.add('photo','import');s.complete(s.beginAnalysis());assert.equal(s.selection,'unresolved');
 s.chooseName('  自己填写的鸟名  ');assert.equal(s.selection,'自己填写的鸟名');assert.equal(s.result.visualSpecies,'sparrow');
 s.chooseName('   ');assert.equal(s.selection,'unresolved');assert.equal(s.analysis,'done');
});
