'use strict';
/* Hold-to-speak interaction and provider-neutral ASR. No provider is connected. */
const JV = {
  transcriptionAdapter:null,
  captureAdapter:null,
  active:null,
  serial:0,
  state(){return {phase:'idle',cancelIntent:false,seconds:0,notice:''};},
  get ai(){return J.s.ai;},
  get s(){return JV.ai.voice||(JV.ai.voice=JV.state());},
  get busy(){return !!JV.active;},
  demo(){return ['journal-voice-demo','journal-voice-error'].includes(S.scenario);},
  icon(kind){
    const path=kind==='keyboard'?'M3 6h18v12H3ZM6 9h1m3 0h1m3 0h1m3 0h.1M6 12h1m3 0h1m3 0h1m3 0h.1M7 15h10':'M8 5a4 4 0 0 1 8 0v7a4 4 0 0 1-8 0ZM5 10v2a7 7 0 0 0 14 0v-2M12 19v3m-4 0h8';
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+path+'"/></svg>';
  },
  composer(){
    const ai=JV.ai,voice=ai.inputMode==='voice',s=JV.s;
    const hint=JV.demo()?T('转写示例 · 不录音，不调用 ASR','Transcript sample · no recording or ASR call'):JV.transcriptionAdapter?T('松开转写 · 左滑后松开取消','Release to transcribe · swipe left and release to cancel'):T('ASR 待接入 · 可预览按住与左滑交互，不录音','ASR not connected · hold/swipe preview only, without recording');
    return '<div class="journal-input-field"><label for="j-writing-input">'+T('告诉 AI 你的想法','Tell AI what you want')+'</label><div class="journal-composer" data-jcomposer data-mode="'+(voice?'voice':'text')+'" data-phase="'+s.phase+'">'+(voice?'<button type="button" id="j-writing-input" class="journal-hold" data-jhold aria-label="'+T('按住说话','Hold to speak')+'" aria-describedby="j-input-hint" '+(s.phase==='transcribing'?'disabled':'')+'><span class="journal-voice-bars" aria-hidden="true">'+Array.from({length:13},(_,i)=>'<i style="--bar:'+i+'"></i>').join('')+'</span><span data-jvoice-label>'+T('按住说话','Hold to speak')+'</span><span class="journal-voice-time" data-jvoice-time></span></button>':'<textarea id="j-writing-input" name="jAiPrompt" rows="1" placeholder="'+T('输入想法…','Type your ideas…')+'" aria-describedby="j-input-hint">'+esc(ai.prompt)+'</textarea>')+'<button type="button" data-action="j-input-toggle" class="journal-input-toggle" aria-label="'+(voice?T('切换文字输入','Switch to text input'):T('切换语音输入','Switch to voice input'))+'" title="'+(voice?T('文字输入','Text input'):T('语音输入','Voice input'))+'">'+JV.icon(voice?'keyboard':'mic')+'</button></div><p id="j-input-hint" class="journal-input-hint">'+(voice?hint:T('文字与语音可随时切换，已有内容会保留。','Switch between typing and voice without losing your input.'))+'</p><p class="journal-voice-notice" data-jvoice-notice role="status" aria-live="polite">'+esc(s.notice)+'</p>'+(voice&&ai.prompt?'<button type="button" class="journal-transcript" data-action="j-input-edit" aria-label="'+T('编辑已输入的文字','Edit entered text')+'"><span>'+T('已输入 · 点击编辑','Entered text · tap to edit')+'</span><p>'+esc(ai.prompt)+'</p></button>':'')+'</div>';
  },
  toggle(textOnly=false){
    JV.cancel(true);JV.ai.inputMode=textOnly?'text':JV.ai.inputMode==='voice'?'text':'voice';renderApp();
    if(JV.ai.inputMode==='text'){const input=document.querySelector('[name="jAiPrompt"]');input?.focus({preventScroll:true});}
  },
  resizeInput(){const input=document.querySelector('[name="jAiPrompt"]');if(input){input.style.height='auto';input.style.height=Math.min(144,Math.max(44,input.value?input.scrollHeight:44))+'px';}},
  refresh(levels){
    if(typeof document.querySelector!=='function')return;
    const root=document.querySelector('[data-jcomposer]'),s=JV.s;if(!root)return;
    root.dataset.phase=s.cancelIntent?'cancel':s.phase;
    const label=root.querySelector('[data-jvoice-label]');if(label)label.textContent=s.cancelIntent?T('松开取消','Release to cancel'):s.phase==='transcribing'?T('正在转写…','Transcribing…'):s.phase==='preparing'?T('正在准备麦克风…','Preparing microphone…'):s.phase==='recording'||s.phase==='preview'?T('松开确认','Release to confirm'):T('按住说话','Hold to speak');
    const clock=root.querySelector('[data-jvoice-time]');if(clock)clock.textContent=JV.active?.held?Math.floor(s.seconds/60)+':'+String(s.seconds%60).padStart(2,'0'):'';
    const hint=document.querySelector('#j-input-hint');if(hint&&JV.active?.held)hint.textContent=s.cancelIntent?T('移回原位可继续录制','Move back to continue'):JV.active.preview?T('交互预览 · 左滑取消 · 未录音','Interaction preview · swipe left to cancel · not recording'):T('左滑取消 · 松开后转写，不自动生成文案','Swipe left to cancel · release to transcribe, without generating a draft');
    const notice=document.querySelector('[data-jvoice-notice]');if(notice)notice.textContent=s.notice;
    if(levels)root.querySelectorAll('.journal-voice-bars i').forEach((bar,i)=>bar.style.height=(4+Math.min(1,levels[i]||0)*23)+'px');
    const generate=document.querySelector('[data-action="j-ai-generate"]');if(generate)generate.disabled=JV.busy||!J.writingAdapter||JV.ai.busy||!JV.ai.prompt.trim();
  },
  context(){
    const d=J.s.current,ai=JV.ai;
    return {journalTitle:d.title,previousText:ai.prompt,targetLabel:d.elements.some(e=>e.id===ai.target)?J.elementLabel(d.elements.find(e=>e.id===ai.target)):T('整页文字','Overall journal text'),vocabulary:d.elements.filter(e=>e.type==='photo'&&(e.id===ai.photoId||ai.photos.includes(e.id))).map(e=>e.asset.label)};
  },
  valid(a){return JV.active===a&&!a.abort.signal.aborted&&J.s.current?.id===a.documentId&&JV.ai.target===a.target;},
  async begin(clientX=0,threshold=64){
    if(JV.active)return;const s=JV.s,demo=JV.demo(),preview=!demo&&!JV.transcriptionAdapter;
    const a={id:++JV.serial,held:true,startX:clientX,threshold,startedAt:Date.now(),documentId:J.s.current.id,target:JV.ai.target,base:JV.ai.prompt,context:JV.context(),abort:new AbortController(),capture:null,ready:false,preview,demo,errorDemo:S.scenario==='journal-voice-error',adapter:JV.transcriptionAdapter};
    JV.active=a;Object.assign(s,{phase:preview?'preview':'preparing',cancelIntent:false,seconds:0,notice:''});JV.refresh();
    a.timer=setInterval(()=>{if(JV.active===a){s.seconds=Math.floor((Date.now()-a.startedAt)/1000);JV.refresh();}},250);
    try{
      const capture=preview?null:demo?{stop:async()=>({audio:new Blob(['sample audio'],{type:'audio/webm'}),mimeType:'audio/webm',durationMs:Date.now()-a.startedAt}),cancel(){}}:await (JV.captureAdapter||JV.browserCapture)({signal:a.abort.signal,onLevels:levels=>{if(JV.valid(a))JV.refresh(levels);}});
      if(!JV.valid(a)||!a.held){capture?.cancel();return;}
      a.capture=capture;a.ready=true;s.phase=preview?'preview':'recording';JV.refresh();
    }catch(error){if(JV.active!==a)return;JV.dispose(a);s.phase='idle';s.notice=error.name==='NotAllowedError'?T('麦克风未获允许。可切回文字，已有内容仍保留。','Microphone access was not allowed. Switch to typing; your input is preserved.'):T('无法开始录音。可重试或切回文字，已有内容仍保留。','Could not start recording. Retry or switch to typing; your input is preserved.');renderApp();}
  },
  move(clientX){if(!JV.active?.held)return;JV.s.cancelIntent=JV.active.startX-clientX>=JV.active.threshold;JV.refresh();},
  dispose(a){
    clearInterval(a.timer);a.abort.abort();if(JV.active===a)JV.active=null;
  },
  cancel(quiet=false,notice=''){
    const a=JV.active;if(a){a.held=false;JV.dispose(a);a.capture?.cancel();}
    if(!J.s?.ai)return;Object.assign(JV.s,{phase:'idle',cancelIntent:false,seconds:0,notice:quiet?'':notice||T('已取消，原有输入保持不变。','Cancelled. Your previous input is unchanged.')});JV.refresh();
  },
  async release(){
    const a=JV.active;if(!a?.held)return;
    if(JV.s.cancelIntent){JV.cancel();renderApp();return;}
    if(!a.ready){JV.cancel(false,T('麦克风尚未准备好，请准备完成后重新按住。','The microphone was not ready. Hold again once it is available.'));renderApp();return;}
    if(Date.now()-a.startedAt<250){JV.cancel(false,T('按住说话，结束后松开；左滑可取消。','Hold while speaking, then release; swipe left to cancel.'));renderApp();return;}
    if(a.preview){JV.cancel(false,T('ASR 服务尚未接入；本次仅预览操作，未录音或添加文字。','ASR is not connected. This was an interaction preview; no audio was recorded or text added.'));renderApp();return;}
    a.held=false;clearInterval(a.timer);JV.s.phase='transcribing';JV.refresh();
    try{
      const captured=await a.capture.stop();if(!JV.valid(a))return;
      const request={audio:captured.audio,mimeType:captured.mimeType,durationMs:captured.durationMs,languageMode:'auto',languages:['zh','en'],allowCodeSwitching:true,context:a.context};
      const result=a.demo?(a.errorDemo?await Promise.reject(Error('Demo transcription failure')):{text:'为了 bird #2 等了 two hours，今天终于拍到了。'}):await a.adapter(request,{signal:a.abort.signal});
      if(!JV.valid(a))return;if(!result||typeof result.text!=='string'||!result.text.trim())throw Error('Empty transcript');
      JV.ai.prompt=a.base+(a.base&&!/\s$/.test(a.base)?' ':'')+result.text.trim();JV.ai.prepared=false;JV.ai.result=null;
      JV.s.notice=a.demo?T('转写示例已加入（固定示例，非实际识别）。切换文字可编辑。','Transcript sample added (fixed sample, not recognition). Switch to typing to edit.'):T('转写已加入。切换文字可编辑，再确认写作要求。','Transcript added. Switch to typing to edit, then review your writing brief.');
    }catch(error){if(!JV.valid(a))return;JV.s.notice=a.demo?T('转写失败（示例），原有输入保持不变。请重新按住或切回文字。','Transcription failed (sample). Your previous input is unchanged. Hold again or type.'):T('转写未完成，原有输入保持不变。请重新按住或切回文字。','Transcription did not finish. Your previous input is unchanged. Hold again or type.');}
    finally{if(JV.active===a){JV.dispose(a);JV.s.phase='idle';JV.s.cancelIntent=false;renderApp();}}
  },
  async browserCapture({signal,onLevels}){
    if(!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==='undefined')throw Error('Recording unavailable');
    const stream=await navigator.mediaDevices.getUserMedia({audio:true});
    const stopTracks=()=>stream.getTracks().forEach(track=>track.stop());
    if(signal.aborted){stopTracks();throw new DOMException('Cancelled','AbortError');}
    let context=null,analyser=null,source=null,frame=0,discard=false,closed=false;
    const chunks=[],startedAt=Date.now();
    const cleanup=()=>{if(closed)return;closed=true;cancelAnimationFrame(frame);source?.disconnect();stopTracks();context?.close().catch(()=>{});signal.removeEventListener('abort',abort);};
    const type=['audio/webm;codecs=opus','audio/webm','audio/mp4'].find(type=>MediaRecorder.isTypeSupported(type));let recorder;
    try{recorder=new MediaRecorder(stream,type?{mimeType:type}:undefined);}catch(error){stopTracks();throw error;}
    let resolve,reject;const done=new Promise((res,rej)=>{resolve=res;reject=rej;});done.catch(()=>{});
    recorder.addEventListener('dataavailable',event=>{if(event.data.size)chunks.push(event.data);});
    recorder.addEventListener('stop',()=>{const mimeType=recorder.mimeType||type||'audio/webm';cleanup();resolve({audio:new Blob(discard?[]:chunks,{type:mimeType}),mimeType,durationMs:Date.now()-startedAt});});
    recorder.addEventListener('error',()=>{cleanup();reject(Error('Recording failed'));});
    function abort(){discard=true;if(recorder.state!=='inactive')recorder.stop();cleanup();}
    signal.addEventListener('abort',abort,{once:true});
    try{
      recorder.start();const Audio=window.AudioContext||window.webkitAudioContext;
      if(Audio){context=new Audio();context.resume().catch(()=>{});source=context.createMediaStreamSource(stream);analyser=context.createAnalyser();analyser.fftSize=256;source.connect(analyser);const values=new Uint8Array(analyser.frequencyBinCount);
        const meter=()=>{if(closed)return;analyser.getByteFrequencyData(values);onLevels(Array.from({length:13},(_,i)=>values[Math.floor(i*values.length/13)]/255));frame=requestAnimationFrame(meter);};meter();}
    }catch(error){abort();throw error;}
    return {stop(){if(recorder.state!=='inactive')recorder.stop();return done;},cancel:abort};
  },
  bind(){
    const root=document.querySelector('[data-jcomposer]'),button=root?.querySelector('[data-jhold]');
    if(JV.active?.held&&JV.button!==button)JV.cancel(true);
    if(!root){if(JV.active)JV.cancel(true);JV.button=null;return;}
    JV.button=button;JV.resizeInput();JV.refresh();if(!button)return;
    button.addEventListener('pointerdown',event=>{if(event.button!==0||JV.busy)return;event.preventDefault();button.setPointerCapture(event.pointerId);JV.begin(event.clientX,Math.max(48,Math.min(88,button.clientWidth*.25)));});
    button.addEventListener('pointermove',event=>{if(JV.active?.held)JV.move(event.clientX);});
    button.addEventListener('pointerup',()=>{JV.release();});
    const cancel=()=>{if(JV.active?.held){JV.cancel();renderApp();}};
    button.addEventListener('pointercancel',cancel);button.addEventListener('lostpointercapture',cancel);
    button.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();cancel();}else if([' ','Enter'].includes(event.key)&&!event.repeat){event.preventDefault();JV.begin();}});
    button.addEventListener('keyup',event=>{if([' ','Enter'].includes(event.key)){event.preventDefault();JV.release();}});
  }
};
J.promptComposer=()=>JV.composer();
J.bindComposer=()=>JV.bind();
J.cancelVoice=quiet=>JV.cancel(quiet);
J.isVoiceBusy=()=>JV.busy;
J.resizePrompt=()=>JV.resizeInput();
J.toggleInput=textOnly=>JV.toggle(textOnly);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&JV.active){JV.cancel(true);renderApp();}});

document.addEventListener('keydown',event=>{if(event.key==='Escape'&&JV.active){event.preventDefault();JV.cancel();renderApp();}});
