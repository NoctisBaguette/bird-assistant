'use strict';

// Pure geometry is shared by the UI and the tests. All coordinates are demo coordinates.
const BirdUX = {
  regions: [{id:'lake',x:35,y:43},{id:'wood',x:73,y:24}],
  currentPoint: {x:50.75,y:72.65625},
  pois: [
    {id:'lake',region:'lake',x:35,y:43,zh:'湖畔公园',en:'Lakeside park'},
    {id:'wood',region:'wood',x:73,y:24,zh:'林间小径',en:'Woodland path'},
    {id:'reed',region:'lake',x:24,y:64,zh:'芦苇栈道',en:'Reed boardwalk'},
    {id:'lookout',region:'lake',x:59,y:65,zh:'湖畔观鸟台',en:'Lakeside lookout'},
    {id:'grove',region:'wood',x:65,y:16,zh:'松林休憩点',en:'Pine grove'},
    {id:'gate',region:'wood',x:85,y:34,zh:'林间入口',en:'Woodland entrance'}
  ],
  clamp(v,a,b){return Math.max(a,Math.min(b,v));},
  offsetFor(point,width,height,zoom){return {x:(.5-point.x/100)*width*zoom,y:(.5-point.y/100)*height*zoom};},
  centerAt(offset,width,height,zoom){return {x:(.5-offset.x/width/zoom)*100,y:(.5-offset.y/height/zoom)*100};},
  regionAt(point,current,margin=4){
    const distance=r=>Math.hypot((point.x-r.x)*.625,point.y-r.y);
    const ranked=this.regions.slice().sort((a,b)=>distance(a)-distance(b));
    const previous=this.regions.find(r=>r.id===current);
    return previous&&distance(previous)<=distance(ranked[0])+margin?previous.id:ranked[0].id;
  },
  search(query){const q=String(query).trim().toLowerCase();return this.pois.filter(p=>!q||(p.zh+' '+p.en).toLowerCase().includes(q));},
  cropRect(width,height,crop){
    const rotated=Math.abs(crop.rotation||0)%180!==0,rw=rotated?height:width,rh=rotated?width:height;
    const side=Math.min(rw,rh)/this.clamp(crop.zoom||1,1,3);
    return {width:rw,height:rh,side,x:(rw-side)*this.clamp(crop.x??.5,0,1),y:(rh-side)*this.clamp(crop.y??.5,0,1)};
  }
};
if(typeof module!=='undefined')module.exports=BirdUX;

const X = {
  loadToken:0,crop:null,image:null,searchIndex:-1,
  poi(id){return BirdUX.pois.find(p=>p.id===id);},
  name(id){const p=X.poi(id);return p?L(p):L(places[id]);},
  template(id){
    const styles={owl:['#e4ecd8','#638459'],finch:['#f2e6d3','#a27d50'],leaf:['#e3eee8','#508770'],mountain:['#e3e9ef','#677e96'],water:['#e1eef0','#5d929b'],letter:['#eee4dc','#9a765d']};
    const [bg,fg]=styles[id]||styles.owl;
    const motifs={
      owl:`<path d="m25 37 9-22 12 17m9 0 12-17 9 22" fill="${fg}"/><ellipse cx="50" cy="55" rx="29" ry="31" fill="${fg}"/><g fill="#fff2d5"><circle cx="39" cy="48" r="11"/><circle cx="62" cy="48" r="11"/></g><g fill="#253c34"><circle cx="39" cy="48" r="4"/><circle cx="62" cy="48" r="4"/></g><path d="m45 62 6 9 6-9" fill="#c39553"/>`,
      finch:`<path d="m20 67 15-18 8 23" fill="${fg}"/><ellipse cx="50" cy="59" rx="24" ry="19" fill="${fg}"/><circle cx="65" cy="40" r="16" fill="${fg}"/><path d="m79 37 12 6-13 5" fill="#c7a157"/><path d="M34 57q22-7 30 12-20 5-30-12" fill="#f9edcc"/><circle cx="69" cy="39" r="3" fill="#253c34"/>`,
      leaf:`<path d="M73 23C37 15 17 42 30 65c25 20 51-7 43-42Z" fill="${fg}"/><path d="m25 81 40-46M43 61l-2-17m11 7 14 2" fill="none" stroke="#f0f6df" stroke-width="4" stroke-linecap="round"/>`,
      mountain:`<circle cx="71" cy="28" r="10" fill="#e8bc6f"/><path d="m10 79 30-47 21 31 15-22 21 38Z" fill="${fg}"/><path d="m30 48 10-16 11 17-12-5Z" fill="#f7f4eb"/>`,
      water:`<circle cx="65" cy="30" r="12" fill="#e6be72"/><path d="M8 54q21-17 44 0t40 0v38H8Z" fill="${fg}"/><path d="M18 68q18-10 35 0t29 0m-52 12q12-7 24 0" fill="none" stroke="#e9f5ef" stroke-width="3"/>`,
      letter:`<text x="50" y="66" text-anchor="middle" font-family="Georgia,serif" font-size="46" fill="${fg}">${esc((Array.from(S.forms.profile?.name||myName())[0]||'B').toUpperCase())}</text>`
    };
    return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="${bg}"/>${motifs[id]||motifs.owl}</svg>`);
  },
  profile(){
    const f=S.forms.profile||{name:myName(),avatar:S.profile.avatar,avatarEdit:clone(S.profile.avatarEdit||null)};S.forms.profile=f;
    return `<div class="pad"><h1 class="page-title">${T('编辑个人资料','Edit my profile')}</h1><form data-form="profile">${field(T('显示名称','Display name'),'name',f.name)}<div class="field"><label>${T('头像','Profile picture')}</label><div class="avatar-edit-head"><div class="avatar large">${f.avatar?`<img src="${esc(f.avatar)}" alt="${T('头像预览','Avatar preview')}">`:esc(Array.from(f.name||'B')[0])}</div><div class="stack">${btn(T('上传自己的图片','Upload a picture'),'x-avatar-upload','secondary small')}${f.avatarEdit?btn(T('重新裁剪','Adjust crop'),'x-avatar-recrop','quiet small'):''}</div></div><p class="tiny">${T('选择图片后可移动、缩放和旋转，圆形预览就是头像显示范围。','Move, zoom and rotate your picture. The circle previews the visible avatar area.')}</p></div><h2 class="section-title">${T('也可以选一个默认头像','Or choose a default avatar')}</h2><div class="avatar-templates">${[['owl',T('夜枭','Owl')],['finch',T('林雀','Finch')],['leaf',T('绿叶','Leaf')],['mountain',T('山岚','Mountain')],['water',T('湖光','Lake')],['letter',T('名字首字','Initial')]].map(([id,name])=>`<button type="button" data-action="x-avatar-template" data-id="${id}" aria-label="${name}" aria-pressed="${f.avatar===X.template(id)}"><img src="${esc(X.template(id))}" alt=""><span>${name}</span></button>`).join('')}</div>${f.error?`<div class="form-error" role="alert">${esc(errorMessage(f.error))}</div>`:''}<div class="actions">${btn(T('保存资料','Save profile'),'save-profile')}${btn(T('取消修改','Cancel changes'),'cancel-profile','quiet')}</div><p class="tiny">${T('本原型只在会话中处理头像，不上传图片；设备原件保留。','This prototype processes avatars in this session without uploading. Your original file is preserved.')}</p></form></div>`;
  },
  async loadAvatar(file){
    if(!file)return;
    const draft=S.forms.profile,token=++X.loadToken;
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>20*1024*1024){toast(T('浏览器演示支持 JPG、PNG、WebP，临时内存保护为 20 MB；请另选图片。原头像保留。','Choose JPG, PNG or WebP. This browser demo has a temporary 20 MB memory guard. Your previous avatar stays.'));return;}
    const url=URL.createObjectURL(file),image=new Image();
    image.onload=()=>{
      URL.revokeObjectURL(url);
      if(token!==X.loadToken||draft!==S.forms.profile||S.view.name!=='editProfile')return;
      try{
        if(image.naturalWidth*image.naturalHeight>40000000)throw Error('large');
        const scale=Math.min(1,2048/Math.max(image.naturalWidth,image.naturalHeight)),canvas=document.createElement('canvas');
        canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
        const ctx=canvas.getContext('2d');ctx.fillStyle='#fffef9';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0,canvas.width,canvas.height);
        toast(T('图片已读取，调整后确认裁剪。','Picture ready. Adjust it and confirm the crop.'));
        X.openCrop({src:canvas.toDataURL('image/jpeg',.93),width:canvas.width,height:canvas.height,zoom:1,x:.5,y:.5,rotation:0});
      }catch{toast(T('图片过大或无法处理，请换一张图片。原头像保留。','This image is too large or cannot be processed. Choose another; your avatar stays.'));}
    };
    image.onerror=()=>{URL.revokeObjectURL(url);if(token===X.loadToken)toast(T('图片无法解码，请重选。原头像保留。','Could not decode this image. Choose another; your avatar stays.'));};image.src=url;
  },
  openCrop(crop){X.crop=clone(crop);X.image=null;push('avatarCrop');},
  cropPage(){
    const c=X.crop;if(!c)return `<div class="pad">${note(T('请重新选择图片。','Select a picture again.'))}${btn(T('返回','Back'),'back','secondary')}</div>`;
    return `<div class="pad avatar-crop-page"><h1 class="page-title">${T('让头像刚刚好','Frame your picture')}</h1><p class="sub">${T('拖动图片调整位置，圆形外的部分不会显示。','Drag the picture to position it. Only the circular area will appear.')}</p><div class="avatar-crop-stage"><canvas width="512" height="512" data-avatar-canvas aria-label="${T('可拖动的圆形头像预览','Draggable circular avatar preview')}"></canvas><div class="avatar-crop-mask"></div></div><div class="avatar-crop-controls">${X.cropSlider(T('缩放','Zoom'),'zoom',1,3,.01,c.zoom)}${X.cropSlider(T('左右位置','Horizontal position'),'x',0,1,.01,c.x)}${X.cropSlider(T('上下位置','Vertical position'),'y',0,1,.01,c.y)}<div class="row">${btn('↶ '+T('左转','Rotate left'),'x-avatar-left','secondary small')}${btn('↷ '+T('右转','Rotate right'),'x-avatar-right','secondary small')}${btn(T('重置','Reset'),'x-avatar-reset','quiet small')}</div></div><div class="actions">${btn(T('使用这个裁剪','Use this crop'),'x-avatar-use')}${btn(T('取消裁剪','Cancel crop'),'x-avatar-cancel','quiet')}</div></div>`;
  },
  cropSlider(label,key,min,max,step,value){return `<label class="avatar-slider">${label}<input type="range" data-avatar-adjust="${key}" aria-label="${label}" min="${min}" max="${max}" step="${step}" value="${value}"></label>`;},
  drawCrop(canvas){
    if(!canvas||!X.crop||!X.image?.complete||!X.image.naturalWidth)return false;
    const c=X.crop,r=BirdUX.cropRect(c.width,c.height,c),ctx=canvas.getContext('2d'),k=canvas.width/r.side;
    ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#fffef9';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.save();
    ctx.scale(k,k);ctx.translate(-r.x,-r.y);ctx.translate(r.width/2,r.height/2);ctx.rotate(c.rotation*Math.PI/180);ctx.drawImage(X.image,-c.width/2,-c.height/2,c.width,c.height);ctx.restore();return true;
  },
  paintCrop(){const canvas=$('[data-avatar-canvas]');if(canvas)X.drawCrop(canvas);},
  bindCrop(){
    const canvas=$('[data-avatar-canvas]');if(!canvas||!X.crop)return;
    if(!X.image||X.image.src!==X.crop.src){const image=new Image();X.image=image;image.onload=()=>{if(X.image===image)X.paintCrop();};image.src=X.crop.src;}else X.paintCrop();
    let drag=null;
    canvas.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,crop:clone(X.crop)};canvas.setPointerCapture(e.pointerId);});
    canvas.addEventListener('pointermove',e=>{
      if(!drag)return;const r=BirdUX.cropRect(X.crop.width,X.crop.height,drag.crop),size=canvas.getBoundingClientRect().width;
      X.crop.x=r.width>r.side?BirdUX.clamp(drag.crop.x-(e.clientX-drag.x)*r.side/size/(r.width-r.side),0,1):.5;
      X.crop.y=r.height>r.side?BirdUX.clamp(drag.crop.y-(e.clientY-drag.y)*r.side/size/(r.height-r.side),0,1):.5;
      X.paintCrop();for(const key of ['x','y'])$(`[data-avatar-adjust="${key}"]`).value=X.crop[key];
    });
    const stop=()=>{drag=null;};canvas.addEventListener('pointerup',stop);canvas.addEventListener('pointercancel',stop);canvas.addEventListener('lostpointercapture',stop);
  },
  publicPlaceActions(id){
    const saved=S.placeBookmarks.has(id),visited=S.checkins.has(id);
    return `<div class="place-actions">${btn(icon('collection')+(saved?T('已公开收藏','Publicly saved'):T('公开收藏','Save publicly')),'x-place-save','secondary small',`data-id="${id}" aria-pressed="${saved}"`)}${btn(icon('check')+(visited?T('已公开打卡','Checked in publicly'):T('公开打卡','Check in publicly')),'x-place-checkin','secondary small',`data-id="${id}" aria-pressed="${visited}"`)}</div><p class="tiny">${T('公开活动展示你的名称与这个地点；不会发布私人观察或精确定位。','Public activity shows your name and this place, without publishing private observations or your precise location.')}</p>${saved||visited?`<div class="place-activity">${esc(myName())} · ${saved?T('收藏了这个地点','saved this place'):''}${saved&&visited?' · ':''}${visited?T('打卡：用户填写，未核验','check-in: user supplied, unverified'):''}</div>`:''}`;
  },
  publicConfirm(){const d=S.dialog;return `<div class="pad"><span class="pill">${T('公开活动 · 演示','Public activity · demo')}</span><h1 class="page-title">${d.activity==='save'?T('公开收藏这个地点？','Save this place publicly?'):T('公开打卡这个地点？','Check in here publicly?')}</h1><div class="snapshot"><h3>${esc(X.name(d.id))}</h3><p>${esc(myName())} · ${d.activity==='save'?T('地点收藏','Saved place'):T('用户填写的打卡，未核验到访','User-supplied check-in, visit unverified')}</p></div><p class="sub">${T('其他用户将能看到你的名称和这个地点。私人观察、照片、实时位置与行踪不会附带公开。','Other users will see your name and this place. Your private records, photographs, live position and travel history are not attached.')}</p>${btn(T('确认公开（示例）','Confirm public activity (sample)'),'x-place-confirm','wide')}${btn(T('取消','Cancel'),'dialog-cancel','quiet wide')}</div>`;},
  placeActivityPage(){
    const ids=[...new Set([...S.placeBookmarks,...S.checkins])];
    return `<div class="pad"><h1 class="page-title">${T('地点收藏与打卡','Saved places and check-ins')}</h1><p class="sub">${T('这里的活动为公开展示设计，与私人观察、鸟种收藏和他人内容书签分别管理。','These activities are designed to be public, managed separately from private observations, bird collections and bookmarks of others.')}</p>${ids.map(id=>`<button type="button" class="record" data-action="x-place-open" data-id="${id}">${icon('pin')}<div class="info"><strong>${esc(X.name(id))}</strong><p>${S.placeBookmarks.has(id)?T('公开收藏','Publicly saved'):''}${S.placeBookmarks.has(id)&&S.checkins.has(id)?' · ':''}${S.checkins.has(id)?T('公开打卡','Public check-in'):''}</p></div>${icon('arrow')}</button>`).join('')||empty(T('还没有地点活动。在地图搜索地点后可收藏或打卡。','No place activity yet. Search for a place on the map to save or check in.'))}${note(T('点击地点可重新打开，也可在地点详情中再次点击撤回。当前仍为会话演示。','Open a place to revisit it or withdraw an activity by pressing its button again. This remains a session demo.'))}</div>`;
  },
  communityConcept(kind){
    if(kind==='chat')return `<div class="snapshot"><h3>${T('私聊 · 和鸟友继续讨论','Direct chat · continue with a friend')}</h3><p>${T('第一版建议仅双向好友可发起。文字、观察卡片与手帐分享逐步加入；分享卡片只带用户明确选中的公开内容。','Start with mutual friends. Add text, observation cards and journals in stages; shared cards include only explicitly chosen public content.')}</p></div><div class="snapshot"><h3>${T('群聊 · 为一次约鸟建立小群','Group chat · plan an outing')}</h3><p>${T('邀请加入、管理员管理、群公告、静音和退群。不会因好友关系自动拉人，也不默认公开精确活动地点。','Invitation-based membership, admins, announcements, mute and leave. Friendship does not automatically add people or disclose precise meeting locations.')}</p></div>${note(T('开发边界：待发送 / 已发送 / 失败重试、未读、离线恢复，以及屏蔽与举报，都应先确定。现在先明确流程，真实消息服务后续接入；本页不会发送消息。','Define pending/sent/failed and retry, unread state, offline recovery, blocking and reporting first. Messaging infrastructure follows later; this page sends no messages.'))}`;
    return `<div class="snapshot"><h3>${T('第一版：记录习惯与个人里程碑','First version: habits and personal milestones')}</h3><p>${T('初次保存自己的观察、补充行为/环境笔记、完成第一份手帐。待鉴定与私人记录同样有效；徽章不证明鉴定正确，也不决定专家身份。','Save a first observation, add behavioural or habitat notes, and finish a first journal. Private and unresolved records count; badges do not certify identification accuracy or expertise.')}</p></div>${growthConcept()}${note(T('建议先做轻量里程碑；庭院、羽叶及知识练习保持提案，不先锁定数值。更新同一份记录不重复计奖，不以公开打卡、发布量或稀有鸟作为奖励条件。','Start with simple milestones. Keep the garden, feather leaves and learning exercises as proposals without fixed reward values. Editing a record earns no duplicate reward; public check-ins, post volume and rare birds are not reward conditions.'))}`;
  },
  action(a,id){
    if(!a.startsWith('x-'))return false;
    if(a==='x-avatar-upload')$('#avatar-photo-input').click();
    if(a==='x-avatar-template'){X.loadToken++;S.forms.profile.avatar=X.template(id);S.forms.profile.avatarEdit=null;S.dirty.add('editProfile');renderApp();}
    if(a==='x-avatar-recrop')X.openCrop(S.forms.profile.avatarEdit);
    if(a==='x-avatar-left'||a==='x-avatar-right'){X.crop.rotation=(X.crop.rotation+(a==='x-avatar-right'?90:270))%360;renderApp();}
    if(a==='x-avatar-reset'){Object.assign(X.crop,{zoom:1,x:.5,y:.5,rotation:0});renderApp();}
    if(a==='x-avatar-cancel'){X.loadToken++;X.crop=null;X.image=null;finishLeave(null);}
    if(a==='x-avatar-use'){
      const canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;
      if(!X.drawCrop(canvas)){toast(T('图片还未准备好，请稍后再试。','The image is not ready; try again shortly.'));return true;}
      S.forms.profile.avatar=canvas.toDataURL('image/jpeg',.92);S.forms.profile.avatarEdit=clone(X.crop);S.dirty.add('editProfile');X.crop=null;X.image=null;finishLeave(null);
    }
    if(a==='x-place-result'){chooseMapPlace(id);}
    if(a==='x-place-open'){goTab('home');chooseMapPlace(id);}
    if(a==='x-place-save'||a==='x-place-checkin'){
      const set=a==='x-place-save'?S.placeBookmarks:S.checkins;
      if(set.has(id)){set.delete(id);renderApp();toast(T('已撤回这条公开活动（示例）','Public activity withdrawn (sample)'));}
      else{S.dialog={kind:'placeActivity',id,activity:a==='x-place-save'?'save':'checkin'};renderApp();}
    }
    if(a==='x-place-confirm'){
      const d=S.dialog;if(S.scenario==='publish-error'){toast(T('模拟发布失败，未增加公开活动，可重试或取消。','Simulated publication failure; no public activity was added. Retry or cancel.'));return true;}
      (d.activity==='save'?S.placeBookmarks:S.checkins).add(d.id);S.dialog=null;renderApp();toast(T('已公开，私人观察未变化（示例）','Public activity added; private observations unchanged (sample)'));
    }
    return true;
  }
};
