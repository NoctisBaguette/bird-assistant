import {readSavedPlaces,savePlace,removeSavedPlace,SavedPlace} from '../../services/saved-places';
import {previewCacheInfo,clearPreviewCache,PreviewCacheInfo} from '../../services/preview-cache';
import {connectBusiness} from '../../services/vision-network';
import {writingReadiness} from '../../services/writing-network';
import {diagnosticText} from '../../services/diagnostics';
import {queueObservationReview} from '../../services/draft-navigation';
import {api,community,Draft,hub,openMap,sessionState,sessionRevision,setDraft} from '../../services/community';
import {loadPresentation,present} from '../../services/profile-showcase';
import {calendarCells,calendarMonth} from '../../services/calendar';
import {beijingDate} from '../../services/observation-context';
import { localRepository, Observation, isSampleObservation, observationStats } from '../../services/repository';
import { choosePhoto, errorText, persistImage } from '../../services/media';
import { selectTab, syncNavigation } from '../../services/tabs';
import { avatarCrop } from '../../services/crop';
import { round2, numberDraft, parseNumberDraft } from '../../services/numbers';
import { clamp } from '../../services/map-model';
import { getCanvas, loadCanvasImage, exportCanvas } from '../../services/canvas';
import { navigate,resetPageScroll } from '../../services/navigation';
import { observationTimeLabel, beijingDateTime } from '../../services/observation-context';

interface RecordView extends Observation {timeLabel:string;placeLabel:string;savedLabel:string;}

const avatars = [
  { id: 'owl', name: '夜枭' }, { id: 'finch', name: '林雀' }, { id: 'leaf', name: '绿叶' },
  { id: 'mountain', name: '山岚' }, { id: 'water', name: '湖光' }, { id: 'letter', name: '字母 / 姓名' }
];

const menuGroups=[
  {title:'观鸟工具',ids:['places','tripHistory','cloud']},
  {title:'鸟友社区',ids:['publications','saved','friends']},
  {title:'账号与偏好',ids:['account','badges','settings']}
];
const coverKey = 'bird-assistant.profile.cover.v1';
const coverOptions = [{id:'woodland',name:'林间枝影'},{id:'waterside',name:'水岸鸟踪'}];
const quickActions = [{id:'journal',name:'手帐',icon:'journal'},{id:'chat',name:'私信',icon:'chat'},{id:'groups',name:'群聊',icon:'user'}];
const shortcutChoices = [...quickActions,{id:'identify',name:'记观察',icon:'camera'},
  {id:'places',name:'收藏地点',icon:'pin'},{id:'activity',name:'鉴定动态',icon:'leaf'}];
const shortcutKey='bird-assistant.profile.shortcuts.v1';
function readShortcuts(){
  const ids:unknown=wx.getStorageSync(shortcutKey);
  if(!Array.isArray(ids) || ids.length!==3 || new Set(ids).size!==3)return quickActions;
  const choices=ids.map(id=>shortcutChoices.find(item=>item.id===id)).filter((item):item is typeof quickActions[number]=>!!item);
  return choices.length===3 ? choices : quickActions;
}
function monthGrid(records:RecordView[],month:string){
  const days=new Set(records.filter(record=>!record.sample).map(record=>record.observedDate));
  return calendarCells(month).map(cell=>({...cell,marked:days.has(cell.value)}));
}

function birdTiles(records:RecordView[]) {
  const birds=new Map<string,{id:string;name:string;count:number;path:string}>();
  for(const record of records){
    if(record.sample)continue;
    const sightings=new Map<string,string>();
    if(record.communityDraft?.species)sightings.set(record.communityDraft.species,record.communityDraft.speciesName || record.birdName);
    for(const target of record.targetConfirmations || [])if(target.species)sightings.set(target.species,target.name);
    sightings.forEach((name,id)=>{
      const bird=birds.get(id);
      if(bird)bird.count++;
      else birds.set(id,{id,name,count:1,path:record.mediaKind==='video'?'':record.imagePath});
    });
  }
  return Array.from(birds.values());
}
function galleryItems(records: RecordView[], favorites: string[], tab: string) {
  const selected = new Set(favorites);
  return records.filter(record => !record.sample && record.mediaKind !== 'audio' && (tab !== 'favorites' || selected.has(record.id)))
    .slice(0,3).map(record => ({id:record.id, name:record.birdName, path:record.imagePath,
      kind:record.mediaKind || 'photo', date:record.observedDate || ''}));
}
const menu=[{id:'journal',icon:'journal',name:'我的手帐'},{id:'account',icon:'user',name:'社区账号与隐私'},{id:'groups',icon:'chat',name:'观鸟群聊'},{id:'cloud',icon:'pin',name:'云端私人观察'},{id:'publications',icon:'leaf',name:'我的社区发布'},{id:'history',icon:'clock',name:'观察与识别历史'},{id:'tripHistory',icon:'leaf',name:'观鸟咨询记录'},{id:'collection',icon:'collection',name:'收藏的本机观察'},{id:'saved',icon:'collection',name:'社区内容书签'},{id:'places',icon:'pin',name:'收藏地点'},{id:'friends',icon:'user',name:'我的好友'},{id:'chat',icon:'chat',name:'私信与通知'},{id:'badges',icon:'leaf',name:'徽章与成长'},{id:'settings',icon:'settings',name:'设置与缓存'}];
Page({
  async loadIdentity(generation:number, revision:number){
    const current=()=>this._visible && this._profileGeneration===generation && sessionRevision()===revision;
    try {
      const account=await api(community+'/account');
      if(!current())return;
      if(!account.profile){this.setData({identity:'register'});return;}
      this.setData({identity:'ready',communityName:account.profile.nickname,communityAvatar:account.profile.avatar,
        handle:account.profile.handle,bio:account.profile.bio});
      const member=await api(community+'/members/'+encodeURIComponent(account.id));
      if(!current())return;
      const showcase=await loadPresentation(account.id,member.showcase);
      if(current())this.setData({showcase,identityNotice:showcase.coverNotice?'封面加载失败，点此重试':''});
    }catch{if(current())this.setData({identity:this.data.communityName?'ready':'offline',identityNotice:'主页资料暂未加载，点此重试'});}
  },
  retryIdentity(){this.onShow();},
  onPageScroll(event:{scrollTop:number}){this._scrollTop=event.scrollTop;const compactCover=event.scrollTop>180;if(compactCover!==this.data.compactCover)this.setData({compactCover});},
  changeShortcut(event:WechatMiniprogram.TouchEvent){
    const index=Number(event.currentTarget.dataset.index),current=this.data.quickActions;
    const choices=shortcutChoices.filter(item=>!current.some(action=>action.id===item.id));
    wx.showActionSheet({itemList:choices.map(item=>'替换为'+item.name),success:result=>{
      if(!choices[result.tapIndex])return;
      const next=current.slice();next[index]=choices[result.tapIndex];
      try{wx.setStorageSync(shortcutKey,next.map(item=>item.id));this.setData({quickActions:next});}
      catch(error){this.setData({error:errorText(error)});}
    }});
  },
  monthStep(event:WechatMiniprogram.TouchEvent){
    const month=calendarMonth(this.data.month,Number(event.currentTarget.dataset.delta));
    this.setData({month,monthLabel:month.slice(0,7),cells:monthGrid(this.data.records,month)});
  },
  openStudio(){if(this.data.identity==='ready')navigate({url:'/field/studio/index'});else if(this.data.identity==='offline')this.retryIdentity();else hub('account');},
  data: {compactCover:false,month:calendarMonth(beijingDate()),monthLabel:beijingDate().slice(0,7),weekdays:['一','二','三','四','五','六','日'],cells:[] as ReturnType<typeof monthGrid>,identity:'guest',identityNotice:'',handle:'',bio:'',showcase:present(),birdTiles:[] as {id:string;name:string;count:number;path:string}[],observationDay:'',cover:'woodland',quickActions,galleryTab:'recent',gallery:[] as ReturnType<typeof galleryItems>,localCloudId:'',localChannels:[] as {channel:string;status:string;reason:string;id:string}[],localStatusError:'',communityName:'',communityAvatar:'',numberEditing:'',numberDrafts:{} as Record<string,string>,cropBusy:false,name:'观鸟者',avatar:'/assets/avatars/owl.png',draftName:'',draftAvatar:'',edit:false,busy:false,avatarPersisted:true,error:'',records:[] as RecordView[],avatars,nativeAvatar:wx.canIUse('button.open-type.chooseAvatar'),view:'profile',observationCount:0,speciesCount:0,favoriteCount:0,favorites:[] as string[],shownRecords:[] as RecordView[],detail:null as RecordView|null,crop:false,cropPath:'',cropWidth:0,cropHeight:0,cropDisplayW:220,cropDisplayH:220,cropZoom:1,cropRotation:0,cropX:0,cropY:0,storageKB:0,menu,menuGroups:menuGroups.map(group=>({title:group.title,items:group.ids.map(id=>menu.find(item=>item.id===id)!)})),pageTitle:'羽迹',savedPlaces:[] as Array<SavedPlace&{dateLabel:string}>,placesBusy:false,cacheInfo:null as PreviewCacheInfo|null,cacheError:'',cacheNotice:'',writingChecking:false,writingStatus:'',writingReady:false,savedPosts:[] as Array<{id:string;title:string}>},
  _pickToken: 0,_visible:false,_profileGeneration:0,_writingCheck:0,
  _scrollTop:0,_homeScroll:0,_filteredIds:null as Set<string>|null,
  _detailReturn:null as {view:string;title:string;scrollTop:number}|null,
  _cropDrag:null as {x:number;y:number;offsetX:number;offsetY:number}|null,
  onShow() {
    this._visible=true;const generation=++this._profileGeneration,revision=sessionRevision();
    selectTab(this, 4);
    const active=sessionState()==='active';
    this.setData({communityName:'',communityAvatar:'',handle:'',bio:'',identity:active?'loading':'guest',identityNotice:'',showcase:present()});
    if(active)void this.loadIdentity(generation,revision);
    if (this.data.edit) return;
    try {
      const repository = localRepository(), profile = repository.profile();
      const records=repository.list().filter(record=>record.mediaKind!=='audio').map(r=>({...r,sample:isSampleObservation(r),timeLabel:observationTimeLabel(r),placeLabel:r.placeName||'未添加',savedLabel:beijingDateTime(r.createdAt)})),favorites=wx.getStorageSync('bird-assistant.favorites.v1')||[];
      if(!Array.isArray(favorites)||!favorites.every(id=>typeof id==='string'))throw new Error('本机收藏格式无法读取，已有内容未覆盖。');
      const cover = wx.getStorageSync(coverKey) === 'waterside' ? 'waterside' : 'woodland';
      const listView=this.data.view==='detail'?this._detailReturn?.view:this.data.view;
      const filteredIds=this._filteredIds;
      const shownRecords=listView==='collection'?records.filter(record=>favorites.includes(record.id)):
        listView==='history' && filteredIds?records.filter(record=>filteredIds.has(record.id)):records;
      this.setData({name:profile.name,avatar:profile.avatar,cover,records,quickActions:readShortcuts(),cells:monthGrid(records,this.data.month),birdTiles:birdTiles(records),favorites,gallery:galleryItems(records,favorites,this.data.galleryTab),...observationStats(records,favorites),shownRecords,detail:this.data.detail?records.find(r=>r.id===this.data.detail?.id)||null:null,error:''});
      if(this.data.view==='detail' && this.data.detail)void this.loadLocalStatus(this.data.detail);
    } catch (error) { this.setData({ error: errorText(error) }); }
    if(this.data.view==='places')this.loadPlaces();
    if(this.data.view==='settings')this.refreshSettings();
  },
  onHide(){this._visible=false;this._profileGeneration++;this._writingCheck++;if(this.data.writingChecking)this.setData({writingChecking:false,writingStatus:'检查已暂停，可返回后重新检查。'});},
  onUnload() { this._visible=false;this._profileGeneration++;this._writingCheck++;this._pickToken++; },
  changeCover() {
    wx.showActionSheet({itemList:coverOptions.map(option=>option.name + (option.id===this.data.cover?' · 当前':'')), success:result=>{
      const option = coverOptions[result.tapIndex];
      if (!option || this.data.view !== 'profile') return;
      try { wx.setStorageSync(coverKey,option.id); this.setData({cover:option.id}); }
      catch (error) { this.setData({error:errorText(error)}); }
    }});
  },
  selectGallery(event:WechatMiniprogram.TouchEvent) {
    const tab = String(event.currentTarget.dataset.tab);
    this.setData({galleryTab:tab,gallery:galleryItems(this.data.records,this.data.favorites,tab)});
  },
  speciesRecords(event:WechatMiniprogram.TouchEvent){
    const id=event.currentTarget.dataset.id;
    this.showSelection(this.data.records.filter(record=>!record.sample && (record.communityDraft?.species===id || record.targetConfirmations?.some(target=>target.species===id))), '鸟种观察');
  },
  chooseDay(event:WechatMiniprogram.TouchEvent){
    const day=String(event.currentTarget.dataset.day);
    this.setData({observationDay:day});
    this.showSelection(this.data.records.filter(record=>!record.sample && record.observedDate===day),day+' 的观察');
  },
  showSelection(rows:RecordView[],title:string){this._homeScroll=this._scrollTop;this._filteredIds=new Set(rows.map(row=>row.id));this.setData({shownRecords:rows,pageTitle:title,view:'history'});resetPageScroll(this);},
  galleryImageError(event:WechatMiniprogram.TouchEvent) {
    const index = this.data.gallery.findIndex(item=>item.id===event.currentTarget.dataset.id);
    if (index >= 0) this.setData({[`gallery[${index}].path`]:''});
  },
  identify() { wx.switchTab({url:'/pages/identify/index'}); },
  edit() { this.setData({edit:true,view:'edit',pageTitle:'编辑资料',draftName:this.data.name,draftAvatar:this.data.avatar,avatarPersisted:true,error:''});resetPageScroll(this); },
  changeName(event: WechatMiniprogram.CustomEvent<{ value: string }>) { this.setData({ draftName: event.detail.value }); },
  chooseDefault(event: WechatMiniprogram.TouchEvent) {
    const id = String(event.currentTarget.dataset.id);
    if (avatars.some(avatar => avatar.id === id)) { this._pickToken++; this.setData({ draftAvatar: '/assets/avatars/' + id + '.png', avatarPersisted: true }); }
  },
  chooseAvatar(event: WechatMiniprogram.CustomEvent<{ avatarUrl?: string }>) {
    if (this.data.edit&&!this.data.busy&&event.detail.avatarUrl) { this._pickToken++; this.setData({ draftAvatar: event.detail.avatarUrl, avatarPersisted: false, error: '' }); }
  },
  avatarError(event:WechatMiniprogram.CustomEvent<{errMsg?:string}>){
    if(!this.data.edit||this.data.busy)return;
    // Native chooser cancellation is expected; preserve the entire draft.
    if(/cancel/i.test(event.detail.errMsg||''))return;
    this.setData({error:'系统头像选择未完成，可重试或上传自己的图片。'});
  },
  chooseFallback() {
    const token = ++this._pickToken;
    choosePhoto(['album']).then(path=>{if(path&&token===this._pickToken&&this.data.edit)wx.getImageInfo({src:path,success:info=>{if(token!==this._pickToken)return;this.setData({crop:true,cropPath:info.path,cropWidth:info.width,cropHeight:info.height,cropZoom:1,cropRotation:0,cropX:0,cropY:0});this.fitCrop();resetPageScroll(this);},fail:()=>this.setData({error:'图片无法读取，原头像仍保留。'})});}).catch(error=>{if(token===this._pickToken)this.setData({error:errorText(error)});});
  },
  cancel() { if (this.data.busy) return; this._pickToken++; this.setData({edit:false,view:'profile',pageTitle:'羽迹',crop:false,error:''});resetPageScroll(this); },
  save() {
    if (this.data.busy) return;
    if (!this.data.draftName.trim()) { this.setData({ error: '请填写显示名称。' }); return; }
    this.setData({ busy: true, error: '' });
    const persist = this.data.avatarPersisted ? Promise.resolve(this.data.draftAvatar) : persistImage(this.data.draftAvatar);
    persist.then(avatar => {
      this.setData({ draftAvatar: avatar, avatarPersisted: true });
      const profile = localRepository().saveProfile({ name: this.data.draftName, avatar });
      this._pickToken++;this.setData({name:profile.name,avatar:profile.avatar,edit:false,busy:false,view:'profile',pageTitle:'羽迹'});resetPageScroll(this);
      wx.showToast({ title: '已保存在本机', icon: 'success' });
    }).catch(error => this.setData({ busy: false, error: errorText(error) }));
  },
  preview(event: WechatMiniprogram.TouchEvent) {
    const record = this.data.records.find(item => item.id === event.currentTarget.dataset.id);
    if (record) wx.previewImage({ urls: [record.imagePath], fail: () => wx.showToast({ title: '照片暂时无法显示，记录仍保留', icon: 'none' }) });
  },
  menu(e:WechatMiniprogram.TouchEvent){
    const view=String(e.currentTarget.dataset.id);
    if(view==='identify'){this.identify();return;}
    if(view==='activity'){hub('inbox');return;}
    if(view==='journal'){wx.switchTab({url:'/pages/journal/index'});return;}
    if(view==='tripHistory'){navigate({url:'/field/trip/index?history=1'});return;}
    const item=this.data.menu.find(m=>m.id===view),destinations:Record<string,string>={friends:'friends',account:'account',groups:'groups',chat:'inbox',badges:'growth',saved:'bookmarks',cloud:'observations',publications:'mine'};
    if(destinations[view]){hub(destinations[view]);return;}if(!item)return;
    this._homeScroll=this._scrollTop;this._filteredIds=null;
    this.setData({view,pageTitle:item.name,shownRecords:view==='collection'?this.data.records.filter(r=>this.data.favorites.includes(r.id)):this.data.records,error:''});
    if(view==='places')this.loadPlaces();if(view==='settings')this.refreshSettings();resetPageScroll(this);
  },
  loadPlaces(){try{this.setData({savedPlaces:readSavedPlaces().map(place=>({...place,dateLabel:beijingDateTime(place.updatedAt)})),error:''});}catch(error){this.setData({error:errorText(error)});}},
  async addPlace(){
    if(this.data.placesBusy)return;const token=++this._pickToken;this.setData({placesBusy:true,error:''});
    try{const place=await wx.chooseLocation({});if(token!==this._pickToken||this.data.view!=='places')return;
      savePlace({name:place.name,address:place.address||'',latitude:place.latitude,longitude:place.longitude});this.loadPlaces();wx.showToast({title:'地点已收藏',icon:'success'});
    }catch(error){if(token===this._pickToken&&!/cancel/i.test(String((error as {errMsg?:string})?.errMsg||'')))this.setData({error:errorText(error)});}
    finally{if(token===this._pickToken)this.setData({placesBusy:false});}
  },
  openPlace(e:WechatMiniprogram.TouchEvent){
    const place=this.data.savedPlaces.find(item=>item.id===e.currentTarget.dataset.id);if(!place)return;
    openMap(place,'','所有鸟种',0,{scale:15,precisionLabel:'收藏地点 · '+place.name});
  },
  deletePlace(e:WechatMiniprogram.TouchEvent){
    const place=this.data.savedPlaces.find(item=>item.id===e.currentTarget.dataset.id);if(!place)return;
    wx.showModal({title:'移除收藏地点？',content:place.name,confirmText:'移除',success:reply=>{if(!reply.confirm||this.data.view!=='places')return;try{removeSavedPlace(place.id);this.loadPlaces();}catch(error){this.setData({error:errorText(error)});}}});
  },
  refreshSettings(){
    try{this.setData({storageKB:wx.getStorageInfoSync().currentSize,cacheInfo:previewCacheInfo(),cacheError:''});}
    catch(error){this.setData({cacheInfo:null,cacheError:errorText(error)});}
  },
  cleanPreviewCache(){
    if(!this.data.cacheInfo)return;
    wx.showModal({title:'清理手帐预览缓存？',content:'只移除可重新生成的缩略图与索引。手帐、撤销历史、帖子草稿、AI建议、观察原图和账号资料保留。',confirmText:'清理预览',success:reply=>{
      if(!reply.confirm||this.data.view!=='settings')return;
      try{const result=clearPreviewCache();this.setData({cacheNotice:result.failed?'已清理部分预览，有些缓存暂未释放，可稍后重试。':'预览缓存已清理，下次打开手帐时重新生成。'});this.refreshSettings();}
      catch(error){this.setData({cacheError:errorText(error)});}
    }});
  },
  async checkWriting(){
    if(this.data.writingChecking)return;
    if(sessionState()!=='active'){this.setData({writingStatus:'请先登录社区账号，再检查手机写作服务。',writingReady:false});return;}
    const generation=++this._writingCheck,revision=sessionRevision();this.setData({writingChecking:true,writingStatus:'正在检查服务配置…',writingReady:false});
    const current=()=>this._visible&&generation===this._writingCheck&&revision===sessionRevision()&&sessionState()==='active';
    try{const connection=await connectBusiness();if(!current())return;await writingReadiness(connection.origin,connection.header.Authorization?.replace(/^Bearer /,'')||'');
      if(current())this.setData({writingReady:true,writingStatus:'手机写作服务已就绪。可在手帐或帖子中生成建议。'});
    }catch(error){if(current())this.setData({writingReady:false,writingStatus:errorText(error)});}
    finally{if(current())this.setData({writingChecking:false});}
  },
  async loadLocalStatus(detail:RecordView){
    this.setData({localCloudId:'',localChannels:[],localStatusError:''});
    if(detail.sample || (detail.mediaKind && detail.mediaKind!=='photo') || sessionState()==='out')return;
    try{
      const reference=detail.communityDraft?.reference || detail.id;
      const state=await api('/api/v2/observations/by-reference/'+encodeURIComponent(reference));
      if(this.data.detail?.id===detail.id)this.setData({localCloudId:state.id||'',localChannels:state.channels});
    }catch{if(this.data.detail?.id===detail.id)this.setData({localStatusError:'暂时无法读取公开进度'});}
  },
  localShare(){
    const detail=this.data.detail;
    if(!detail || detail.sample || (detail.mediaKind && detail.mediaKind!=='photo'))return;
    if(this.data.localCloudId){hub('record',this.data.localCloudId);return;}
    const draft:Draft=detail.communityDraft || {reference:detail.id,path:detail.imagePath,species:null,speciesName:'待鉴定',analysis:detail.analysis?.analysisId||null,target:null,
      date:detail.observedDate||'',time:detail.observedAt?beijingDateTime(detail.observedAt).slice(11,16):'',note:detail.notes,place:detail.placeName||'',point:null,device:''};
    setDraft({...draft,path:detail.imagePath});hub('publish');
  },
  localSpecies(){const species=this.data.detail?.communityDraft?.species;if(species)hub('species',species);},
  copyDiagnostics(){try{wx.setClipboardData({data:diagnosticText()});}catch(error){this.setData({error:errorText(error)});}},
  reviewLocal(){const id=this.data.detail?.id;if(id){queueObservationReview(id);wx.switchTab({url:'/pages/identify/index'});}},
  openRecord(e:WechatMiniprogram.TouchEvent){const detail=this.data.records.find(r=>r.id===e.currentTarget.dataset.id);if(detail){this._detailReturn={view:this.data.view,title:this.data.pageTitle,scrollTop:this._scrollTop};this.setData({detail,view:'detail',pageTitle:'观察详情'});void this.loadLocalStatus(detail);resetPageScroll(this);}},
  favorite(){const r=this.data.detail;if(!r)return;const favorites=this.data.favorites.includes(r.id)?this.data.favorites.filter(id=>id!==r.id):[...this.data.favorites,r.id];try{wx.setStorageSync('bird-assistant.favorites.v1',favorites);this.setData({favorites,gallery:galleryItems(this.data.records,favorites,this.data.galleryTab),...observationStats(this.data.records,favorites)});wx.showToast({title:favorites.includes(r.id)?'已加入我的收藏':'已移除收藏',icon:'none'});}catch(error){this.setData({error:errorText(error)});}},
  back(){
    if(this.data.crop){this.setData({crop:false});return;}
    if(this.data.edit){this.cancel();return;}
    const target=(this.data.view==='detail' && this._detailReturn)||{view:'profile',title:'羽迹',scrollTop:this._homeScroll};
    this._detailReturn=null;
    if(target.view==='profile')this._filteredIds=null;
    this.setData({view:target.view,pageTitle:target.title,detail:null,error:'',
      ...(target.view==='collection'?{shownRecords:this.data.records.filter(record=>this.data.favorites.includes(record.id))}:{})});
    syncNavigation(this);wx.nextTick(()=>wx.pageScrollTo({scrollTop:target.scrollTop,duration:0}));
  },
  fitCrop(){const d=this.data,box=avatarCrop(d.cropWidth,d.cropHeight,d.cropZoom,d.cropRotation,d.cropX,d.cropY);this.setData({cropDisplayW:round2(box.cropDisplayW),cropDisplayH:round2(box.cropDisplayH),cropX:round2(box.cropX),cropY:round2(box.cropY)});},
  setCropValue(key:string,value:number){if(!Number.isFinite(value))return;if(key==='cropZoom')this.setData({cropZoom:round2(clamp(value,1,3))});else if(key==='cropRotation')this.setData({cropRotation:round2(clamp(value,-180,180))});else return;this.fitCrop();},
  cropZoom(e:WechatMiniprogram.CustomEvent<{value:number}>){this.setData({numberEditing:''});this.setCropValue('cropZoom',Number(e.detail.value));},
  numberInput(e:WechatMiniprogram.CustomEvent<{value:string}>){const key=String(e.currentTarget.dataset.key);if(!['cropZoom','cropRotation'].includes(key))return '';const current=String(key==='cropZoom'?this.data.cropZoom:this.data.cropRotation),previous=this.data.numberEditing===key?this.data.numberDrafts[key]??current:current,text=numberDraft(e.detail.value,previous);this.setData({numberEditing:key,numberDrafts:{...this.data.numberDrafts,[key]:text}});const value=parseNumberDraft(text);if(value!==null)this.setCropValue(key,value);return text;},
  numberCommit(e:WechatMiniprogram.CustomEvent<{value:string}>){const key=String(e.currentTarget.dataset.key);if(this.data.numberEditing!==key)return;const value=parseNumberDraft(this.data.numberDrafts[key]||'');if(value!==null)this.setCropValue(key,value);this.setData({numberEditing:''});},
  rotate(e:WechatMiniprogram.TouchEvent){this.setData({cropRotation:round2((this.data.cropRotation+Number(e.currentTarget.dataset.delta)+540)%360-180),cropX:0,cropY:0,numberEditing:''});this.fitCrop();},
  resetCropRotation(){this.setData({cropRotation:0,cropX:0,cropY:0,numberEditing:''});this.fitCrop();},
  cropStart(e:WechatMiniprogram.TouchEvent){const t=e.touches[0];this._cropDrag={x:t.clientX,y:t.clientY,offsetX:this.data.cropX,offsetY:this.data.cropY};},
  cropMove(e:WechatMiniprogram.TouchEvent){const g=this._cropDrag,t=e.touches[0];if(g&&t){this.setData({cropX:g.offsetX+t.clientX-g.x,cropY:g.offsetY+t.clientY-g.y});this.fitCrop();}},
  cropEnd(){this._cropDrag=null;},cancelCrop(){this.setData({crop:false});},
  async useCrop(){
    if(this.data.cropBusy)return;const d={...this.data};this.setData({cropBusy:true,error:''});
    try{
      const canvas=await getCanvas(this,'#avatar-export',512,512),ctx=canvas.getContext('2d'),image=await loadCanvasImage(canvas,d.cropPath),k=512/220;
      ctx.fillStyle='#fffef9';ctx.fillRect(0,0,512,512);ctx.save();ctx.translate(256+d.cropX*k,256+d.cropY*k);ctx.rotate(d.cropRotation*Math.PI/180);ctx.drawImage(image,-d.cropDisplayW*k/2,-d.cropDisplayH*k/2,d.cropDisplayW*k,d.cropDisplayH*k);ctx.restore();
      const path=await exportCanvas(canvas);this.setData({draftAvatar:path,avatarPersisted:false,crop:false});resetPageScroll(this);
    }catch(error){this.setData({error:errorText(error)});}finally{this.setData({cropBusy:false});}
  }
});
