const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
function boot(){
 const events={},clock={now:1000},stats={stop:0,cancel:0,asr:0};
 class Clock extends Date{static now(){return clock.now;}}
 const ctx={structuredClone,Date:Clock,Math,Blob,AbortController,DOMException,console,setInterval:()=>1,clearInterval(){},document:{querySelector:()=>null,addEventListener:(name,fn)=>events[name]=fn},localStorage:{getItem:()=>null},T:zh=>zh,L:x=>x,esc:x=>String(x??'').replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c])),renderApp(){},push(){}};
 vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(__dirname,'../dist/scrapbook.js'),'utf8')+'\n'+fs.readFileSync(path.join(__dirname,'../dist/journal-voice.js'),'utf8')+'\nthis.J=J;this.JV=JV;',ctx);
 const {J,JV}=ctx;ctx.S={scenario:'normal',journal:J.state()};J.s.current={schemaVersion:2,id:'journal-1',title:'湖边观察',width:900,height:1200,elements:[{id:'text-1',type:'text',text:'原正文',contentTitle:'',x:50,y:100,w:600,h:40,fontSize:24,font:'serif'},{id:'photo-2',type:'photo',photoNumber:2,x:400,y:400,w:200,h:200,asset:{label:'普通翠鸟'}}]};
 Object.assign(J.s.ai,{open:true,inputMode:'voice',prompt:'原有 typed text。',target:'text-1',photoId:'photo-2',photos:['photo-2']});
 JV.captureAdapter=async()=>({stop:async()=>{stats.stop++;return {audio:new Blob(['test audio'],{type:'audio/webm'}),mimeType:'audio/webm',durationMs:500};},cancel(){stats.cancel++;}});
 JV.transcriptionAdapter=async request=>{stats.asr++;stats.request=request;return {text:'为了 bird #2 等了 two hours，终于拍到了。'};};
 return {ctx,J,JV,clock,stats,events};
}
test('text/voice are alternate modes of one composer; toggling preserves typed input',()=>{
 const {J,JV}=boot(),before=J.s.ai.prompt;J.s.ai.inputMode='text';let html=JV.composer();assert.match(html,/textarea[^>]+rows="1"/);assert.ok(!html.includes('data-jhold'));
 JV.toggle();html=JV.composer();assert.ok(html.includes('data-jhold'));assert.ok(!html.includes('<textarea'));assert.match(html,/切换文字输入/);assert.equal(J.s.ai.prompt,before);
 JV.toggle();assert.equal(J.s.ai.inputMode,'text');assert.equal(J.s.ai.prompt,before);
});
test('release confirms once, using automatic mixed-language ASR and contextual vocabulary without changing the document',async()=>{
 const {J,JV,clock,stats}=boot(),document=JSON.stringify(J.s.current);await JV.begin(200);clock.now+=600;await JV.release();await JV.release();
 assert.equal(stats.asr,1);assert.equal(stats.stop,1);assert.equal(stats.request.languageMode,'auto');assert.equal(stats.request.languages.join(','),'zh,en');assert.equal(stats.request.allowCodeSwitching,true);assert.equal(stats.request.context.vocabulary[0],'普通翠鸟');assert.equal(stats.request.context.previousText,'原有 typed text。');assert.equal(stats.request.audio.type,'audio/webm');
 assert.equal(J.s.ai.prompt,'原有 typed text。 为了 bird #2 等了 two hours，终于拍到了。');assert.equal(JSON.stringify(J.s.current),document);assert.equal(J.s.past.length,0);assert.equal(JV.s.phase,'idle');
});
test('left swipe then release discards the recording without calling ASR or altering previous text',async()=>{
 const {J,JV,clock,stats}=boot(),before=J.s.ai.prompt;await JV.begin(220,64);clock.now+=600;JV.move(120);assert.equal(JV.s.cancelIntent,true);await JV.release();
 assert.equal(J.s.ai.prompt,before);assert.equal(stats.asr,0);assert.equal(stats.stop,0);assert.equal(stats.cancel,1);assert.equal(JV.active,null);
});
test('moving back from the cancellation region restores release-to-confirm',async()=>{
 const {JV,clock,stats}=boot();await JV.begin(220,64);JV.move(100);assert.equal(JV.s.cancelIntent,true);JV.move(200);assert.equal(JV.s.cancelIntent,false);clock.now+=600;await JV.release();assert.equal(stats.asr,1);
});
test('interrupted and too-short holds cancel without transcribing',async()=>{
 const {J,JV,clock,stats}=boot(),before=J.s.ai.prompt;await JV.begin();JV.cancel();assert.equal(JV.active,null);await JV.release();assert.equal(stats.asr,0);
 await JV.begin();clock.now+=100;await JV.release();assert.equal(stats.asr,0);assert.equal(J.s.ai.prompt,before);assert.equal(stats.cancel,2);
});
test('release before microphone preparation completes cannot start a late recording',async()=>{
 const {J,JV,clock,stats}=boot(),before=J.s.ai.prompt;let ready;JV.captureAdapter=()=>new Promise(resolve=>ready=resolve);const starting=JV.begin();clock.now+=600;await JV.release();
 ready({stop:async()=>{stats.stop++;},cancel(){stats.cancel++;}});await starting;assert.equal(stats.cancel,1);assert.equal(stats.stop,0);assert.equal(stats.asr,0);assert.equal(J.s.ai.prompt,before);
});
test('switching back to typing cancels in-flight ASR and ignores its late result',async()=>{
 const {J,JV,clock}=boot(),before=J.s.ai.prompt;let respond,called;const requested=new Promise(resolve=>called=resolve);JV.transcriptionAdapter=()=>new Promise(resolve=>{respond=resolve;called();});await JV.begin();clock.now+=600;const finishing=JV.release();await requested;
 assert.equal(JV.s.phase,'transcribing');JV.toggle();respond({text:'late unwanted result'});await finishing;assert.equal(J.s.ai.inputMode,'text');assert.equal(J.s.ai.prompt,before);assert.equal(JV.active,null);
});
test('ASR failure preserves input and allows a fresh successful recording',async()=>{
 const {J,JV,clock}=boot(),before=J.s.ai.prompt;JV.transcriptionAdapter=async()=>{throw Error('network');};await JV.begin();clock.now+=600;await JV.release();assert.equal(J.s.ai.prompt,before);assert.match(JV.s.notice,/未完成/);
 JV.transcriptionAdapter=async()=>({text:'中文 with English mixed in'});await JV.begin();clock.now+=600;await JV.release();assert.ok(J.s.ai.prompt.endsWith('中文 with English mixed in'));
});
test('unconfigured ASR offers only a labelled interaction preview, without microphone access or fabricated text',async()=>{
 const {J,JV,clock,stats}=boot(),before=J.s.ai.prompt;JV.transcriptionAdapter=null;JV.captureAdapter=()=>{throw Error('must not request microphone');};await JV.begin();assert.equal(JV.s.phase,'preview');clock.now+=600;await JV.release();assert.equal(J.s.ai.prompt,before);assert.equal(stats.asr,0);assert.match(JV.s.notice,/未录音或添加文字/);
});
test('explicit transcript sample is labelled and cancellation never adds the sample',async()=>{
 const {ctx,J,JV,clock,stats}=boot();ctx.S.scenario='journal-voice-demo';await JV.begin(200);clock.now+=600;JV.move(100);await JV.release();assert.equal(J.s.ai.prompt,'原有 typed text。');
 await JV.begin(200);clock.now+=600;await JV.release();assert.ok(J.s.ai.prompt.includes('two hours'));assert.match(JV.s.notice,/固定示例/);assert.equal(stats.asr,0);
});
test('microphone denial leaves input intact and a late permission result stops its media tracks',async()=>{
 const {ctx,J,JV}=boot(),before=J.s.ai.prompt;JV.captureAdapter=async()=>{throw new DOMException('Denied','NotAllowedError');};await JV.begin();assert.equal(J.s.ai.prompt,before);assert.match(JV.s.notice,/麦克风未获允许/);
 let allow,stopped=0;ctx.navigator={mediaDevices:{getUserMedia:()=>new Promise(resolve=>allow=resolve)}};ctx.MediaRecorder=function(){};const controller=new AbortController(),capturing=JV.browserCapture({signal:controller.signal,onLevels(){}});controller.abort();allow({getTracks:()=>[{stop(){stopped++;}}]});await assert.rejects(capturing,{name:'AbortError'});assert.equal(stopped,1);
});

test('Escape cancels a held voice session even when the hold button is not focused',async()=>{
 const {J,JV,stats,events}=boot(),before=J.s.ai.prompt;await JV.begin(200);events.keydown({key:'Escape',preventDefault(){}});assert.equal(JV.active,null);assert.equal(stats.cancel,1);assert.equal(stats.asr,0);assert.equal(J.s.ai.prompt,before);
});
