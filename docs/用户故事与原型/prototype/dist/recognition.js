'use strict';
/* Interaction prototype only: no camera, microphone, upload or model is started. */
class RecognitionSession {
  constructor(){
    this.focus='visual';this.detailsOpen=false;this.helpOpen=false;this.manualOpen=false;this.assets=[];this.sequence=0;this.mode='quick';this.phase='live';this.zoom=1;this.audio=true;
    this.recording=false;this.duration=0;this.recovered=false;this.selection='unresolved';
    this.analysis='idle';this.analysisToken=0;this.result=null;this.audioClue=null;this.error='';this.importKind='gallery';
  }
  add(kind,origin,extra={}){
    const a={id:'evidence-'+(++this.sequence),kind,origin,selected:origin!=='recovery',sample:true,name:'',url:'',size:0,album:origin==='shutter'?'sample-saved':'original',...extra};
    this.assets.push(a);return a;
  }
  capture(kind='photo',scenario='normal'){
    if(this.assets.length>=6||this.phase==='paused'||(kind!=='sound'&&(scenario==='camera-denied'||scenario==='denied')))return null;
    const a=this.add(kind,'shutter',{duration:kind==='video'?Math.max(1,this.duration):kind==='sound'?3:0,album:kind==='sound'?'not-applicable':['low-storage','album-denied'].includes(scenario)?'failed':'sample-saved'});
    this.recording=false;this.duration=0;return a;
  }
  beginVideo(){if(this.phase==='paused'||this.assets.length>=6)return false;this.recording=true;this.duration=0;return true;}
  finish(scenario='normal'){
    if(this.recording)this.capture('video',scenario);
    if(!this.recovered&&this.phase==='live'&&!['camera-denied','denied','low-storage'].includes(scenario)&&!this.assets.some(a=>a.origin==='shutter'&&a.kind!=='sound')){
      const count=Math.min(2,6-this.assets.length);for(let i=0;i<count;i++)this.add('photo','recovery',{variation:i,album:'not-saved'});
    }
    this.recovered=true;this.phase='inactive';this.invalidate();
  }
  setSegment(id,from,to){const a=this.assets.find(a=>a.id===id);if(!a||!Number.isFinite(a.duration)||!Number.isFinite(from)||!Number.isFinite(to)||from<0||to<=from||to>a.duration)return false;a.segment={from,to};this.invalidate();return true;}
  focusOn(channel){if(['visual','audio'].includes(channel))this.focus=channel;}
  chooseName(name){this.selection=String(name||'').trim().slice(0,80)||'unresolved';}
  chosen(){return this.assets.filter(a=>a.selected);}
  toggle(id){const a=this.assets.find(a=>a.id===id);if(a){a.selected=!a.selected;this.invalidate();}}
  remove(id){this.assets=this.assets.filter(a=>a.id!==id);this.invalidate();}
  invalidate(){this.analysisToken++;this.analysis='idle';this.result=null;}
  beginAnalysis(){this.invalidate();if(!this.chosen().length)return null;this.analysis='busy';return this.analysisToken;}
  complete(token,scenario='normal'){
    if(token!==this.analysisToken||this.analysis!=='busy')return false;
    if(['analysis-error','offline'].includes(scenario)){this.analysis='error';return true;}
    const visual=this.chosen().find(a=>a.visualClue)?.visualClue||{species:'sparrow',score:86};this.analysis='done';this.result={empty:scenario==='no-candidates'||visual.species==='unresolved',disagree:scenario==='live-disagree'||!!(this.audioClue&&this.audioClue.species!==visual.species),visualSpecies:visual.species,visualScore:visual.score,sample:true};return true;
  }
}
if(typeof module!=='undefined')module.exports={RecognitionSession};
const R={
  timer:null,analysisTimer:null,holdTimer:null,urls:new Set(),revision:0,
  get s(){return S.recognition;},
  liveViews:new Set(['identify','camera']),
  sampleMedia(a){return {kind:a.kind,color:a.variation?'#627452':'#856b4b',url:a.url||'',sample:a.sample,name:a.name,duration:a.duration||0};},
  label(a){return a.name||T(a.kind==='video'?'视频':a.kind==='sound'?'声音':'照片',a.kind==='video'?'Video':a.kind==='sound'?'Audio':'Photo')+' '+a.id.split('-').at(-1);},
  source(a){if(a.origin==='import'&&a.sample)return T('导入示例 · 非设备文件','Import sample · not a device file');return a.origin==='recovery'?T('自动候选 · 预览质量','Recovery · preview quality'):a.origin==='shutter'?a.kind==='sound'?T('主动保留鸟鸣 · 示例','Saved bird call · sample'):T('主动拍摄 · 示例','Shutter capture · sample'):T('设备导入 · 原件不改动','Device import · original unchanged');},
  button(text,action,extra=''){return `<button type="button" class="r-control" data-action="${action}" ${extra}>${text}</button>`;},
  reset(){clearInterval(R.timer);clearInterval(R.recordTimer);R.recordTimer=null;R.importToken++;clearTimeout(R.analysisTimer);clearTimeout(R.holdTimer);for(const url of R.urls)URL.revokeObjectURL(url);R.urls.clear();R.revision=0;},
  blocked(){return ['camera-denied','denied'].includes(S.scenario);},
  sampleResult(){
    if(S.scenario==='no-candidates')return {code:'unresolved',label:T('暂未识别','Unresolved'),score:null,held:false,pending:false};
    const step=S.scenario==='live-switch'?R.revision:0;
    return {code:step>=3?'tit':'sparrow',label:sp(step>=3?'tit':'sparrow'),score:step>=3?88:86,held:step===1,pending:step===2};
  },
  boxStyle(z){const x=Math.max(3,57-28*z),y=Math.max(26,54-22*z);return `left:${x}%;top:${y}%;width:${Math.min(94-x,49*z)}%;height:${Math.min(86-y,40*z)}%`;},
  live(){
    const s=R.s,blocked=R.blocked(),paused=s.phase==='paused',offline=S.scenario==='offline',stale=offline||S.scenario==='live-stale',result=R.sampleResult();
    const audioOff=!s.audio||S.scenario==='audio-denied',disagree=S.scenario==='live-disagree',audioFocus=s.focus==='audio';
    const visualStatus=blocked?T('相机权限未开启','Camera access is off'):paused?T('取景已暂停','Viewfinder paused'):stale?T('等待新结果，仍可先拍摄','Waiting for results; capture anytime'):result.label+(result.score===null?'':' · '+result.score+'%');
    const audioStatus=audioOff?T('声音线索已暂停','Audio clues paused'):offline?T('等待联网，可先留鸟鸣','Keep a call now; identify later'):s.recording?T('录像音轨稍后分析','Video audio will be analysed later'):stale?T('上次声音线索：树麻雀','Previous audio clue: tree sparrow'):disagree?T('大山雀 · 可能来自画外','Great tit · possibly off screen'):T('树麻雀 · 声音线索','Tree sparrow · audio clue');
    return `<section class="r-live r-live-portrait" aria-label="${T('实时识别设计','Live identification design')}">
      <div class="r-viewfinder ${paused||blocked?'r-inactive':''}" data-r-viewfinder>
        <div class="r-scene" style="--r-zoom:${s.zoom}"><div class="r-sun"></div><div class="r-hill"></div><div class="r-branch"></div>${bird(result.code==='tit'?'#627452':'#856b4b')}</div>
        <div class="r-view-top"><span class="r-demo">${T('示例取景 · 未调用相机','Sample view · camera not accessed')}</span><span class="r-connection">${s.recording?'● '+String(Math.floor(s.duration/60)).padStart(2,'0')+':'+String(s.duration%60).padStart(2,'0'):offline?T('离线','Offline'):T('演示','Demo')}</span></div>
        ${!blocked&&!paused&&!stale?`<div style="${R.boxStyle(s.zoom)}" class="r-bird-box ${result.held?'r-held':''}"><span>${esc(result.label)} ${result.score===null?'':result.score+'%'}</span><i></i><i></i><i></i><i></i></div>`:''}
        ${blocked||paused?`<div class="r-camera-cover">${icon('camera')}<strong>${blocked?T('相机权限未开启','Camera access is off'):T('取景已暂停','Viewfinder paused')}</strong><p>${blocked?T('仍可导入已有素材或保留声音','Import existing media or keep a sound'):T('恢复后继续取景与拍摄','Resume to aim and capture')}</p>${R.button(blocked?T('从相册或文件导入','Import gallery or files'):T('恢复取景','Resume viewfinder'),blocked?'r-import':'r-resume')}</div>`:stale?`<div class="r-stale"><strong>${offline?T('离线也能先拍摄','Capture while offline'):T('正在等待新的识别结果','Waiting for a fresh result')}</strong><span>${T('旧检测框已隐藏','Previous detection box hidden')}</span></div>`:''}
      </div>
      <div class="r-modebar"><div class="r-segment" role="group" aria-label="${T('观察模式','Observation mode')}">${['quick','wait'].map(v=>`<button type="button" data-action="r-mode" data-id="${v}" aria-pressed="${s.mode===v}">${v==='quick'?T('快速识别','Quick'):T('等候模式','Wait')}</button>`).join('')}</div><div class="r-top-actions">${R.button('ⓘ','r-mode-help',`aria-label="${T('模式与设备温度说明','Mode and device temperature guidance')}" aria-expanded="${s.helpOpen}"`)}${R.button(icon(paused?'video':'minus'),paused?'r-resume':'r-pause',`aria-label="${paused?T('恢复取景','Resume viewfinder'):T('暂停取景','Pause viewfinder')}"`)}</div></div>
      <button type="button" class="r-mode-caption" data-action="r-mode-help">${s.mode==='quick'?T('快速模式久用可能发热 · 查看建议','Extended Quick use may warm your phone · tips'):T('长时间观鸟，用等候模式 · 查看说明','Watching for longer? Use Wait · details')}</button>
      ${s.helpOpen?`<aside class="r-mode-advice" aria-label="${T('模式使用建议','Mode guidance')}"><strong>${T('长时间观鸟，建议切换等候模式','Use Wait for longer observations')}</strong><p>${T('快速识别持续使用可能增加发热和耗电，部分手机可能变慢。等候模式旨在减少持续分析；仍可能发热，必要时可以暂停取景。','Extended Quick use may increase heat and battery use, and some phones may slow down. Wait is intended to reduce continuous analysis; it can still generate heat. Pause the viewfinder when needed.')}</p><div>${s.mode==='quick'?btn(T('切换等候模式','Switch to Wait'),'r-mode','small','data-id="wait"'):''}${btn(T('知道了','Got it'),'r-help-close','secondary small')}</div></aside>`:''}
      ${!blocked&&!paused?`<div class="r-zoom-row"><div class="r-zoom-buttons">${[1,2,3].map(z=>`<button type="button" data-action="r-zoom" data-id="${z}" aria-pressed="${s.zoom===z}">${z}×</button>`).join('')}</div><input type="range" min="1" max="5" step="0.1" value="${s.zoom}" data-r-zoom aria-label="${T('取景缩放示例','Viewfinder zoom example')}"></div>`:''}
      <div class="r-dock"><div class="r-evidence-panel ${s.detailsOpen?'expanded':''}" data-r-evidence-swipe><div class="r-evidence-tabs" role="tablist" aria-label="${T('识别线索展示','Identification clue display')}">${[['visual',T('画面线索','Visual')],['audio',T('声音线索','Sound')]].map(([id,label])=>`<button type="button" role="tab" id="r-tab-${id}" aria-controls="r-panel-${id}" aria-selected="${s.focus===id}" data-action="r-focus" data-id="${id}">${icon(id==='audio'?'mic':'scan')}<span>${label}</span>${id==='audio'?`<i class="r-audio-dot ${audioOff?'off':''}" aria-label="${audioOff?T('声音暂停','Audio paused'):T('声音开启','Audio enabled')}"></i>`:''}</button>`).join('')}<button type="button" class="r-expand" data-action="r-evidence-expand" aria-expanded="${s.detailsOpen}" aria-label="${s.detailsOpen?T('收起线索详情','Collapse clue details'):T('展开线索详情','Expand clue details')}">${s.detailsOpen?'⌄':'⌃'}</button></div>
      <div class="r-clue-summary" ${s.detailsOpen?'hidden':''}><strong>${esc(audioFocus?audioStatus:visualStatus)}</strong><small>${audioFocus?T('独立声音线索 · 示例','Independent audio · sample'):T('示例匹配度，非正确率','Sample match, not accuracy')}</small></div>
      <div id="r-panel-visual" role="tabpanel" aria-labelledby="r-tab-visual" ${s.detailsOpen&&!audioFocus?'':'hidden'}><div class="r-identification"><div class="r-result-row"><span>${stale?T('上次线索','Last clue'):T('视觉线索','Visual clue')}</span><strong>${esc(visualStatus)}</strong></div><p class="r-evidence-status">${result.pending?T('新线索出现，正在确认鸟名','Checking a possible species change'):result.held?T('画面暂不清晰，保留上次判断','View unclear; retaining previous judgment'):stale?T('结果已过时，不与当前画面叠加','Result is stale; no overlay on the current view'):T('匹配分数不代表正确概率；切换展示不关闭声音识别。','Match is not accuracy. Switching this display does not disable audio.')}</p></div></div>
      <div id="r-panel-audio" role="tabpanel" aria-labelledby="r-tab-audio" ${s.detailsOpen&&audioFocus?'':'hidden'}><div class="r-audio"><button type="button" data-action="r-audio" aria-pressed="${!audioOff}" aria-label="${audioOff?T('开启声音线索','Enable audio clues'):T('暂停声音线索','Pause audio clues')}">${icon('mic')}${audioOff?'<span>／</span>':''}</button><div class="r-audio-copy"><strong>${esc(audioStatus)}</strong><span>${disagree?T('可能与画面不是同一只鸟','May be a different bird from the one shown'):T('声音单独分析，不直接替画面下结论','Audio is analysed separately from the image')}</span></div><button type="button" class="r-keep-audio" data-action="r-keep-audio" ${audioOff||paused||s.recording?'disabled':''}>${T('留鸟鸣','Keep call')}</button></div></div>
      </div><div class="r-capture-controls">${R.button(icon('image')+`<span>${T('相册 / 文件','Import')}</span>`,'r-import')}<button type="button" class="r-shutter ${s.recording?'recording':''}" data-r-shutter aria-label="${s.recording?T('结束录像','Stop video'):T('拍摄；长按录像','Capture; hold for video')}" ${blocked||paused?'disabled':''}><span></span></button>${R.button(`<span class="r-count">${s.assets.length||icon('check')}</span><span>${T('复核素材','Review')}</span>`,'r-review')}</div><p class="r-capture-hint">${s.recording?T('松开结束录像 · 示例','Release to finish video · sample'):T('轻触拍照，长按录像 · 示例','Tap photo, hold video · sample')}</p></div>
    </section>`;
  },
  importPage(){
    const s=R.s,audio=s.importKind==='audio';
    return `<div class="pad r-page"><div class="eyebrow">${T('先拍下来，也可以稍后辨认','Capture now, identify later')}</div><h1 class="page-title">${T('导入识别','Import evidence')}</h1><p class="sub">${T('保留系统相机拍摄的原件。导入不会改动或上传设备文件。','Keep your stock-camera originals. Importing does not modify or upload device files.')}</p><div class="r-segment r-import-tabs">${[['gallery',T('照片 / 视频','Photos / video')],['audio',T('音频文件','Audio files')]].map(([v,label])=>`<button type="button" data-action="r-import-kind" data-id="${v}" aria-pressed="${s.importKind===v}">${label}</button>`).join('')}</div><button type="button" class="r-import-drop" data-action="r-choose-file">${icon(audio?'mic':'image')}<strong>${audio?T('选择音频文件','Choose audio files'):T('从设备选择照片或视频','Choose photos or video')}</strong><span>${audio?'MP3 · WAV · M4A · OGG':'JPG · PNG · WebP · MP4 · WebM'}</span></button><p class="tiny">${T('正式大小与数量限制待确定。超限图片计划先优化副本，保留原图。','Final size and count limits are undecided. Oversized images are planned to use an optimized copy; originals stay intact.')}</p><details class="r-demo-limits"><summary>${T('浏览器原型说明','Browser prototype notes')}</summary><p>${T('为保护演示内存，当前临时限制为 6 份素材；图片 6 MB、视频 40 MB、音频 20 MB。这不是正式产品限制，当前也未接入自动压缩。','Temporary demo guards: six items, 6 MB/image, 40 MB/video, 20 MB/audio. These are not product limits. Automatic compression is not connected.')}</p></details>${s.error?note(esc(s.error),'error'):''}<div class="r-samples"><span class="tiny">${T('没有文件？用明确标注的示例体验','No file handy? Try labelled samples')}</span><div class="r-sample-buttons">${(audio?[['sound',T('音频示例','Audio sample')]]:[['photo',T('图片示例','Photo sample')],['video',T('视频示例','Video sample')]]).map(([kind,label])=>btn(label,'r-sample','secondary small',`data-id="${kind}"`)).join('')}</div></div>${s.assets.length?`<div class="r-section-head"><strong>${T('本次素材','Session evidence')} · ${s.assets.length}</strong>${btn(T('复核所选素材','Review selection'),'r-review','small')}</div>${R.assetList(false)}`:''}${note(T('拍摄时间、地点未知时保持未知，不套用当前天气或位置。你可以在保存前补充。','Unknown capture time and place stay unknown. Current weather or location is not substituted; add details before saving.'))}</div>`;
  },
  assetList(interactive=true){
    return R.s.assets.map(a=>`<article class="r-asset ${a.selected?'selected':''}"><button type="button" class="r-asset-thumb" data-action="r-preview" data-id="${a.id}" aria-label="${esc(T('预览 ','Preview ')+R.label(a))}">${a.kind==='sound'?icon('sound'):a.kind==='video'?icon('video'):a.url?`<img src="${esc(a.url)}" alt="">`:bird(a.variation?'#627452':'#856b4b')}</button><div class="r-asset-copy"><strong>${esc(R.label(a))}</strong><small>${R.source(a)}</small><small>${a.album==='failed'?T('相册：未保存，可重试','Album: not saved; retry available'):a.album==='sample-saved'?T('相册：示例成功','Album: sample success'):a.origin==='recovery'?T('尚未加入相册或收藏','Not in album or collection'):a.album==='not-applicable'?T('音频素材 · 不写入照片相册','Audio evidence · no photo-album save'):a.sample?T('示例素材 · 未写入相册','Sample evidence · not saved to album'):T('原文件保留在设备','Original stays on device')}</small>${a.album==='failed'?`<button type="button" class="text-button" data-action="r-album" data-id="${a.id}">${T('重试保存相册（示例）','Retry album save (sample)')}</button>`:''}</div><div class="r-asset-actions">${interactive?`<input type="checkbox" data-r-select="${a.id}" aria-label="${esc(T('保留 ','Keep ')+R.label(a))}" ${a.selected?'checked':''}>`:''}<button type="button" class="r-remove" data-action="r-remove" data-id="${a.id}" aria-label="${esc(T('移除 ','Remove ')+R.label(a))}">${icon('close')}</button></div></article>`).join('');
  },
  preview(){
    const a=(S.view.recordId?source(S.view.recordId)?.evidence:R.s.assets)?.find(a=>a.id===S.view.id);if(!a)return `<div class="pad">${note(T('素材已移除','Evidence removed'))}${btn(T('返回复核','Back to review'),'r-review')}</div>`;
    return `<div class="pad r-page"><h1 class="page-title">${esc(R.label(a))}</h1><p class="sub">${R.source(a)}</p>${a.url?(a.kind==='video'?`<video class="r-media-preview" controls playsinline preload="metadata" src="${esc(a.url)}"></video>`:a.kind==='sound'?`<audio class="r-audio-player" controls preload="metadata" src="${esc(a.url)}"></audio>`:art(R.sampleMedia(a),'detail-art')):art(R.sampleMedia(a),'detail-art')}${a.kind!=='photo'&&!S.view.recordId?`<div class="r-clip-range"><strong>${T('用于分析的片段','Segment for analysis')}</strong><p class="r-duration tiny">${a.duration?T('总时长 ','Duration ')+a.duration.toFixed(1)+' s':T('正在读取时长…','Reading duration…')}</p><div class="r-range-fields"><label>${T('开始（秒）','From (s)')}<input type="number" min="0" max="${a.duration||0}" step="0.1" value="${a.segment?.from||0}" data-r-trim="from" ${a.duration?'':'disabled'}></label><label>${T('结束（秒）','To (s)')}<input type="number" min="0" max="${a.duration||0}" step="0.1" value="${a.segment?.to||Math.min(a.duration||0,15)}" data-r-trim="to" ${a.duration?'':'disabled'}></label></div><p class="tiny">${T('只选择分析范围；不裁剪或覆盖设备原件。','Select the analysis range; the device original is not trimmed or overwritten.')}</p></div>`:''}<p class="r-playback-error form-error" role="alert" hidden></p><p class="tiny">${a.sample?T('示例素材，不代表真实拍摄或模型分析。','Sample evidence, not a real capture or model result.'):T('本地预览；媒体无法播放时可重选，已有素材不会自动删除。','Local preview. If playback fails, reselect; evidence is not deleted automatically.')}</p><p class="tiny">${T('观察时间与地点：待补充或保持未知','Observation time and place: add later or keep unknown')}</p><div class="actions">${S.view.recordId?btn(T('返回观察详情','Back to observation'),'back'):`${btn(a.selected?T('取消保留','Deselect'):T('选择保留','Keep this item'),'r-toggle-asset','secondary',`data-id="${a.id}"`)}${btn(T('返回素材复核','Return to review'),'r-review')}`}</div></div>`;
  },
  nameChoice(){
    const s=R.s,r=s.result,suggestions=[];
    if(s.analysis==='done'&&!r?.empty){
      if(s.chosen().some(a=>a.kind!=='sound'))suggestions.push({id:r?.visualSpecies||'sparrow',label:T('采用画面建议：','Use visual suggestion: ')});
      const audio=s.audioClue?.species||(r?.disagree?'tit':'sparrow');
      if((s.audioClue||s.chosen().some(a=>a.kind==='sound'||a.kind==='video'))&&!suggestions.some(a=>a.id===audio))suggestions.push({id:audio,label:T('采用声音建议：','Use audio suggestion: ')});
    }
    return `<section class="r-name-choice"><div class="r-section-head"><strong>${T('记录鸟名','Name in your record')}</strong><span class="pill">${T('可选','Optional')}</span></div><p class="tiny">${T('这是这条观察保存的鸟名。不确定可直接保存为“待鉴定”。','This is the name saved with your observation. Leave it unresolved if you are unsure.')}</p><div class="r-name-current"><span>${T('将保存为','Will save as')}</span><strong data-r-chosen-name>${esc(sp(s.selection))}</strong>${s.selection!=='unresolved'?btn(T('暂不确定','Keep unresolved'),'r-clear-name','quiet small'):''}</div><div class="r-name-actions">${suggestions.map(a=>btn(esc(a.label+sp(a.id)),'r-adopt-name','secondary small',`data-id="${esc(a.id)}"`)).join('')}${btn(s.manualOpen?T('收起手动填写','Hide manual entry'):T('手动填写鸟名','Enter a name'),'r-manual-name','quiet small')}</div>${s.manualOpen?`<div class="field"><label for="r-manual-bird-name">${T('鸟名（不知道可以留空）','Bird name (leave blank if unknown)')}</label><input id="r-manual-bird-name" type="text" maxlength="80" data-r-manual-name value="${s.selection==='unresolved'?'':esc(sp(s.selection))}" placeholder="${T('填写你知道的名称','Enter a name you know')}"></div>`:''}</section>`;
  },
  review(){
    const s=R.s,chosen=s.chosen(),r=s.result,hasVisual=chosen.some(a=>a.kind!=='sound'),hasAudio=!!s.audioClue||chosen.some(a=>a.kind==='sound'||a.kind==='video');
    return `<div class="pad r-page"><div class="eyebrow">${T('拍到的先留住，鸟名慢慢核对','Keep the capture; review the species')}</div><h1 class="page-title">${T('复核这次发现','Review this encounter')}</h1><p class="sub">${T('勾选要保留的素材。自动候选需你确认；收藏与公开分享以后分别选择。','Choose evidence to keep. Recovery candidates need your confirmation; collection and sharing remain separate.')}</p>${s.assets.some(a=>a.origin==='recovery')?note(T('补救示例：最多两张预览质量候选，默认未选中，不是原画回放。','Recovery sample: two preview-quality candidates, unselected by default; not full-quality replay.'),'warm'):''}${s.assets.length?R.assetList():note(T('还没有素材。可以继续拍摄，或从相册和文件导入。','No evidence yet. Continue capturing or import gallery/files.'))}<div class="r-section-head"><strong>${T('识别线索','Identification clues')}</strong><span class="pill">${T('模拟结果','Simulated')}</span></div>${s.analysis==='busy'?`<div class="r-analysis-pending" role="status">${T('正在演示分析所选素材…','Simulating analysis of selected evidence…')}${btn(T('取消，保留素材','Cancel and keep evidence'),'r-cancel-analysis','quiet small')}</div>`:s.analysis==='error'?`${note(T('识别暂未完成；素材和选择仍保留，可重试或保存待鉴定。','Identification did not finish. Evidence and choices remain; retry or save unresolved.'),'error')}${btn(T('重试示例分析','Retry sample analysis'),'r-analyse','secondary wide')}`:btn(s.analysis==='done'?T('重新分析所选素材（示例）','Reanalyse selection (sample)'):T('分析所选素材（示例）','Analyse selection (sample)'),'r-analyse','secondary wide',chosen.length?'':'disabled')}${s.analysis==='done'?r?.empty?note(T('暂无可靠候选，可以直接保存为待鉴定。','No reliable candidate. You can save unresolved.'),'warm'):`<div class="r-findings">${hasVisual?`<p><span>${T('视觉线索','Visual clue')}</span><b>${sp(r?.visualSpecies||'sparrow')} · ${r?.visualScore||86}%</b><small>${T('示例匹配度，非正确率','Sample match, not accuracy')}</small></p>`:''}${hasAudio?`<p><span>${T('声音线索','Audio clue')}</span><b>${sp(s.audioClue?.species||(r?.disagree?'tit':'sparrow'))}</b><small>${r?.disagree?T('可能来自另一只鸟；不合并分数','May be another bird; scores kept separate'):s.audioClue&&!chosen.some(a=>a.kind==='sound'||a.kind==='video')?T('近期声音判断 · 未保留音频文件','Recent audio clue · no audio file retained'):T('视频音轨 / 音频示例','Video soundtrack / audio sample')}</small></p>`:''}</div>`:note(T('尚未分析。可先保存，鸟种保持待鉴定。','Not analysed yet. Save first with species unresolved.'))}${R.nameChoice()}<div class="r-review-bottom">${btn(T('继续，保存私人观察','Continue to private record'),'r-save','wide',chosen.length?'':'disabled')}${btn(T('继续取景','Continue capturing'),'r-live','quiet wide')}${btn(T('再导入素材','Import more'),'r-import','quiet wide')}</div>${note(T('本原型的素材与观察仅在当前会话保留；不代表已写入手机相册或云端。','Evidence and observations in this prototype are session-only; no phone album or cloud save occurs.'))}</div>`;
  },
  openReview(){clearTimeout(R.holdTimer);if(R.s.phase==='live'&&R.s.audio&&S.scenario!=='audio-denied')R.s.audioClue={sample:true,species:S.scenario==='live-disagree'?'tit':'sparrow',association:'unconfirmed',windowSeconds:3};R.s.finish(S.scenario);push('recognitionReview');},
  capture(kind='photo'){
    const a=R.s.capture(kind,S.scenario);if(a&&kind!=='sound'){const clue=R.sampleResult();a.visualClue={sample:true,species:clue.code,score:clue.score};}if(a&&R.s.audio&&S.scenario!=='audio-denied')R.s.audioClue={sample:true,species:S.scenario==='live-disagree'?'tit':'sparrow',association:'unconfirmed',windowSeconds:3};if(!a){toast(T('本次素材已达上限，请先复核','Review the current evidence before capturing more'));return;}
    renderApp();toast(kind==='sound'?T('已保留一段鸟鸣示例，可在素材中复核','Bird-call sample retained for review'):a.album==='failed'?T('示例拍摄完成；相册保存失败，素材仍保留','Sample captured; album save failed, evidence retained'):T('示例拍摄完成，点击右侧复核素材','Sample captured. Review with the right-hand button.'));
  },
  analyse(){const token=R.s.beginAnalysis();if(token===null)return;renderApp();clearTimeout(R.analysisTimer);R.analysisTimer=setTimeout(()=>{if(R.s.complete(token,S.scenario)&&S.view.name==='recognitionReview')renderApp();},850);},
  action(a,id,node){
    if(!a.startsWith('r-'))return false;
    const s=R.s;
    if(a==='r-keep-audio'){R.capture('sound');return true;}
    if(a==='r-record-evidence'){push('recognitionPreview',{id,recordId:node.dataset.recordId});return true;}
    if(a==='r-mode'){s.mode=id;s.helpOpen=false;}
    if(a==='r-mode-help')s.helpOpen=!s.helpOpen;
    if(a==='r-help-close')s.helpOpen=false;
    if(a==='r-focus')s.focusOn(id);
    if(a==='r-evidence-expand')s.detailsOpen=!s.detailsOpen;
    if(a==='r-adopt-name'){s.chooseName(id);s.manualOpen=false;}
    if(a==='r-clear-name')s.chooseName('');
    if(a==='r-manual-name')s.manualOpen=!s.manualOpen;
    if(a==='r-pause'){if(s.recording)s.capture('video',S.scenario);s.phase='paused';}
    if(a==='r-resume'){s.phase='live';}
    if(a==='r-live'){s.phase='live';s.recovered=false;goTab('identify');return true;}
    if(a==='r-import'){if(s.recording)s.capture('video',S.scenario);s.invalidate();push('recognitionImport');return true;}
    if(a==='r-import-kind')s.importKind=id;
    if(a==='r-choose-file'){$(s.importKind==='audio'?'#recognition-audio-input':'#recognition-media-input').click();return true;}
    if(a==='r-sample'){if(s.assets.length>=6){toast(T('本次最多保留 6 份素材，请先复核','Review the current six items first'));return true;}s.add(id,'import',{duration:id==='video'?12:id==='sound'?6:0,...(id==='photo'?{}:{segment:{from:0,to:id==='video'?12:6}})});s.invalidate();}
    if(a==='r-review'){R.openReview();return true;}
    if(a==='r-preview'){push('recognitionPreview',{id});return true;}
    if(a==='r-remove'){const asset=s.assets.find(x=>x.id===id);s.remove(id);if(asset?.url&&!S.records.some(r=>r.media?.url===asset.url||r.evidence?.some(e=>e.url===asset.url))){URL.revokeObjectURL(asset.url);R.urls.delete(asset.url);}}
    if(a==='r-toggle-asset')s.toggle(id);
    if(a==='r-zoom')s.zoom=Number(id);
    if(a==='r-audio')s.audio=!s.audio;
    if(a==='r-album'){const asset=s.assets.find(x=>x.id===id);if(asset){asset.album=['low-storage','album-denied'].includes(S.scenario)?'failed':'sample-saved';toast(asset.album==='failed'?T('示例仍无法保存相册；请保留当前素材','Sample album save still failed; evidence retained'):T('示例相册状态已更新','Sample album state updated'));}}
    if(a==='r-analyse'){R.analyse();return true;}
    if(a==='r-cancel-analysis'){s.invalidate();clearTimeout(R.analysisTimer);}
    if(a==='r-leave-recording'){const target=S.dialog.target;s.capture('video',S.scenario);finishLeave(target);return true;}
    if(a==='r-save'){
      const chosen=s.chosen();if(!chosen.length)return true;const analysisDone=s.analysis==='done',result=s.result;s.invalidate();
      const cover=chosen.find(x=>x.kind==='photo')||chosen[0];
      S.input={id:'bundle-'+Date.now(),media:R.sampleMedia(cover),bundle:chosen.map(x=>({...x})),audioClue:s.audioClue?{...s.audioClue}:null,assessment:analysisDone?{demo:true,model:'demo-multimodal-v1',items:result?.empty?[]:[{species:result?.visualSpecies||'sparrow',score:(result?.visualScore||86)/100}],sourceState:'normal',audioVisualDisagree:!!result?.disagree}:null};
      S.forms.candidates={manual:'',selected:s.selection};delete S.forms.save;startSave();return true;
    }
    renderApp();return true;
  },
  bind(){
    clearInterval(R.timer);clearInterval(R.recordTimer);R.recordTimer=null;
    document.querySelectorAll('.r-media-preview,.r-audio-player').forEach(media=>media.addEventListener('error',()=>{const error=$('.r-playback-error');if(error){error.hidden=false;error.textContent=T('此文件无法在当前浏览器播放。素材仍保留，可换用其他文件。','This browser cannot play this file. Evidence is retained; try another file.');}}));
    document.querySelectorAll('[data-r-trim]').forEach(input=>input.addEventListener('change',()=>{const a=R.s.assets.find(a=>a.id===S.view.id),from=Number($('[data-r-trim=from]').value),to=Number($('[data-r-trim=to]').value);if(!R.s.setSegment(a?.id,from,to)){toast(T('请选择有效的起止时间','Choose a valid time range'));input.value=a?.segment?.[input.dataset.rTrim]??(input.dataset.rTrim==='from'?0:Math.min(a?.duration||0,15));}}));
    document.querySelectorAll('.r-media-preview,.r-audio-player').forEach(media=>{const a=R.s.assets.find(a=>a.id===S.view.id);const ready=()=>{if(!a||!Number.isFinite(media.duration)||media.duration<=0)return;a.duration=media.duration;a.segment||={from:0,to:Math.min(a.duration,15)};const duration=$('.r-duration');if(duration)duration.textContent=T('总时长 ','Duration ')+a.duration.toFixed(1)+' s';document.querySelectorAll('[data-r-trim]').forEach(input=>{input.disabled=false;input.max=a.duration;input.value=a.segment[input.dataset.rTrim];});};media.addEventListener('loadedmetadata',ready);if(media.readyState>=1)ready();});
    const live=R.liveViews.has(S.view.name)&&!S.dialog;
    $('#app').classList.toggle('recognition-live',live);
    if(!live){if(R.s.phase!=='paused')R.s.phase='inactive';if(S.view.name!=='recognitionReview'&&R.s.analysis==='busy'){R.s.invalidate();clearTimeout(R.analysisTimer);}return;}
    if(R.s.phase==='inactive')R.s.phase='live';
    const panel=$('[data-r-evidence-swipe]');let swipeStart=null;
    panel?.addEventListener('pointerdown',e=>{if(e.target.closest('button,input'))return;swipeStart={x:e.clientX,y:e.clientY};panel.setPointerCapture(e.pointerId);});
    panel?.addEventListener('pointerup',e=>{if(!swipeStart)return;const dx=e.clientX-swipeStart.x,dy=e.clientY-swipeStart.y;swipeStart=null;if(Math.abs(dx)>=48&&Math.abs(dx)>Math.abs(dy)*1.3){R.s.focusOn(dx<0?'audio':'visual');renderApp();}});
    panel?.addEventListener('pointercancel',()=>{swipeStart=null;});
    panel?.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();R.s.focusOn(e.key==='ArrowRight'?'audio':'visual');renderApp();$('[data-action=r-focus][data-id='+R.s.focus+']')?.focus();}});
    const scene=$('[data-r-viewfinder]'),slider=$('[data-r-zoom]');
    const zoom=value=>{R.s.zoom=Math.max(1,Math.min(5,value));const el=$('.r-scene');if(el)el.style.setProperty('--r-zoom',R.s.zoom);if(slider)slider.value=R.s.zoom;const box=$('.r-bird-box');if(box)box.style.cssText=R.boxStyle(R.s.zoom);};
    slider?.addEventListener('input',e=>zoom(Number(e.target.value)));
    const points=new Map();let base=null;
    scene?.addEventListener('pointerdown',e=>{if(e.target.closest('button,input'))return;points.set(e.pointerId,{x:e.clientX,y:e.clientY});scene.setPointerCapture(e.pointerId);if(points.size===2){const p=[...points.values()];base={d:Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y),z:R.s.zoom};}});
    scene?.addEventListener('pointermove',e=>{if(!points.has(e.pointerId))return;points.set(e.pointerId,{x:e.clientX,y:e.clientY});if(points.size===2&&base?.d){const p=[...points.values()];zoom(base.z*Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y)/base.d);}});
    for(const type of ['pointerup','pointercancel'])scene?.addEventListener(type,e=>{points.delete(e.pointerId);base=null;});
    const shutter=$('[data-r-shutter]');let held=false,pressed=false;
    const start=()=>{if(pressed||shutter.disabled)return;pressed=true;held=false;R.holdTimer=setTimeout(()=>{if(!pressed)return;if(R.s.beginVideo()){held=true;R.paintRecording();}else{pressed=false;toast(T('本次素材已达上限，请先复核','Review the current evidence before capturing more'));}},380);};
    const finish=cancel=>{if(!pressed)return;pressed=false;clearTimeout(R.holdTimer);if(cancel){R.s.recording=false;renderApp();return;}R.capture(held?'video':'photo');};
    shutter?.addEventListener('pointerdown',e=>{e.preventDefault();shutter.setPointerCapture(e.pointerId);start();});
    shutter?.addEventListener('pointerup',()=>finish(false));shutter?.addEventListener('pointercancel',()=>finish(true));
    shutter?.addEventListener('keydown',e=>{if([' ','Enter'].includes(e.key)&&!e.repeat){e.preventDefault();start();}});
    shutter?.addEventListener('keyup',e=>{if([' ','Enter'].includes(e.key)){e.preventDefault();finish(false);}});
    if(R.s.recording)R.paintRecording();
    else if(S.scenario==='live-switch'&&R.revision<3)R.timer=setInterval(()=>{if(!R.liveViews.has(S.view.name)||R.s.phase==='paused')return;R.revision++;renderApp();},2400);
  },
  paintRecording(){
    const s=R.s;$('.r-shutter')?.classList.toggle('recording',s.recording);
    const status=$('.r-connection');if(status)status.innerHTML='● '+String(Math.floor(s.duration/60)).padStart(2,'0')+':'+String(s.duration%60).padStart(2,'0');
    const summary=$('.r-clue-summary strong');if(summary&&R.s.focus==='audio')summary.textContent=T('录像音轨稍后分析','Video audio will be analysed later');
    const hint=$('.r-capture-hint');if(hint)hint.textContent=T('松开结束录像（示例）','Release to finish video (sample)');
    const audio=$('.r-audio-copy');if(audio)audio.innerHTML=`<strong>${T('录像中 · 声音稍后分析','Recording · audio analysis afterward')}</strong><span>${T('结束后检查视频音轨','Review soundtrack after capture')}</span>`;
    if(s.recording&&!R.recordTimer){R.recordTimer=setInterval(()=>{if(!R.s.recording){clearInterval(R.recordTimer);R.recordTimer=null;return;}R.s.duration++;R.paintRecording();},1000);}
  },
  async importFiles(files){
    const token=++R.importToken;R.s.error='';
    for(const file of files){
      if(R.s.assets.length>=6){R.s.error=T('本次最多保留 6 份素材，其他文件未导入。','This session holds six items; remaining files were not imported.');break;}
      const type=file.type.toLowerCase(),ext=file.name.split('.').at(-1).toLowerCase();
      const kind=/^image\/(jpeg|png|webp)$/.test(type)?'photo':/^video\/(mp4|webm)$/.test(type)||(!type&&['mp4','webm'].includes(ext))?'video':/^audio\/(mpeg|mp3|wav|x-wav|mp4|x-m4a|ogg)$/.test(type)||(!type&&['mp3','wav','m4a','ogg'].includes(ext))?'sound':null;
      const max=kind==='photo'?6:kind==='video'?40:20;
      if(!kind||!file.size||file.size>max*1024*1024){R.s.error=T('有文件格式或大小不受支持；已有素材保留。','A file type or size is unsupported; existing evidence is retained.');continue;}
      if(token!==R.importToken)return;
      const url=URL.createObjectURL(file);
      if(kind==='photo'){const valid=await new Promise(resolve=>{const image=new Image();image.onload=()=>resolve(image.naturalWidth>0&&image.naturalHeight>0);image.onerror=()=>resolve(false);image.src=url;});if(!valid||token!==R.importToken){URL.revokeObjectURL(url);if(!valid)R.s.error=T('图片无法读取；已有素材保留。','The image could not be decoded; existing evidence is retained.');continue;}}
      R.urls.add(url);R.s.add(kind,'import',{sample:false,name:file.name,url,size:file.size});
    }
    R.s.invalidate();if(S.view.name==='recognitionImport')renderApp();
  },
  importToken:0
};
