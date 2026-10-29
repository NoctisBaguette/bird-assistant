'use strict';
/* Browser prototype: editable local compositions; provider-neutral writing adapter. No AI provider is configured. */
const J = {
  key:'bird-assistant-journals-v1',
  fonts:{serif:'Georgia,Songti SC,serif',sans:'Arial,PingFang SC,sans-serif',hand:'KaiTi,STKaiti,serif'},
  copy(x){return structuredClone(x);},
  id(){return 'j-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8);},
  state(){
    let drafts=[],error='';
    try{const a=JSON.parse(localStorage.getItem(J.key)||'[]');if(Array.isArray(a))drafts=a.filter(d=>[1,2].includes(d.schemaVersion)&&Array.isArray(d.elements)).map(d=>J.migrate(d));}catch{error='storage';}
    return {drafts,error,assets:[],selected:[],source:'observations',mode:'new',period:'custom',from:'',to:'',unknown:true,includeNotes:false,title:'',style:'nature',ratio:'3:4',current:null,selectedElement:'',tool:'',past:[],future:[],pending:null,exportUrl:'',downloadUrl:'',busy:false,modified:false,crop:null,transaction:null,viewMode:'focus',ai:{open:false,target:'new',photoId:'',photos:[],inputMode:'text',purpose:'reflection',placement:'below',prompt:'',result:null,error:'',busy:false,prepared:false}};
  },
  get s(){return S.journal;},
  sizes:{'3:4':[900,1200],'1:1':[1000,1000],'4:3':[1200,900]},
  styles(){return [['nature',T('自然手帐','Nature journal')],['magazine',T('杂志拼贴','Magazine collage')],['minimal',T('极简记录','Minimal notes')]];},
  labelRatio(r){return ({'3:4':T('3:4 竖版','3:4 portrait'),'1:1':T('1:1 方形','1:1 square'),'4:3':T('4:3 横版','4:3 landscape')})[r];},
  dataSvg(svg){return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);},
  sample(color,index){
    const sky=['#dce6dc','#dde9ec','#eadfc8','#d4dfc5'][index%4];
    return J.dataSvg('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450"><rect width="600" height="450" fill="'+sky+'"/><circle cx="480" cy="90" r="48" fill="#fff9de" opacity=".7"/><path d="M0 300Q180 190 330 310T600 260V450H0" fill="#9eb8a0"/><path d="M0 380Q250 300 600 360V450H0" fill="#779b85"/><path d="M60 0Q180 170 100 450M570 0Q420 140 520 450" fill="none" stroke="#536f53" stroke-width="14" opacity=".25"/><g transform="translate(70 85) scale(2.1)">'+bird(color).replace(/<svg[^>]*>|<\/svg>/g,'')+'</g></svg>');
  },
  allAssets(){
    return S.records.filter(r=>r.owner==='me'&&r.media?.kind==='photo').map((r,i)=>({id:'record-'+r.id,src:r.media.url||J.sample(r.media.color,i),width:r.media.width||600,height:r.media.height||450,label:sp(r.species),notes:L(r.notes),time:r.time||'',source:'record',recordId:r.id,unresolved:r.species==='unresolved',illustration:!r.media.url})).concat(J.s.assets);
  },
  chosen(){const all=J.allAssets();return J.s.selected.map(id=>all.find(a=>a.id===id)).filter(Boolean);},
  visibleAssets(){
    return J.allAssets().filter(a=>{
      if(J.s.source==='album'&&a.source!=='album')return false;
      if(J.s.source==='observations'&&a.source!=='record')return false;
      if(J.s.source==='collection'&&!(a.recordId&&S.collect.has(a.recordId)))return false;
      if(J.s.source==='sample'&&a.source!=='sample')return false;
      const day=a.time.slice(0,10);
      return day?(!J.s.from||day>=J.s.from)&&(!J.s.to||day<=J.s.to):J.s.unknown;
    });
  },
  start(sample=false){
    Object.assign(J.s,{selected:[],mode:'new',source:sample?'sample':'observations',from:'',to:'',unknown:true,includeNotes:false,title:'',period:'custom'});
    if(sample)J.addSamples();push('journalPicker');
  },
  addSamples(){
    if(!J.s.assets.some(a=>a.source==='sample'))['#856b4b','#55828a','#627452','#9d795a'].forEach((color,i)=>J.s.assets.push({id:'sample-'+i,src:J.sample(color,i),width:600,height:450,source:'sample',illustration:true,label:[T('湖边停留','By the lake'),T('枝头一瞥','In the branches'),T('待鉴定','Unresolved'),T('林间相遇','Woodland encounter')][i],unresolved:i===2,time:'2026-10-21T'+['07:45','08:10','08:35','09:00'][i],notes:T('示例插画，不是真实观测。','Sample artwork, not a real observation.')}));
    J.s.source='sample';J.s.selected=J.s.assets.filter(a=>a.source==='sample').map(a=>a.id);
  },
  home(){
    const cards=J.s.drafts.map(d=>'<article class="journal-card"><button class="journal-cover" data-action="j-open" data-id="'+esc(d.id)+'" aria-label="'+esc(d.title)+'">'+J.svg(d,false)+'</button><div class="journal-card-body"><strong>'+esc(d.title)+'</strong><p class="tiny">'+esc(J.labelRatio(d.ratio))+' · '+T('本机草稿','Local draft')+'</p><button class="text-button" data-action="j-open" data-id="'+esc(d.id)+'">'+T('继续编辑','Continue editing')+' →</button></div></article>').join('');
    return '<div class="pad journal-home"><div class="eyebrow">FIELD NOTES / '+T('出行手帐','OUTING JOURNAL')+'</div><h1 class="page-title">'+T('把发现，拼成回忆','Make room for memories')+'</h1><p class="sub">'+T('照片与文字之间，留一点自然的呼吸。','Space for photographs, words and the outdoors.')+'</p><section class="journal-hero"><div class="journal-mini"><img src="'+esc(J.sample('#55828a',1))+'" alt=""><span>FIELD NOTES<br>沿着鸟鸣</span></div><div><span class="pill">'+T('为你整理 · 示例','For you · sample')+'</span><h2>'+T('湖畔的一页','A page by the lake')+'</h2><p>'+T('4 张示例插画，试试你的第一份手帐。','Try your first journal with four sample illustrations.')+'</p>'+btn(T('打开示例素材','Try sample material'),'j-sample','secondary small')+'</div></section>'+btn('＋ '+T('新建手帐','Create a journal'),'j-new','wide')+(J.s.current?btn(T('继续本次会话的编辑','Resume this session’s work'),'j-resume','secondary wide'):'')+'<div class="row between section-title"><h2>'+T('我的手帐','My journals')+'</h2><span class="tiny">'+J.s.drafts.length+' '+T('份','saved')+'</span></div>'+(cards?'<div class="journal-grid">'+cards+'</div>':empty(T('还没有手帐。从相册、观察或自己的收藏开始。','Start with your photo library, observations or your own collection.')))+note(T('初稿目前由本地组合排版，未接入 AI。手帐可显式保存在当前浏览器；观察和社交仍是会话演示。','Drafts use local compositions, without AI. Journals can be saved in this browser; observations and social actions remain session demos.'))+(J.s.error?note(T('浏览器存储不可用或已满。当前内容仍可编辑、导出；请先备份。','Browser storage is unavailable or full. You can still edit and export; back up your work first.'),'warm'):'')+(cards?btn(T('清除本机手帐草稿…','Clear local journal drafts…'),'j-clear-review','quiet wide'):'')+'</div>';
  },
  picker(){
    const tabs=[['album',T('手机相册','Photo library')],['observations',T('我的观察','Observations')],['collection',T('我的收藏','Collection')],['sample',T('示例素材','Samples')]],assets=J.visibleAssets();
    return '<div class="pad journal-page"><h1 class="page-title">'+T('挑选这次的片段','Choose your moments')+'</h1><p class="sub">'+T('先选素材，再决定怎样讲述。此演示每页可选 1–6 张。','Choose material, then tell its story. This demo supports 1–6 images per page.')+'</p><div class="tabs journal-source">'+tabs.map(([id,label])=>'<button data-action="j-source" data-id="'+id+'" class="'+(J.s.source===id?'on':'')+'">'+label+'</button>').join('')+'</div>'+(J.s.source==='album'?btn(T('＋ 从设备选择照片','＋ Choose device photos'),'j-import','secondary wide'):'')+'<div class="journal-date-fields">'+field(T('开始日期','From date'),'jFrom',J.s.from,'date')+field(T('结束日期','To date'),'jTo',J.s.to,'date')+'</div><label class="check"><input type="checkbox" name="jUnknown" '+(J.s.unknown?'checked':'')+'>'+T('也显示日期未知的素材','Also show material with unknown dates')+'</label>'+(J.s.from&&J.s.to&&J.s.from>J.s.to?note(T('开始日期不能晚于结束日期。','The start date must not follow the end date.'),'warm'):'')+'<div class="journal-assets">'+assets.map(a=>'<button data-action="j-select-asset" data-id="'+esc(a.id)+'" class="journal-asset '+(J.s.selected.includes(a.id)?'selected':'')+'" aria-pressed="'+J.s.selected.includes(a.id)+'"><img src="'+esc(a.src)+'" alt="'+esc(a.label)+'"><span class="journal-tick">'+(J.s.selected.includes(a.id)?'✓':'＋')+'</span><strong>'+esc(a.label)+'</strong><small>'+esc(a.time.slice(0,10)||T('日期未知','Date unknown'))+(a.illustration?' · '+T('插画','Artwork'):'')+'</small></button>').join('')+'</div>'+(!assets.length?empty(T('暂无符合条件的照片。可导入相册照片，或切换示例素材。','No matching images. Import photos or try sample material.')):'')+'<div class="journal-selection"><strong>'+T('已选 ','Selected ')+J.s.selected.length+'/6</strong><button class="text-button" data-action="j-clear-selection">'+T('清空选择','Clear selection')+'</button></div>'+(J.chosen().length?'<div class="journal-picked">'+J.chosen().map((a,i)=>'<div><span>'+esc((i+1)+'. '+a.label)+'</span><button data-action="j-earlier" data-id="'+esc(a.id)+'" aria-label="'+esc(T('前移 ','Move earlier: ')+a.label)+'">↑</button><button data-action="j-later" data-id="'+esc(a.id)+'" aria-label="'+esc(T('后移 ','Move later: ')+a.label)+'">↓</button></div>').join('')+'</div>':'')+btn(J.s.mode==='new'?T('下一步：风格与比例','Next: style and format'):J.s.mode==='replace'?T('用第一张替换照片','Replace with first selected image'):T('添加到手帐','Add to journal'),'j-picker-next','wide',!J.s.selected.length||(J.s.from&&J.s.to&&J.s.from>J.s.to)?'disabled':'')+'<p class="tiny">'+T('筛选不替素材补写日期。仅列出自己的收藏照片；声音和他人书签不直接作为图片素材。','Filtering does not invent dates. Only your own collected photos appear; audio and others’ bookmarks are not used as images.')+'</p></div>';
  },
  setup(){
    return '<div class="pad journal-page"><span class="pill">'+T('模板演示 · 未接入 AI','Template demo · AI not connected')+'</span><h1 class="page-title">'+T('这一页，什么模样？','Give this page a feeling')+'</h1><div class="journal-film">'+J.chosen().map(a=>'<img src="'+esc(a.src)+'" alt="'+esc(a.label)+'">').join('')+'</div>'+field(T('手帐标题','Journal title'),'jTitle',J.s.title||T('沿着鸟鸣，慢慢走','Following the birdsong'))+'<div class="field"><label>'+T('起始风格','Starting style')+'</label><div class="journal-choice">'+J.styles().map(([id,label])=>'<button data-action="j-style" data-id="'+id+'" class="'+(J.s.style===id?'on':'')+'">'+label+'</button>').join('')+'</div></div><div class="field"><label>'+T('画布比例','Canvas format')+'</label><div class="journal-choice">'+Object.keys(J.sizes).map(r=>'<button data-action="j-ratio" data-id="'+r+'" class="'+(J.s.ratio===r?'on':'')+'">'+J.labelRatio(r)+'</button>').join('')+'</div></div>'+select(T('整理类型（仅标记草稿）','Summary type (draft label only)'),'jPeriod',[['custom',T('自选素材','Selected material')],['day',T('每日','Daily')],['week',T('每周','Weekly')],['month',T('每月','Monthly')],['year',T('每年','Yearly')]],J.s.period)+'<label class="check"><input type="checkbox" name="jNotes" '+(J.s.includeNotes?'checked':'')+'>'+T('将所选观察的备注加入初稿','Include selected observation notes')+'</label>'+note(T('这三种是起始风格，同一风格也可更换构图。后续可接入更丰富的自动排版与裁剪。AI 写作服务待团队选定；不会推测经历或鸟种。','These are starting styles with alternative arrangements. Richer layout and cropping can be connected later. The team’s AI writing service is not connected; experiences and species are not invented.'))+btn(T('生成可编辑初稿','Create editable draft'),'j-generate','wide')+'</div>';
  },
  make(assets,ratio,style,previous=null){
    const [w,h]=J.sizes[ratio],scale=w/900,title=previous?.title||J.s.title||T('沿着鸟鸣，慢慢走','Following the birdsong');
    const variant=(previous?.layoutVariant??Math.floor(Math.random()*10000))+1;
    const text=(id,value,x,y,width,size,extra={})=>({id,type:'text',contentTitle:'',text:value,x,y,w:width,h:size*2,fontSize:size,color:'#285c49',font:'serif',align:'left',rotation:0,...extra});
    const elements=[text('kicker','FIELD NOTES / '+T('羽迹','BIRD ASSISTANT'),w*.08,h*.055,w*.84,19*scale,{font:'sans',color:'#70816b'}),text('title',T('把每一次发现，留在纸上。','A little space for each encounter.'),w*.08,h*.105,w*.84,23*scale,{contentTitle:title,titleSize:46*scale})];
    const n=assets.length,top=h*.24,bottom=h*.92,rows=Math.ceil(n/2),gap=h*.035,rh=(bottom-top-gap*(rows-1))/rows;
    assets.forEach((a,i)=>{
      let x=w*(i%2?.53:.08),y=top+Math.floor(i/2)*(rh+gap),pw=w*.38;if(n===1){x=w*.12;pw=w*.76;}
      let ph=Math.max(80,rh-60*scale);
      if(n===4&&style!=='minimal'){
        const layout=[[.08,.25,.48,.29],[.65,.31,.27,.18],[.12,.65,.32,.20],[.53,.60,.38,.27]][i];
        x=w*layout[0];y=h*layout[1];pw=w*layout[2];ph=h*layout[3];
      }
      if(variant%2&&n>1)x=w-x-pw;
      const instance=a.instanceId||a.id+'-'+i,old=previous?.elements.find(e=>e.id==='caption-'+instance);
      if(n===4&&variant%3===0){y+=h*(i%2?-.025:.015);ph*=.94;}
      elements.push({id:a.elementId||'photo-'+instance,type:'photo',photoNumber:a.photoNumber||i+1,src:a.src,iw:a.width,ih:a.height,asset:J.copy(a),x,y,w:pw,h:ph,rotation:style==='nature'?((i+variant)%2?3:-3):0,crop:J.copy(a.savedCrop||{zoom:1,x:.5,y:.5})});
      elements.push(text('caption-'+instance,old?.text||a.label+(J.s.includeNotes&&a.notes?'\n'+a.notes:''),x,y+ph+17*scale,pw,24*scale,{font:'hand',color:'#4d6254',contentTitle:old?.contentTitle||'',photoId:a.elementId||'photo-'+instance}));
    });
    if(style==='magazine'){elements[0].text='THE OUTDOOR EDIT / '+T('本期发现','FIELD EDITION');elements[1].font='sans';elements.push({id:J.id(),type:'tape',x:w*.66,y:h*.225,w:w*.2,h:35*scale,rotation:6,color:'#b7be90'});}
    if(style==='nature')elements.push({id:J.id(),type:'leaf',x:w*.80,y:h*.045,w:w*.09,h:w*.09,rotation:12,color:'#839771'});
    if(previous){
      const sx=w/previous.width,sy=h/previous.height;
      for(const old of previous.elements.filter(e=>e.type==='text')){
        const item=elements.find(e=>e.id===old.id);
        if(item){Object.assign(item,{text:old.text,contentTitle:old.contentTitle||'',font:old.font,color:old.color,align:old.align,fontSize:old.fontSize*sx,titleSize:old.titleSize?old.titleSize*sx:undefined});}
        else elements.push({...J.copy(old),x:old.x*sx,y:old.y*sy,w:old.w*sx,fontSize:old.fontSize*sx,titleSize:old.titleSize?old.titleSize*sx:undefined});
      }
    }
    return J.migrate({schemaVersion:2,layoutVariant:variant,layoutEngine:'local-composition-v1',nextPhotoNumber:Math.max(0,...elements.filter(e=>e.type==='photo').map(e=>e.photoNumber))+1,id:previous?.id||J.id(),title,ratio,style,width:w,height:h,background:{color:style==='minimal'?'#ffffff':style==='magazine'?'#eee8da':'#f5efdf',texture:style==='nature',image:''},elements,sources:assets.map(J.copy),origin:previous?.origin||'manual',period:J.s.period,createdAt:previous?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()});
  },
  // A history entry is a complete document at the start of a user action.
  snapshot(){return {document:J.copy(J.s.current),selected:J.s.selectedElement};},
  same(a,b){return JSON.stringify(a)===JSON.stringify(b);},
  invalidate(){J.s.modified=true;J.s.exportUrl='';if(J.s.downloadUrl&&typeof URL!=='undefined')URL.revokeObjectURL(J.s.downloadUrl);J.s.downloadUrl='';},
  beginEdit(key){if(J.s.transaction?.key===key)return;J.commitEdit();J.s.transaction={key,before:J.snapshot()};},
  record(before){if(!before.document||J.same(before.document,J.s.current))return false;J.s.past.push(before);if(J.s.past.length>50)J.s.past.shift();J.s.future=[];J.invalidate();return true;},
  commitEdit(){const t=J.s.transaction;J.s.transaction=null;return t?J.record(t.before):false;},
  cancelEdit(){const t=J.s.transaction;J.s.transaction=null;if(t)J.restore(t.before);},
  restore(snap){J.s.current=J.copy(snap.document);J.s.selectedElement=J.s.current.elements.some(e=>e.id===snap.selected)?snap.selected:'';J.invalidate();},
  migrate(d){
    d.schemaVersion=2;let number=0;
    for(const e of d.elements){if(e.type==='photo'){e.photoNumber=e.photoNumber||number+1;number=Math.max(number,e.photoNumber);}if(e.type==='text'){e.contentTitle=e.contentTitle||'';J.fitText(e,d);}}
    d.nextPhotoNumber=Math.max(d.nextPhotoNumber||1,number+1);return d;
  },
  open(d,saved=false){J.cancelVoice?.(true);Object.assign(J.s,{current:J.migrate(J.copy(d)),past:[],future:[],transaction:null,selectedElement:'',modified:!saved,exportUrl:'',tool:'',viewMode:'focus'});Object.assign(J.s.ai,{open:false,inputMode:'text',voice:null,target:'new',photoId:'',photos:[],prompt:'',result:null,error:'',busy:false,prepared:false,requestId:(J.s.ai.requestId||0)+1});push('journalEditor');},
  backEditor(){if(S.history.at(-1)?.name==='journalEditor')S.history.pop();replace('journalEditor');},
  selected(){return J.s.current?.elements.find(e=>e.id===J.s.selectedElement);},
  measure(text,size,font='serif',bold=false){
    if(!J.context&&typeof document.createElement==='function')J.context=document.createElement('canvas').getContext('2d');
    if(J.context){J.context.font=(bold?'600 ':'')+size+'px '+(J.fonts[font]||J.fonts.serif);return J.context.measureText(text).width;}
    return [...text].reduce((n,c)=>n+(/[\u2e80-\uffff]/.test(c)?size:size*.56),0);
  },
  wrap(text,width,size,font='serif',bold=false){
    const lines=[];for(const paragraph of String(text).split('\n')){let line='';for(const char of paragraph){if(line&&J.measure(line+char,size,font,bold)>width){lines.push(line.trimEnd());line='';}line+=char;}lines.push(line.trimEnd());}return lines;
  },
  textLayout(e,d){
    const titleSize=e.titleSize||e.fontSize*1.3,rows=[];let y=0;
    const add=(value,size,bold)=>{if(!value)return;for(const line of J.wrap(value,e.w,size,e.font,bold)){rows.push({text:line,size,bold,baseline:y+size,bottom:y+size*1.35});y+=size*1.35;}};
    add(e.contentTitle,titleSize,true);if(e.contentTitle&&e.text)y+=e.fontSize*.28;add(e.text,e.fontSize,false);
    if(!rows.length){y=e.fontSize*1.35;rows.push({text:'',size:e.fontSize,bold:false,baseline:e.fontSize,bottom:y});}
    const available=Math.max(1,d.height-e.y),visible=rows.filter(r=>r.bottom<=available+.01).map(r=>({...r})),overflow=visible.length<rows.length;
    if(overflow&&visible.length){let last=visible.at(-1),value=last.text;while(value&&J.measure(value+'…',last.size,e.font,last.bold)>e.w)value=[...value].slice(0,-1).join('');last.text=value+'…';}
    return {rows,visible,naturalHeight:y,height:Math.min(y,available),overflow};
  },
  fitText(e,d=J.s.current){if(e?.type==='text'&&d)e.h=J.textLayout(e,d).height;},
  positionLabel(e,d=J.s.current){const col=Math.min(2,Math.max(0,Math.floor((e.x+e.w/2)/d.width*3))),row=Math.min(2,Math.max(0,Math.floor((e.y+e.h/2)/d.height*3)));return [[T('左上','upper left'),T('上中','upper centre'),T('右上','upper right')],[T('左中','middle left'),T('正中','centre'),T('右中','middle right')],[T('左下','lower left'),T('下中','lower centre'),T('右下','lower right')]][row][col];},
  elementLabel(e,d=J.s.current){
    if(e.type==='photo')return T('照片 ','Photo ')+e.photoNumber+'（'+J.positionLabel(e,d)+'）';
    if(e.type==='text'){const value=e.contentTitle||e.text||T('空文本框','Empty text box'),chars=[...value.replace(/\s+/g,' ')];return chars.slice(0,24).join('')+(chars.length>24?'…':'');}
    return J.decorationName(e.type);
  },
  decorationName(type){return ({leaf:T('叶子','Leaf'),tape:T('纸胶带','Tape'),flower:T('小花','Flower'),star:T('星星','Star'),feather:T('羽毛','Feather'),stamp:T('邮戳','Postmark')})[type]||T('装饰','Decoration');},
  decoration(e){
    const paths={leaf:'M20 3C8 2 3 9 6 16c7 6 16-1 14-13ZM5 21 17 7',flower:'M12 10C3-2 0 13 10 13C-1 22 15 26 13 15C25 24 28 8 15 11C24 0 9-5 12 10ZM10 12a2 2 0 1 0 4 0a2 2 0 1 0-4 0',star:'m12 2 3 7 7 1-5 5 1 7-6-4-6 4 1-7-5-5 7-1Z',feather:'M4 21 19 4M6 17C-2 7 18-4 21 3c5 9-9 19-15 14ZM9 14h8M12 10l1-6',stamp:'M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0M5 8h14M5 16h14M8 12h8'};
    if(e.type==='tape')return '<path d="M'+(-e.w/2)+','+(-e.h/2)+'h'+e.w+'l-8,'+e.h+'h-'+(e.w-16)+'Z" fill="'+esc(e.color)+'" opacity=".7"/>';
    return '<svg x="'+(-e.w/2)+'" y="'+(-e.h/2)+'" width="'+e.w+'" height="'+e.h+'" viewBox="0 0 24 24"><path d="'+(paths[e.type]||paths.leaf)+'" fill="none" stroke="'+esc(e.color)+'" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  },
  svg(d,editing,cropMode=false){
    const bg=d.background;let overlay='';
    const body=d.elements.map(e=>{
      const selected=editing&&e.id===J.s.selectedElement,cx=e.x+e.w/2,cy=e.y+e.h/2;let inside='';
      if(e.type==='photo'){
        const c=cropMode&&selected?J.s.crop:e.crop,k=Math.max(e.w/e.iw,e.h/e.ih)*c.zoom,rw=e.iw*k,rh=e.ih*k;
        inside='<defs><clipPath id="clip-'+esc(e.id)+'"><rect x="'+(-e.w/2)+'" y="'+(-e.h/2)+'" width="'+e.w+'" height="'+e.h+'"/></clipPath></defs><rect x="'+(-e.w/2-8)+'" y="'+(-e.h/2-8)+'" width="'+(e.w+16)+'" height="'+(e.h+16)+'" fill="#fffdf5"/><image href="'+esc(e.src)+'" x="'+(-e.w/2-(rw-e.w)*c.x)+'" y="'+(-e.h/2-(rh-e.h)*c.y)+'" width="'+rw+'" height="'+rh+'" clip-path="url(#clip-'+esc(e.id)+')" preserveAspectRatio="none"/>';
      }else if(e.type==='text'){
        const layout=J.textLayout(e,d),anchor=e.align==='center'?'middle':e.align==='right'?'end':'start',x=e.align==='center'?0:e.align==='right'?e.w/2:-e.w/2;
        inside='<text font-family="'+esc(J.fonts[e.font]||J.fonts.serif)+'" fill="'+esc(e.color)+'" text-anchor="'+anchor+'">'+layout.visible.map(line=>'<tspan x="'+x+'" y="'+(-e.h/2+line.baseline)+'" font-size="'+line.size+'" font-weight="'+(line.bold?'600':'400')+'">'+esc(line.text)+'</tspan>').join('')+'</text>';
      }else inside=J.decoration(e);
      const transform='transform="translate('+cx+' '+cy+') rotate('+e.rotation+')"';
      if(selected){const tx=e.w/2,ty=e.type==='text'?0:e.h/2;overlay='<g data-jelement="'+esc(e.id)+'" '+transform+'><rect class="journal-outline" x="'+(-e.w/2-2)+'" y="'+(-e.h/2-2)+'" width="'+(e.w+4)+'" height="'+(e.h+4)+'" fill="none" stroke="#285c49" stroke-width="1.5" vector-effect="non-scaling-stroke" stroke-dasharray="5 3"/><g data-jhandle="'+(e.type==='text'?'width':'resize')+'"><circle cx="'+tx+'" cy="'+ty+'" r="32" fill="transparent"/><circle cx="'+tx+'" cy="'+ty+'" r="13" fill="#285c49" stroke="white" stroke-width="3"/></g></g>';}
      return '<g '+(editing?'data-jelement="'+esc(e.id)+'" ':'')+transform+'>'+inside+'</g>';
    }).join('');
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+d.width+' '+d.height+'" width="'+d.width+'" height="'+d.height+'" class="journal-canvas" role="img" aria-label="'+esc(d.title)+'"><defs><pattern id="paper" width="12" height="12" patternUnits="userSpaceOnUse"><circle cx="3" cy="4" r=".8" fill="#9e967e" opacity=".16"/><path d="M8 7h2" stroke="#9e967e" opacity=".11"/></pattern></defs><rect width="100%" height="100%" fill="'+esc(bg.color)+'"/>'+(bg.image?'<image href="'+esc(bg.image)+'" width="'+d.width+'" height="'+d.height+'" preserveAspectRatio="xMidYMid slice" opacity=".35"/>':'')+(bg.texture?'<rect width="100%" height="100%" fill="url(#paper)"/>':'')+body+overlay+'</svg>';
  },
  range(label,name,value,min,max,step=1){return '<label class="journal-range"><span>'+label+' <output>'+Math.round(Number(value)*100)/100+'</output></span><input type="range" name="'+name+'" min="'+min+'" max="'+max+'" step="'+step+'" value="'+value+'"></label>';},
  historyIcon(redo=false){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"'+(redo?' style="transform:scaleX(-1)"':'')+'><path d="M4 10a8 8 0 1 1 1 9M4 4v6h6"/></svg>';},
  editor(){
    const d=J.s.current;if(!d)return '<div class="pad journal-page">'+empty(T('请先创建或打开一份手帐。','Create or open a journal first.'))+'</div>';
    const e=J.selected(),top='<div class="journal-toolbar"><button data-action="j-undo" aria-label="'+T('撤销','Undo')+'" '+(!J.s.past.length?'disabled':'')+'>'+J.historyIcon()+T('撤销','Undo')+'</button><button data-action="j-redo" aria-label="'+T('重做','Redo')+'" '+(!J.s.future.length?'disabled':'')+'>'+J.historyIcon(true)+T('重做','Redo')+'</button><span data-j-save-status>'+(J.s.modified?T('未保存','Unsaved'):T('本机已保存','Saved locally'))+'</span><button data-action="j-save">'+T('保存','Save')+'</button></div>';let tools='';
    if(e){
      tools+='<div class="journal-selection-heading"><strong>'+esc(J.elementLabel(e))+'</strong><button data-action="j-delete-element" class="journal-delete">'+T('删除','Delete')+'</button><button class="text-button" data-action="j-deselect">'+T('取消选择','Deselect')+'</button></div>';
      if(e.type==='text'){
        const overflow=J.textLayout(e,d).overflow;
        tools+='<div class="journal-text-fields">'+field(T('标题（可留空）','Title (optional)'),'jTextTitle',e.contentTitle)+textarea(T('正文','Body'),'jText',e.text)+'</div><p class="tiny" data-j-text-status>'+T('拖动文本框右侧圆点调整宽度；高度随换行自动调整。','Drag the right handle to change width. Height follows the wrapped text.')+(overflow?' '+T('超出画布的部分显示省略号，完整原文保留在正文中。','Overflow shows an ellipsis; the full text stays in Body.'):'')+'</p>'+btn('✧ '+T('AI 辅助这个文本框','AI help for this text box'),'j-ai-text','secondary small journal-ai-action')+'<div class="journal-inline">'+select(T('字体','Font'),'jFont',[['serif',T('衬线','Serif')],['sans',T('无衬线','Sans serif')],['hand',T('楷体 / 手写感','Calligraphic')]],e.font)+select(T('对齐','Alignment'),'jAlign',[['left',T('左','Left')],['center',T('中','Centre')],['right',T('右','Right')]],e.align)+'</div>'+J.range(T('正文字号','Body size'),'jFontSize',e.fontSize,14,90)+J.range(T('标题字号','Title size'),'jTitleSize',e.titleSize||e.fontSize*1.3,16,110);
      }
      if(e.type==='photo')tools+='<div class="journal-choice">'+btn(T('调整裁剪','Adjust crop'),'j-crop','secondary small')+btn(T('替换照片','Replace image'),'j-replace','secondary small')+'</div>'+btn('✧ '+T('为此照片写文字','Write about this photo'),'j-ai-photo','secondary small journal-ai-action')+select(T('照片框比例','Frame ratio'),'jFrame',[['current',T('当前比例','Current')],['1:1','1:1'],['3:4','3:4'],['4:3','4:3']],'current')+btn(T('将此照片设为背景','Use as background'),'j-photo-background','quiet small');
      if(!['photo','text'].includes(e.type))tools+=J.decorationPalette(e.type,true);
      if(e.type!=='photo')tools+='<label class="journal-color">'+T('颜色','Colour')+'<input type="color" name="jColor" value="'+esc(e.color)+'"></label>';
      tools+=J.range(T('水平位置','Horizontal position'),'jX',e.x,0,Math.max(0,d.width-e.w))+J.range(T('垂直位置','Vertical position'),'jY',e.y,0,d.height-(e.type==='text'?e.fontSize*1.35:e.h))+J.range(e.type==='text'?T('文本框宽度','Text box width'):T('大小','Size'),'jWidth',e.w,60,d.width-e.x)+J.range(T('旋转','Rotation'),'jRotation',e.rotation,-180,180)+'<div class="journal-choice">'+btn(T('向上一层','Forward'),'j-forward','quiet small')+btn(T('向下一层','Backward'),'j-backward','quiet small')+'</div>';
    }else if(J.s.tool==='background')tools='<strong>'+T('背景','Background')+'</strong><label class="journal-color">'+T('背景颜色','Background colour')+'<input type="color" name="jBackground" value="'+esc(d.background.color)+'"></label><label class="check"><input type="checkbox" name="jTexture" '+(d.background.texture?'checked':'')+'>'+T('纸张纹理','Paper texture')+'</label>'+(d.background.image?btn(T('移除背景图片','Remove background image'),'j-remove-background','quiet small'):'<p class="tiny">'+T('选择照片后，可将它设为背景图片。','Select a photo to use it as the background image.')+'</p>');
    else if(J.s.tool==='decoration')tools=J.decorationPalette();
    else tools='<p class="tiny">'+T('点选元素，拖动调整位置。文字右侧圆点调整宽度；照片与装饰右下角圆点调整大小。','Select and drag an element. Text uses a right-edge width handle; photos and decorations use a lower-right size handle.')+'</p>';
    return '<div class="journal-editor">'+top+'<div class="journal-preview-dock"><div class="journal-stage-viewport" data-jstage>'+J.svg(d,true)+'</div><div class="journal-viewbar"><span data-j-focus-label>'+esc(e?J.elementLabel(e):T('整页预览','Page overview'))+'</span><button data-action="j-overview" aria-pressed="'+(J.s.viewMode==='overview')+'">'+T('查看整页','Whole page')+'</button>'+(e?'<button data-action="j-focus">'+T('聚焦选中','Focus selected')+'</button>':'')+'</div></div><div class="journal-addbar">'+[['j-add-photo',T('＋ 照片','＋ Photo')],['j-add-text',T('＋ 文字','＋ Text')],['j-decorations',T('＋ 装饰','＋ Decor')],['j-ai-new','✧ '+T('AI 写作','AI writing')],['j-background',T('背景','Background')],['j-layout',T('排版','Layout')]].map(([a,t])=>'<button class="'+(a.startsWith('j-ai-')?'journal-ai-action':'')+'" data-action="'+a+'">'+t+'</button>').join('')+'</div><div class="journal-properties">'+select(T('选中元素','Selected element'),'jElement',[['',T('不选中元素','No element selected')],...d.elements.map(x=>[x.id,esc(J.elementLabel(x,d))])],J.s.selectedElement)+tools+(J.s.ai.open?J.aiPanel():'')+'</div><div class="journal-editor-footer">'+btn(T('预览与导出','Preview and export'),'j-preview','wide')+'<p class="tiny">'+T('本机草稿 · 当前排版为本地组合 · AI 服务尚未接入','Local draft · local composition · AI service not connected')+'</p></div></div>';
  },
  decorationPalette(selected='',replace=false){return '<div class="journal-decorations"><strong>'+T('装饰素材','Decorations')+'</strong><p class="tiny">'+T('自然、标记与纸品；以后可继续扩充。','Nature, accents and paper; more can be added later.')+'</p><div class="journal-decoration-grid">'+['leaf','flower','feather','star','tape','stamp'].map(type=>'<button data-action="'+(replace?'j-decoration-type':'j-add-decoration')+'" data-id="'+type+'" aria-pressed="'+(selected===type)+'"><svg viewBox="-50 -50 100 100" aria-hidden="true">'+J.decoration({type,w:65,h:type==='tape'?25:65,color:'#718464'})+'</svg><span>'+J.decorationName(type)+'</span></button>').join('')+'</div></div>';},
  cropPage(){
    const e=J.selected();if(!e||!J.s.crop)return J.editor();
    return '<div class="pad journal-page"><h1 class="page-title">'+T('让画面刚好合适','Find the right crop')+'</h1><p class="sub">'+T('只调整框内显示，原图仍保留。取消不会改动原裁剪。','Adjust the frame contents. The original stays intact; cancel preserves the previous crop.')+'</p><div class="journal-canvas-wrap journal-crop-preview">'+J.svg(J.s.current,true,true)+'</div>'+J.range(T('放大','Zoom'),'jCropZoom',J.s.crop.zoom,1,3,.05)+J.range(T('左右取景','Horizontal crop'),'jCropX',J.s.crop.x,0,1,.01)+J.range(T('上下取景','Vertical crop'),'jCropY',J.s.crop.y,0,1,.01)+btn(T('确认裁剪','Apply crop'),'j-crop-confirm','wide')+btn(T('取消','Cancel'),'j-crop-cancel','quiet wide')+'</div>';
  },
  layoutPage(){
    return '<div class="pad journal-page"><h1 class="page-title">'+T('试试另一种排版','Try another arrangement')+'</h1><p class="sub">'+T('先预览，再决定是否替换。应用后仍可撤销；原照片与全部文字内容保留。自定义装饰、位置与背景将由模板重新安排。','Preview before replacing. Applying can be undone; original photos and all text remain. Custom decorations, positions and background are rebuilt by the template.')+'</p>'+select(T('风格','Style'),'jLayoutStyle',J.styles(),J.s.style)+select(T('比例','Format'),'jLayoutRatio',Object.keys(J.sizes).map(r=>[r,J.labelRatio(r)]),J.s.ratio)+btn(T('换一种构图并预览','Try another composition'),'j-layout-preview','secondary wide')+(J.s.pending?'<div class="journal-canvas-wrap">'+J.svg(J.s.pending,false)+'</div>'+btn(T('应用此排版','Apply arrangement'),'j-layout-apply','wide'):'')+btn(T('保留当前排版','Keep current arrangement'),'j-layout-cancel','quiet wide')+'</div>';
  },
  preview(){
    const d=J.s.current;
    return '<div class="pad journal-page"><span class="pill">'+T('导出前检查','Review before export')+'</span><h1 class="page-title">'+esc(d.title)+'</h1><div class="journal-canvas-wrap">'+(J.s.exportUrl?'<img class="journal-rendered" src="'+esc(J.s.exportUrl)+'" alt="'+esc(T('已生成的 PNG 手帐','Rendered PNG journal'))+'">':J.svg(d,false))+'</div><p class="tiny">'+d.width+' × '+d.height+' PNG · '+T('图片包含画布上所有可见文字与素材。','Includes all visible text and material on the canvas.')+'</p>'+(J.s.exportUrl?'<a class="button wide journal-download" href="'+esc(J.s.downloadUrl||J.s.exportUrl)+'" download="bird-assistant-journal.png">'+T('下载 PNG 图片','Download PNG image')+'</a>':btn(J.s.busy?T('正在生成图片…','Rendering image…'):T('生成 PNG 图片','Render PNG image'),'j-download','wide',J.s.busy?'disabled':''))+btn(T('用成品图写帖子（演示）','Compose a post with this image (demo)'),'j-forum','secondary wide',J.s.busy?'disabled':'')+btn(T('系统分享（浏览器支持时）','System share (where supported)'),'j-share','secondary wide',J.s.busy?'disabled':'')+btn(T('返回编辑','Back to editing'),'j-return-editor','quiet wide')+note(T('这里会真实生成图片文件；论坛发布只在本次演示内生效。微信好友、朋友圈与相册权限仍待真机接入。分享前检查照片及文字中包含的私人信息。','Image export creates a real file. Forum publication affects only this demo. WeChat sharing and album permissions need native integration. Review private details visible in photos or text before sharing.'))+'</div>';
  },
  save(){
    J.commitEdit();const d=J.copy(J.s.current);d.updatedAt=new Date().toISOString();const next=J.s.drafts.filter(x=>x.id!==d.id);next.unshift(d);
    try{localStorage.setItem(J.key,JSON.stringify(next));J.s.drafts=next;J.s.modified=false;J.s.error='';toast(T('已保存到当前浏览器，未上传云端','Saved in this browser, without a cloud upload'));render();return true;}
    catch{J.s.error='storage';toast(T('本机保存失败；当前手帐仍保留，请先导出图片','Local save failed. Your journal remains; export it first'));return false;}
  },
  async raster(){
    if(J.s.exportUrl)return J.s.exportUrl;const d=J.s.current,img=new Image();img.src=J.dataSvg(J.svg(d,false));await img.decode();
    const c=document.createElement('canvas');c.width=d.width;c.height=d.height;c.getContext('2d').drawImage(img,0,0);const blob=await new Promise(resolve=>c.toBlob(resolve,'image/png'));if(!blob)throw new Error('PNG rendering failed');if(J.s.downloadUrl)URL.revokeObjectURL(J.s.downloadUrl);J.s.downloadUrl=URL.createObjectURL(blob);J.s.exportUrl=c.toDataURL('image/png');return J.s.exportUrl;
  },
  async export(action){
    if(J.s.busy)return;J.s.busy=true;renderApp();
    try{const url=await J.raster();
      if(action==='j-download'){toast(T('PNG 已准备好，请点击下载图片','PNG is ready. Click the download link to save it'));}
      else if(action==='j-forum'){
        if(S.forms.compose&&S.dirty.has('compose'))toast(T('已有未完成的帖子草稿，请先处理后再附加手帐','Resolve your existing post draft before attaching this journal'));
        else{startPost();S.forms.compose.journalImage=url;S.forms.compose.title=J.s.current.title;S.dirty.add('compose');render();}
      }else{const blob=await(await fetch(url)).blob(),file=new File([blob],'bird-assistant-journal.png',{type:'image/png'});if(navigator.canShare?.({files:[file]}))await navigator.share({files:[file],title:J.s.current.title});else toast(T('当前浏览器不支持图片分享，请先保存 PNG 后分享','Image sharing is unavailable here. Save the PNG and share it from your device'));}
    }catch(error){if(error.name!=='AbortError')toast(T('图片生成或分享失败；编辑内容仍保留，可重试','Image creation or sharing failed. Your work remains; try again'));}
    finally{J.s.busy=false;renderApp();}
  },
  update(input){
    const name=input.name;if(!name?.startsWith('j'))return false;
    const s=J.s,e=J.selected(),value=input.type==='checkbox'?input.checked:input.value,settings={jFrom:'from',jTo:'to',jUnknown:'unknown',jTitle:'title',jPeriod:'period',jNotes:'includeNotes',jLayoutStyle:'style',jLayoutRatio:'ratio'};
    if(name==='jElement'){J.commitEdit();s.selectedElement=value;s.tool='';s.viewMode='focus';return true;}
    if(settings[name]){s[settings[name]]=value;if(name.startsWith('jLayout'))s.pending=null;return true;}
    if(name.startsWith('jAi')){const ai=s.ai;if(name==='jAiPrompt')ai.prompt=value;if(name==='jAiPurpose')ai.purpose=value;if(name==='jAiPlacement')ai.placement=value;if(name==='jAiPhoto')ai.photos=value?[...new Set([...ai.photos,input.dataset.id])]:ai.photos.filter(x=>x!==input.dataset.id);ai.prepared=false;ai.result=null;ai.error='';return true;}
    if(name.startsWith('jCrop')){s.crop[({jCropZoom:'zoom',jCropX:'x',jCropY:'y'})[name]]=Number(value);return true;}
    if(!s.current)return true;J.beginEdit('field:'+name);
    if(name==='jBackground')s.current.background.color=value;
    else if(name==='jTexture')s.current.background.texture=value;
    else if(e){const props={jText:'text',jTextTitle:'contentTitle',jFont:'font',jAlign:'align',jFontSize:'fontSize',jTitleSize:'titleSize',jColor:'color',jX:'x',jY:'y',jRotation:'rotation'};
      if(props[name])e[props[name]]=['jFontSize','jTitleSize','jX','jY','jRotation'].includes(name)?Number(value):value;
      else if(name==='jWidth'){const k=Number(value)/e.w;e.w=Number(value);if(e.type!=='text')e.h*=k;}
      else if(name==='jFrame'&&value!=='current'){const [w,h]=value.split(':').map(Number);e.h=e.w*h/w;}
      J.fitText(e);if(e.id==='title')s.current.title=e.contentTitle||e.text;
    }
    if(s.transaction&&!J.same(s.transaction.before.document,s.current))J.invalidate();return true;
  },
  refreshStage(){
    const n=document.querySelector('[data-jstage]');if(n){const style=n.querySelector('svg')?.getAttribute('style');n.innerHTML=J.svg(J.s.current,true);if(style)n.querySelector('svg').setAttribute('style',style);J.positionStage?.();}
    const c=document.querySelector('.journal-crop-preview');if(c)c.innerHTML=J.svg(J.s.current,true,true);
    const pending=J.s.transaction&&!J.same(J.s.transaction.before.document,J.s.current),undo=document.querySelector('[data-action="j-undo"]'),redo=document.querySelector('[data-action="j-redo"]');if(undo)undo.disabled=!(J.s.past.length||pending);if(redo)redo.disabled=!J.s.future.length||!!pending;
    const label=document.querySelector('[data-j-save-status]');if(label)label.textContent=J.s.modified?T('未保存','Unsaved'):T('本机已保存','Saved locally');
    const e=J.selected(),select=document.querySelector('[name="jElement"]');
    if(e&&select){const option=[...select.options].find(o=>o.value===e.id);if(option)option.textContent=J.elementLabel(e);}
    const focus=document.querySelector('[data-j-focus-label]');if(focus)focus.textContent=e?J.elementLabel(e):T('整页预览','Page overview');
    const status=document.querySelector('[data-j-text-status]');if(e?.type==='text'&&status)status.textContent=T('宽度控制换行，高度随文字自动调整。','Width controls wrapping; height follows the text.')+(J.textLayout(e,J.s.current).overflow?' '+T('已用省略号标出溢出，完整原文保留。','Overflow ends in an ellipsis; full text is preserved.'):'');
  },
  click(action,id){
    J.commitEdit();const before=J.s.current?J.snapshot():{document:null};
    J.handleClick(action,id);
    if(!['j-undo','j-redo','j-open','j-generate'].includes(action)&&J.s.current?.id===before.document?.id&&J.record(before))renderApp();
  },
  handleClick(action,id){
    const s=J.s,d=s.current,e=J.selected();
    if(action==='j-new'||action==='j-sample'){if(s.current&&s.modified){toast(T('请先继续并保存当前手帐，再新建','Resume and save your current journal before creating another'));return;}J.start(action==='j-sample');return;}
    if(action==='j-resume'){push('journalEditor');return;}
    if(action==='j-source'){s.source=id;if(id==='sample'&&!s.assets.some(a=>a.source==='sample')){const old=s.selected.slice();J.addSamples();s.selected=old;}}
    if(action==='j-import'){document.querySelector('#journal-photo-input').click();return;}
    if(action==='j-select-asset'){if(s.selected.includes(id))s.selected=s.selected.filter(x=>x!==id);else if(s.selected.length<6)s.selected.push(id);else toast(T('此演示每页最多 6 张；可先取消一张','This demo allows six images per page; deselect one first'));}
    if(action==='j-earlier'||action==='j-later'){
      const i=s.selected.indexOf(id),next=Math.max(0,Math.min(s.selected.length-1,i+(action==='j-earlier'?-1:1)));
      s.selected.splice(i,1);s.selected.splice(next,0,id);
    }
    if(action==='j-clear-selection')s.selected=[];
    if(action==='j-picker-next'){
      if(!J.chosen().length||(s.from&&s.to&&s.from>s.to))return;
      if(s.mode==='new'){push('journalSetup');return;}
      if(s.mode==='replace'&&e){const a=J.chosen()[0];Object.assign(e,{src:a.src,iw:a.width,ih:a.height,asset:J.copy(a),crop:{zoom:1,x:.5,y:.5}});}
      else J.chosen().forEach((a,i)=>d.elements.push({id:'photo-'+J.id(),type:'photo',photoNumber:d.nextPhotoNumber++,src:a.src,iw:a.width,ih:a.height,asset:J.copy(a),x:100+i*20,y:250+i*20,w:300,h:240,crop:{zoom:1,x:.5,y:.5},rotation:0}));
      J.backEditor();return;
    }
    if(action==='j-style')s.style=id;if(action==='j-ratio')s.ratio=id;
    if(action==='j-generate'){if(J.chosen().length)J.open(J.make(J.chosen(),s.ratio,s.style));return;}
    if(action==='j-open'){if(s.current&&s.modified){toast(T('请先继续并保存当前手帐，再打开另一份','Resume and save your current journal before opening another'));return;}const item=s.drafts.find(x=>x.id===id);if(item)J.open(item,true);return;}
    if(action==='j-save'){J.save();return;}
    if(action==='j-deselect')s.selectedElement='';
    if(action==='j-undo'&&s.past.length){s.future.push(J.snapshot());J.restore(s.past.pop());}
    if(action==='j-redo'&&s.future.length){s.past.push(J.snapshot());J.restore(s.future.pop());}
    if(action==='j-delete-element'&&e){d.elements=d.elements.filter(x=>x.id!==e.id);s.selectedElement='';}
    if((action==='j-forward'||action==='j-backward')&&e){const i=d.elements.indexOf(e),ni=Math.max(0,Math.min(d.elements.length-1,i+(action==='j-forward'?1:-1)));d.elements.splice(i,1);d.elements.splice(ni,0,e);}
    if(action==='j-add-photo'||action==='j-replace'){s.mode=action==='j-replace'?'replace':'add';s.selected=[];s.source='album';push('journalPicker');return;}
    if(action==='j-add-text'||action==='j-add-leaf'){const item=action==='j-add-text'?{id:J.id(),type:'text',contentTitle:'',text:T('写下一点发现','A little field note'),x:100,y:200,w:350,h:90,fontSize:32,color:'#285c49',font:'hand',align:'left',rotation:0}:{id:J.id(),type:'leaf',x:150,y:180,w:100,h:100,color:'#839771',rotation:-12};J.fitText(item);d.elements.push(item);s.selectedElement=item.id;s.viewMode='focus';}
    if(action==='j-overview')s.viewMode='overview';
    if(action==='j-focus')s.viewMode='focus';
    if(action==='j-decorations'){s.selectedElement='';s.tool='decoration';s.ai.open=false;}
    if(action==='j-add-decoration'){
      const item={id:J.id(),type:id,x:d.width*.4,y:d.height*.3,w:100,h:id==='tape'?35:100,color:'#839771',rotation:0};d.elements.push(item);s.selectedElement=item.id;s.tool='';s.viewMode='focus';
    }
    if(action==='j-decoration-type'&&e){e.type=id;if(id==='tape')e.h=e.w*.35;else e.h=e.w;}
    if(action==='j-ai-new'||action==='j-ai-text'||action==='j-ai-photo'){
      J.cancelVoice?.(true);
      const photo=action==='j-ai-photo'?e:d.elements.find(x=>x.id===e?.photoId);
      Object.assign(s.ai,{open:true,busy:false,requestId:(s.ai.requestId||0)+1,target:action==='j-ai-text'?e.id:action==='j-ai-photo'?(d.elements.find(x=>x.type==='text'&&x.photoId===photo?.id)?.id||'new'):'new',photoId:photo?.id||'',photos:photo?[photo.id]:[],result:null,prepared:false,error:''});
    }
    if(action==='j-ai-close'){J.cancelVoice?.(true);s.ai.open=false;}
    if(action==='j-ai-prepare'){s.ai.prepared=true;s.ai.error='';}
    if(action==='j-ai-generate'){J.generateWriting();return;}
    if(action==='j-input-toggle'||action==='j-input-edit'){J.toggleInput(action==='j-input-edit');return;}
    if(action==='j-ai-apply'&&s.ai.result){
      let target=d.elements.find(x=>x.id===s.ai.target);
      if(!target){const photo=d.elements.find(x=>x.id===s.ai.photoId),region=J.writingRequest().target;target={id:J.id(),type:'text',contentTitle:'',text:'',x:region.x,y:region.y,w:region.width,h:80,fontSize:26,font:'serif',align:'left',color:'#285c49',rotation:0,photoId:photo?.id||''};d.elements.push(target);}
      target.contentTitle=s.ai.result.title;target.text=s.ai.result.body;J.fitText(target);if(target.id==='title')d.title=target.contentTitle||target.text;s.selectedElement=target.id;s.viewMode='focus';s.ai.open=false;
    }
    if(action==='j-background'){s.selectedElement='';s.tool='background';}
    if(action==='j-photo-background'&&e){d.background.image=e.src;s.selectedElement='';s.tool='background';}
    if(action==='j-remove-background'){d.background.image='';}
    if(action==='j-crop'&&e){s.crop=J.copy(e.crop);push('journalCrop');return;}
    if(action==='j-crop-confirm'&&e){e.crop=J.copy(s.crop);s.crop=null;J.backEditor();return;}
    if(action==='j-crop-cancel'){s.crop=null;J.backEditor();return;}
    if(action==='j-layout'){s.ratio=d.ratio;s.style=d.style;s.pending=null;push('journalLayout');return;}
    if(action==='j-layout-preview'){const assets=d.elements.filter(x=>x.type==='photo').map(x=>({...x.asset,instanceId:x.id.replace(/^photo-/,''),elementId:x.id,photoNumber:x.photoNumber,savedCrop:J.copy(x.crop)}));if(!assets.length){toast(T('请先添加照片后再使用模板重排','Add a photo before using a template arrangement'));return;}s.pending=J.make(assets,s.ratio,s.style,{...d,layoutVariant:(s.pending?.layoutVariant??d.layoutVariant??0)});}
    if(action==='j-layout-apply'&&s.pending){s.current=s.pending;s.pending=null;s.selectedElement='';J.backEditor();return;}
    if(action==='j-layout-cancel'||action==='j-return-editor'){J.backEditor();return;}
    if(action==='j-preview'){push('journalPreview');return;}
    if(['j-download','j-forum','j-share'].includes(action)){J.export(action);return;}
    if(action==='j-clear-review'){push('journalClear');return;}
    if(action==='j-clear-confirm'){try{localStorage.removeItem(J.key);s.drafts=[];s.error='';goTab('journal');}catch{toast(T('清除失败，请检查浏览器存储设置','Could not clear drafts; check browser storage settings'));}return;}
    renderApp();
  },
  async importFiles(files){
    let added=0;
    for(const file of files){
      if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>6*1024*1024){toast(T('请选择 6 MB 以内的 JPG、PNG 或 WebP；原选择保留','Use JPG, PNG or WebP up to 6 MB; existing selections remain'));continue;}
      try{const u=URL.createObjectURL(file),img=new Image();try{
        img.src=u;await img.decode();if(!img.naturalWidth||img.naturalWidth*img.naturalHeight>40000000)throw new Error('image size');
        const k=Math.min(1,1400/Math.max(img.naturalWidth,img.naturalHeight)),c=document.createElement('canvas');c.width=Math.round(img.naturalWidth*k);c.height=Math.round(img.naturalHeight*k);c.getContext('2d').drawImage(img,0,0,c.width,c.height);
        const a={id:J.id(),source:'album',src:c.toDataURL('image/jpeg',.85),width:c.width,height:c.height,time:'',label:file.name.replace(/\.[^.]+$/,'').slice(0,60),notes:'',illustration:false};
        J.s.assets.push(a);if(J.s.selected.length<6)J.s.selected.push(a.id);added++;
      }finally{URL.revokeObjectURL(u);}}catch{toast(T('有图片无法读取；已有素材保持不变','An image could not be read; existing material is unchanged'));}
    }J.s.source='album';renderApp();if(added)toast(T('照片已在本地导入，拍摄日期仍为未知','Photos imported locally; capture dates remain unknown'));
  },
  // The future backend adapter accepts a complete request and returns {title, body}.
  // No provider SDK, endpoint or secret is embedded in this browser prototype.
  writingAdapter:null,
  writingRequest(){
    const d=J.s.current,ai=J.s.ai,e=d.elements.find(x=>x.id===ai.target),photo=d.elements.find(x=>x.id===ai.photoId);
    const width=e?.w||photo?.w||d.width*.8,fontSize=e?.fontSize||26;
    const x=e?.x??photo?.x??d.width*.1;let y=e?.y;
    if(y===undefined){
      if(photo)y=Math.min(d.height-40,photo.y+photo.h+20);
      else{
        const photos=d.elements.filter(o=>o.type==='photo'),low=ai.placement==='above'?0:Math.max(0,...photos.map(o=>o.y+o.h)),high=ai.placement==='above'?Math.min(d.height,...photos.map(o=>o.y)):d.height;
        const occupied=d.elements.filter(o=>o.x<x+width&&o.x+o.w>x&&o.y+o.h>low&&o.y<high).sort((a,b)=>a.y-b.y);let cursor=low+12,best={y:cursor,h:0};
        for(const o of occupied){const gap=o.y-12-cursor;if(gap>best.h)best={y:cursor,h:gap};cursor=Math.max(cursor,o.y+o.h+12);}
        if(high-12-cursor>best.h)best={y:cursor,h:high-12-cursor};y=Math.min(d.height-1,best.y);
      }
    }
    const stops=d.elements.filter(o=>o.id!==e?.id&&o.id!==photo?.id&&o.x<x+width&&o.x+o.w>x&&o.y>=y).map(o=>o.y-12);
    const availableHeight=Math.max(0,Math.min(d.height,...stops)-y);
    return {schemaVersion:1,language:typeof lang==='undefined'?'zh':lang,intent:ai.purpose,instruction:ai.prompt.trim(),target:{elementId:e?.id||null,photoId:photo?.id||null,x,y,width,availableHeight,fontSize,titleSize:e?.titleSize||fontSize*1.3,lineHeight:1.35,suggestedCharacters:Math.max(0,Math.floor(width/fontSize)*Math.max(0,Math.floor(availableHeight/(fontSize*1.35))-2))},existingText:{title:e?.contentTitle||'',body:e?.text||''},images:d.elements.filter(x=>x.type==='photo'&&(ai.photos.includes(x.id)||x.id===ai.photoId)).map(x=>({elementId:x.id,photoNumber:x.photoNumber,src:x.src,label:x.asset.label,unresolved:!!x.asset.unresolved,illustration:!!x.asset.illustration,notes:x.asset.notes||'',crop:J.copy(x.crop)})),constraints:{preserveUncertainty:true,inventPersonalExperience:false,fitAvailableSpace:true}};
  },
  aiPanel(){
    const ai=J.s.ai,d=J.s.current,e=d.elements.find(x=>x.id===ai.target),req=J.writingRequest();
    return '<section class="journal-ai-panel" aria-label="'+T('AI 写作助手','AI writing assistant')+'"><div class="row between"><h3>✧ '+T('一起把这一页写下来','Words for this page')+'</h3><button data-action="j-ai-close" class="text-button">'+T('收起','Close')+'</button></div><span class="pill">'+T('待接入团队选定的 AI 服务','Awaiting the team’s AI service')+'</span><p class="tiny">'+esc(e?T('修改：','Revise: ')+J.elementLabel(e):ai.photoId?T('新建与所选照片关联的文字','New text linked to the selected photo'):T('新建独立的整页文字，可放在照片上方或下方','New standalone text; place it above or below photos'))+'</p>'+(!e&&!ai.photoId?select(T('整页文字位置','Overall text placement'),'jAiPlacement',[['below',T('照片下方','Below the photos')],['above',T('照片上方','Above the photos')]],ai.placement):'')+select(T('想写什么','Writing purpose'),'jAiPurpose',[['reflection',T('感想与经历','Reflections and experiences')],['bird-info',T('鸟类介绍','About the bird')],['social',T('分享文案','A social post')]],ai.purpose)+J.promptComposer()+'<div class="journal-choice">'+btn(T('整理写作要求','Review writing brief'),'j-ai-prepare','secondary small journal-ai-action')+'</div><fieldset class="journal-ai-images"><legend>'+T('与文字有关的照片','Photos relevant to this text')+'</legend>'+d.elements.filter(x=>x.type==='photo').map(x=>'<label><input type="checkbox" name="jAiPhoto" data-id="'+esc(x.id)+'" '+(ai.photos.includes(x.id)||x.id===ai.photoId?'checked':'')+(x.id===ai.photoId?' disabled':'')+'><img src="'+esc(x.src)+'" alt=""><span>'+esc(J.elementLabel(x))+'</span></label>').join('')+'</fieldset><p class="tiny">'+T('仅将勾选照片随要求发送。鸟种未确认时保留待鉴定；经历与天气以你提供的内容为准。','Only checked photos accompany the request. Unconfirmed species stay unresolved; experiences and weather come from you.')+'</p>'+(ai.prepared?'<div class="journal-writing-brief"><strong>'+T('写作要求已整理','Writing brief ready')+'</strong><p>'+esc(ai.prompt||T('请先补充你想写的内容。','Add your writing instructions first.'))+'</p><span>'+req.images.length+' '+T('张关联照片','linked photos')+' · '+T('建议不超过约 ','Aim for about ')+req.target.suggestedCharacters+' '+T('字，完成后按实际排版检查','characters; fit checked after layout')+'</span></div>':'')+(ai.error?'<p role="status" class="form-error">'+esc(ai.error)+'</p>':'')+btn(ai.busy?T('正在写作…','Writing…'):T('生成文字','Generate text'),'j-ai-generate','wide journal-ai-action journal-ai-primary',J.isVoiceBusy?.()||!J.writingAdapter||ai.busy||!ai.prompt.trim()?'disabled':'')+(!J.writingAdapter?'<p class="tiny">'+T('可先整理要求与关联照片；接入 AI 服务后生成文字，再预览并确认加入。这里不会用固定文案冒充 AI 输出。','Prepare instructions and linked photos now. Once connected, preview the generated text before applying it. No canned text is presented as AI output.')+'</p>':'')+(ai.result?'<div class="journal-writing-result"><h4>'+esc(ai.result.title)+'</h4><p>'+esc(ai.result.body)+'</p>'+(ai.result.fits===false?'<p class="form-error">'+T('文字超过当前留白。可缩短要求后重试，或加入后调整宽度与位置；原文会完整保留。','This text exceeds the available space. Request a shorter version, or adjust its width and position after applying. Full text will be preserved.')+'</p>':'')+btn(T('确认加入画布','Apply to canvas'),'j-ai-apply','wide journal-ai-action journal-ai-primary')+'</div>':'')+'</section>';
  },
  async generateWriting(){
    const ai=J.s.ai;if(J.isVoiceBusy?.()||!J.writingAdapter||ai.busy||!ai.prompt.trim())return;const documentId=J.s.current.id,requestId=ai.requestId=(ai.requestId||0)+1,request=J.writingRequest();if(request.target.availableHeight<request.target.fontSize*1.35){ai.error=T('这个区域的留白不足，请先移动文本框或调整宽度。','This area has too little space. Move the text box or adjust its width.');renderApp();return;}ai.busy=true;ai.error='';ai.result=null;renderApp();
    try{const result=await J.writingAdapter(J.copy(request));if(ai.requestId!==requestId||J.s.current.id!==documentId)return;if(!result||typeof result.title!=='string'||typeof result.body!=='string')throw Error('Invalid writing response');const box={type:'text',x:0,y:0,w:request.target.width,fontSize:request.target.fontSize,titleSize:request.target.titleSize,font:J.s.current.elements.find(e=>e.id===request.target.elementId)?.font||'serif',contentTitle:result.title,text:result.body};
      ai.result={title:result.title,body:result.body,fits:J.textLayout(box,{height:request.target.availableHeight}).naturalHeight<=request.target.availableHeight};}
    catch{if(ai.requestId!==requestId||J.s.current.id!==documentId)return;ai.error=T('写作暂未完成，请重试。要求与原文仍保留。','Writing did not finish. Retry; your instructions and original text remain.');}
    finally{if(ai.requestId===requestId&&J.s.current.id===documentId){ai.busy=false;renderApp();}}
  },
  bind(){
    J.bindComposer?.();J.unbind?.();J.unbind=null;
    const stage=document.querySelector('[data-jstage]');if(!stage){J.positionStage=null;return;}
    const app=document.querySelector('#app'),dock=stage.closest('.journal-preview-dock');let drag=null,frame=0;
    const position=()=>{
      frame=0;const svg=stage.querySelector('svg');if(!svg||!dock)return;
      const d=J.s.current,toolbar=document.querySelector('.journal-toolbar'),bar=dock.querySelector('.journal-viewbar'),height=app.clientHeight;
      const top=toolbar.offsetHeight,max=Math.max(170,Math.min(440,height*.63)),min=Math.max(140,Math.min(300,height*.42)),viewHeight=Math.max(min,max-Math.max(0,app.scrollTop));
      dock.style.top=top+'px';dock.style.height=(max+(bar?.offsetHeight||35))+'px';stage.style.height=viewHeight+'px';app.style.scrollPaddingTop=(top+viewHeight+(bar?.offsetHeight||35)+10)+'px';app.style.scrollPaddingBottom='20px';
      const width=stage.clientWidth-28,scale=J.s.viewMode==='overview'?Math.min(width/d.width,(viewHeight-20)/d.height):Math.min(width/d.width,(max-20)/d.height);
      const sw=d.width*scale,sh=d.height*scale,e=J.selected(),centre=e?(e.y+e.h/2)*scale:sh/2;
      const offset=sh<=viewHeight?(viewHeight-sh)/2:-Math.max(0,Math.min(sh-viewHeight,centre-viewHeight/2));
      svg.style.width=sw+'px';svg.style.height=sh+'px';svg.style.left=(stage.clientWidth-sw)/2+'px';svg.style.top=offset+'px';
      const label=bar?.querySelector('[data-j-focus-label]');if(label)label.textContent=e?J.elementLabel(e):T('整页预览','Page overview');
    };
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(position);};J.positionStage=()=>{if(!drag)position();};
    app.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);
    const observer=typeof ResizeObserver!=='undefined'?new ResizeObserver(schedule):null;observer?.observe(app);
    J.unbind=()=>{app.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);observer?.disconnect();if(frame)cancelAnimationFrame(frame);};position();
    stage.addEventListener('pointerdown',ev=>{
      if(ev.button!==0)return;J.commitEdit();const node=ev.target.closest('[data-jelement]');
      if(!node){J.s.selectedElement='';renderApp();return;}
      const svg=stage.querySelector('svg'),bounds=svg.getBoundingClientRect();J.s.selectedElement=node.dataset.jelement;J.s.viewMode='focus';
      const e=J.selected();drag={x:ev.clientX,y:ev.clientY,original:J.copy(e),k:J.s.current.width/bounds.width,handle:ev.target.closest('[data-jhandle]')?.dataset.jhandle,active:false};
      stage.setPointerCapture(ev.pointerId);J.refreshStage();ev.preventDefault();
    });
    stage.addEventListener('pointermove',ev=>{
      if(!drag)return;const dx=(ev.clientX-drag.x)*drag.k,dy=(ev.clientY-drag.y)*drag.k;
      if(!drag.active&&Math.hypot(dx,dy)<3*drag.k)return;
      if(!drag.active){J.beginEdit('gesture');drag.active=true;}
      const e=J.selected(),o=drag.original,d=J.s.current,angle=o.rotation*Math.PI/180,localX=dx*Math.cos(angle)+dy*Math.sin(angle);
      if(drag.handle==='width'){e.w=Math.max(60,Math.min(d.width-o.x,o.w+localX));J.fitText(e);}
      else if(drag.handle==='resize'){const k=Math.max(.2,Math.min((d.width-o.x)/o.w,(d.height-o.y)/o.h,1+(dx+dy)/(o.w+o.h)));e.w=o.w*k;e.h=o.h*k;}
      else{e.x=Math.max(0,Math.min(d.width-e.w,o.x+dx));e.y=Math.max(0,Math.min(d.height-(e.type==='text'?e.fontSize*1.35:e.h),o.y+dy));J.fitText(e);}
      J.invalidate();J.refreshStage();
    });
    stage.addEventListener('pointerup',()=>{if(!drag)return;drag=null;J.commitEdit();renderApp();});
    stage.addEventListener('pointercancel',()=>{if(!drag)return;drag=null;J.cancelEdit();renderApp();});
  }
};
document.addEventListener('click',event=>{const b=event.target.closest('[data-action]');if(b?.dataset.action.startsWith('j-')&&!b.disabled)J.click(b.dataset.action,b.dataset.id);});
document.addEventListener('input',event=>{const i=event.target;if(!i.name?.startsWith('j'))return;if(i.type==='range'||i.type==='color'||['jText','jTextTitle','jTitle','jAiPrompt'].includes(i.name)){J.update(i);J.refreshStage();if(i.name==='jAiPrompt')J.resizePrompt?.();const o=i.closest('.journal-range')?.querySelector('output');if(o)o.textContent=i.value;const generate=document.querySelector('[data-action="j-ai-generate"]');if(generate)generate.disabled=J.isVoiceBusy?.()||!J.writingAdapter||J.s.ai.busy||!J.s.ai.prompt.trim();}});
document.addEventListener('change',event=>{const i=event.target;if(i.id==='journal-photo-input'){J.importFiles([...i.files]);i.value='';return;}if(!i.name?.startsWith('j'))return;if(['jTitle','jText','jTextTitle','jAiPrompt'].includes(i.name)){J.commitEdit();return;}if(!['range','color'].includes(i.type))J.update(i);J.commitEdit();renderApp();});
document.addEventListener('focusout',event=>{if(event.target.name?.startsWith('j'))J.commitEdit();});
