import {PostImage,postImage,postGallery,checkPostImages,POST_IMAGE_LIMIT,POST_JOURNAL_LIMIT} from '../../services/post-media';
import {readPostDraft,savePostDraft,PostDraft} from '../../services/post-draft';
import {readJournals,JournalDocument} from '../../services/journal-model';
import {getCanvas,exportCanvas} from '../../services/canvas';
import {renderJournal} from '../../services/journal-render';
import {api,community,hub,imageUrl,setCompose} from '../../services/community';
import {cleanPhotoDetails,PhotoDetails} from '../../services/photo-details';
import {layout} from '../../services/layout';
import {forumPost} from '../../services/forum';
import { selectTab } from '../../services/tabs';
import { errorText } from '../../services/media';
import { resetPageScroll } from '../../services/navigation';
import { postWritingBrief, POST_WRITING_PURPOSES } from '../../services/post-writing';
import {startJournalAi,journalAiAvailable,JournalAiSuggestion} from '../../services/journal-ai';
import {teamWritingTransport} from '../../services/writing-network';
const reactionSets=new WeakMap<object,Set<string>>();
function reactions(page:object){let active=reactionSets.get(page);if(!active){active=new Set();reactionSets.set(page,active);}return active;}
Page({
  data:{attachments:[] as PostImage[],activeAttachment:'',activeKind:'photo',journalPicker:false,journalChoices:[] as Array<{id:string;title:string;cover:string;selected:boolean}>,journalChosen:0,mediaLimit:POST_IMAGE_LIMIT,journalLimit:POST_JOURNAL_LIMIT,picking:false,feedHeight:600,refreshing:false,pullReady:false,pullProgress:0,manualCamera:{} as PhotoDetails,moreOpen:false,moreItems:[{id:'library',label:'鸟种资料库',icon:'journal',hint:'查阅与对比'},{id:'external',label:'外部鸟讯',icon:'pin',hint:'发现公开观察'},{id:'friends',label:'找鸟友',icon:'user',hint:'认识同行的人'},{id:'inbox',label:'消息',icon:'chat',hint:'继续一段对话'},{id:'groups',label:'群聊',icon:'leaf',hint:'一起聊聊观鸟'},{id:'draft',label:'本机草稿',icon:'image',hint:'接着上次写'}],feedTotal:0,writingBusy:false,writingSuggestion:null as JournalAiSuggestion|null,remotePosts:[] as any[],feedLoading:false,more:false,view:'feed',title:'',body:'',image:'',error:'',busy:false,writingOpen:false,writingPurposes:POST_WRITING_PURPOSES,writingPurpose:1,writingInstructions:'',writingIncludeImage:false,writingSummary:'',writingError:''},
  _composeGeneration:0,
  _journalDocuments:[] as JournalDocument[],
  _writingJob:null as ReturnType<typeof startJournalAi>|null,
  _writingContext:'',
  writingContext(){const d=this.data;return JSON.stringify([d.title,d.body,d.image,d.writingPurpose,d.writingInstructions,d.writingIncludeImage]);},
  _refreshSeq:0,_feedSeq:0,_visible:true,
  onLoad(){reactionSets.set(this,new Set());this.resizeFeed();},
  resizeFeed(){this.setData({feedHeight:layout(this.data.view!=='feed').height});},onResize(){this.resizeFeed();},
  photoDetails(event:WechatMiniprogram.CustomEvent<PhotoDetails>){const manualCamera=cleanPhotoDetails(event.detail);this.setData({manualCamera,attachments:this.data.attachments.map(item=>item.id===this.data.activeAttachment?{...item,manualCamera}:item)});},
  pulling(event:WechatMiniprogram.CustomEvent<{dy:number}>){const dy=Number(event.detail.dy)||0;this.setData({pullReady:dy>=64,pullProgress:Math.min(1,dy/64)});},
  pullReset(){this.setData({pullReady:false,pullProgress:0});},
  async pullRefresh(){if(this.data.refreshing)return;const token=++this._refreshSeq;this.setData({refreshing:true});try{await this.loadFeed(false,true);}finally{if(token===this._refreshSeq)this.setData({refreshing:false,pullReady:false,pullProgress:0});}},
  onHide(){this._refreshSeq++;this._visible=false;this._feedSeq++;this.setData({feedLoading:false,refreshing:false,pullReady:false,pullProgress:0,moreOpen:false});this.closeWriting();},onUnload(){this._composeGeneration++;this._refreshSeq++;this._visible=false;this._feedSeq++;this.closeWriting();reactionSets.delete(this);},
  _writingBrief:null as ReturnType<typeof postWritingBrief>|null,
  onShow(){this._visible=true;this.resizeFeed();selectTab(this,3);if(this.data.view==='feed')void this.loadFeed();},
  async onPullDownRefresh(){try{if(this.data.view==='feed')await this.loadFeed(false,true);}finally{wx.stopPullDownRefresh?.();}},
  onReachBottom(){if(this.data.view==='feed'&&this.data.more)void this.loadFeed(true);},
  async loadFeed(append=false,force=false){
    if(this.data.feedLoading&&!force)return;
    const token=++this._feedSeq,previous=append?this.data.remotePosts:[];this.setData({feedLoading:true,error:''});
    try{const result=await api(community+'/posts','GET',{limit:30,offset:previous.length});
      if(token!==this._feedSeq||!this._visible)return;
      const unique=new Map(previous.map((row:any)=>[row.id,row]));for(const post of result.items)unique.set(post.id,{...forumPost(post),image:imageUrl(post.image),gallery:postGallery(post).map(item=>({...item,image:imageUrl(item.image)}))});
      this.setData({remotePosts:Array.from(unique.values()),feedTotal:result.total??unique.size,more:result.hasMore??result.items.length===30});
    }catch(error){if(token===this._feedSeq&&this._visible)this.setData({error:errorText(error)});}finally{if(token===this._feedSeq&&this._visible)this.setData({feedLoading:false});}
  },
  refreshFeed(){void this.loadFeed(false,true);},nextPage(){void this.loadFeed(true);},
  patchPost(id:string,patch:Record<string,unknown>){this.setData({remotePosts:this.data.remotePosts.map((row:any)=>row.id===id?{...row,...patch}:row)});},
  async react(event:WechatMiniprogram.TouchEvent){
    const id=String(event.currentTarget.dataset.id),kind=String(event.currentTarget.dataset.kind),post=this.data.remotePosts.find((row:any)=>row.id===id);
    const activeReactions=reactions(this);
    if(!post||!['like','bookmark'].includes(kind)||activeReactions.has(id+':'+kind))return;
    const lock=id+':'+kind,pending=kind==='like'?'likePending':'bookmarkPending';activeReactions.add(lock);this.patchPost(id,{[pending]:true});
    const active=kind==='like'?post.liked:post.favorited;
    try{const base=community+'/publications/'+id;const result=await api(base+(active?'/reactions/':'/')+kind,active?'DELETE':'PUT');
      this._feedSeq++;if(!this._visible)return;
      this.patchPost(id,kind==='like'?{liked:!!result.active,
        likes:Number.isInteger(result.likes)?result.likes:post.likes+(post.hasLikes?(result.active?1:-1):0),hasLikes:post.hasLikes||Number.isInteger(result.likes)}:{favorited:!!result.active});
      this.setData({feedLoading:false,error:''});
    }catch(error){if(this._visible)this.setData({error:errorText(error)});}finally{activeReactions.delete(lock);if(this._visible)this.patchPost(id,{[pending]:false});}
  },
  moreSections(){this.setData({moreOpen:!this.data.moreOpen});},
  closeMore(){this.setData({moreOpen:false});},
  holdMenu(){},
  moreSection(event:WechatMiniprogram.TouchEvent){const id=String(event.currentTarget.dataset.id);if(!this.data.moreItems.some(item=>item.id===id))return;this.closeMore();if(id==='draft')this.loadDraft();else hub(id);},
  section(event:WechatMiniprogram.TouchEvent){hub(event.currentTarget.dataset.screen,event.currentTarget.dataset.id||'');},
  compose(){this.setData({view:'compose',error:'',moreOpen:false});this.resizeFeed();resetPageScroll(this);},
  clearWritingBrief(){this._writingJob?.cancel();this._writingJob=null;this._writingContext='';this._writingBrief=null;this.setData({writingBusy:false,writingSuggestion:null,writingSummary:'',writingError:''});},
  change(e:WechatMiniprogram.CustomEvent<{value:string}>){const key=String(e.currentTarget.dataset.key);if(['title','body'].includes(key)){this.setData({[key]:e.detail.value});this.clearWritingBrief();}},
  setImages(attachments:PostImage[],active?:string){
    active=active||this.data.activeAttachment;
    checkPostImages(attachments);const selected=attachments.find(item=>item.id===active)||attachments[0];
    this.setData({attachments,activeAttachment:selected?.id||'',activeKind:selected?.kind||'photo',image:selected?.path||'',manualCamera:selected?.manualCamera||{},writingIncludeImage:false});this.clearWritingBrief();
  },
  attach(){
    if(this.data.busy||this.data.picking)return;const remaining=POST_IMAGE_LIMIT-this.data.attachments.length;
    if(remaining<=0){this.setData({error:'最多添加9张照片或手帐成品。'});return;}
    const generation=this._composeGeneration;this.setData({picking:true,error:''});
    wx.chooseImage({count:remaining,sourceType:['album'],sizeType:['original'],success:r=>{if(generation!==this._composeGeneration)return;
      const images=r.tempFilePaths.slice(0,remaining).map((path,i)=>postImage(path,'photo','照片 '+(this.data.attachments.length+i+1)));
      this.setImages([...this.data.attachments,...images],images[0]?.id);},
      fail:error=>{if(generation===this._composeGeneration&&!/cancel/i.test(error.errMsg))this.setData({error:'照片选择未完成，已有素材仍保留。'});},
      complete:()=>{if(generation===this._composeGeneration)this.setData({picking:false});}});
  },
  previewAttachment(event:WechatMiniprogram.TouchEvent){const id=String(event.currentTarget.dataset.id),item=this.data.attachments.find(image=>image.id===id);if(!item?.path)return;
    this.setData({activeAttachment:id,activeKind:item.kind,image:item.path,manualCamera:item.manualCamera,writingIncludeImage:false});this.clearWritingBrief();wx.previewImage({current:item.path,urls:this.data.attachments.map(image=>image.path).filter(Boolean)});
  },
  attachmentDetails(event:WechatMiniprogram.TouchEvent){const item=this.data.attachments.find(image=>image.id===String(event.currentTarget.dataset.id));if(item){this.setData({activeAttachment:item.id,activeKind:item.kind,image:item.path,manualCamera:item.manualCamera,writingIncludeImage:false});this.clearWritingBrief();}},
  removeAttachment(event:WechatMiniprogram.TouchEvent){if(this.data.busy)return;this.setImages(this.data.attachments.filter(item=>item.id!==String(event.currentTarget.dataset.id)));},
  previewPost(event:WechatMiniprogram.TouchEvent){const post=this.data.remotePosts.find((item:any)=>item.id===String(event.currentTarget.dataset.id));const urls=post?.gallery?.map((item:any)=>item.image).filter(Boolean)||[];const current=urls[Number(event.currentTarget.dataset.index)||0];if(current)wx.previewImage({current,urls});},
  chooseJournals(){if(this.data.busy||this.data.picking)return;try{this._journalDocuments=readJournals();const attached=new Set(this.data.attachments.filter(item=>item.kind==='journal').map(item=>item.journalId));
    this.setData({journalPicker:true,journalChosen:0,journalChoices:this._journalDocuments.filter(item=>!attached.has(item.id)).map(item=>({id:item.id,title:item.title,cover:item.elements.find(e=>e.type==='photo')?.src||'',selected:false})),error:''});
  }catch(error){this.setData({error:errorText(error)});}},
  closeJournals(){if(!this.data.busy)this.setData({journalPicker:false});},
  toggleJournal(event:WechatMiniprogram.TouchEvent){if(this.data.busy)return;const id=String(event.currentTarget.dataset.id),item=this.data.journalChoices.find(row=>row.id===id);if(!item)return;
    const remaining=Math.min(POST_JOURNAL_LIMIT-this.data.attachments.filter(row=>row.kind==='journal').length,POST_IMAGE_LIMIT-this.data.attachments.length);
    if(!item.selected&&this.data.journalChosen>=remaining){this.setData({error:'最多3份手帐，照片与手帐合计不超过9张。'});return;}
    const journalChoices=this.data.journalChoices.map(row=>row.id===id?{...row,selected:!row.selected}:row);this.setData({journalChoices,journalChosen:journalChoices.filter(row=>row.selected).length});
  },
  async addJournals(){if(this.data.busy||!this.data.journalChosen)return;const generation=this._composeGeneration;this.setData({busy:true,error:''});
    try{for(const choice of this.data.journalChoices.filter(item=>item.selected)){
      const document=this._journalDocuments.find(item=>item.id===choice.id);if(!document)continue;
      const canvas=await getCanvas(this,'#post-journal-export',document.width,document.height);await renderJournal(canvas,document);const path=await exportCanvas(canvas);
      if(generation!==this._composeGeneration)return;this.setImages([...this.data.attachments,postImage(path,'journal',document.title,document.id)]);
    }this.setData({journalPicker:false,journalChosen:0});
    }catch(error){if(generation===this._composeGeneration)this.setData({error:errorText(error)});}finally{if(generation===this._composeGeneration)this.setData({busy:false});}
  },
  openWriting(){if(this.data.view!=='compose'||this.data.busy)return;this.clearWritingBrief();this.setData({writingOpen:true});},
  closeWriting(){this.clearWritingBrief();this.setData({writingOpen:false});},
  writingPurpose(e:WechatMiniprogram.CustomEvent<{value:string}>){const purpose=Number(e.detail.value);if(Number.isInteger(purpose)&&purpose>=0&&purpose<POST_WRITING_PURPOSES.length){this.setData({writingPurpose:purpose});this.clearWritingBrief();}},
  writingInstructions(e:WechatMiniprogram.CustomEvent<{value:string}>){this.setData({writingInstructions:e.detail.value});this.clearWritingBrief();},
  writingImage(){this.setData({writingIncludeImage:!!this.data.image&&!this.data.writingIncludeImage});this.clearWritingBrief();},
  async prepareWriting(){
    if(this.data.writingBusy)return;
    try{const d=this.data,brief=postWritingBrief({title:d.title,body:d.body,instructions:d.writingInstructions,purpose:d.writingPurpose,image:d.image,includeImage:d.writingIncludeImage});this._writingBrief=brief;
      this.setData({writingSummary:'已整理：'+brief.purpose+'；参考当前标题与正文，关联 '+brief.images.length+' 张照片。'+(brief.instructions?'\n写作要求：'+brief.instructions:''),writingError:''});
      const context=this.writingContext(),request={version:1 as const,requestId:'post-'+Date.now().toString(36),purpose:'论坛：'+brief.purpose,
        prompt:JSON.stringify({title:brief.title,body:brief.body,instructions:brief.instructions,rules:brief.rules}),maxChars:600,
        images:brief.images.map(path=>({id:'post-photo',path,label:'用户明确勾选的帖子照片'}))};
      const job=startJournalAi(request,journalAiAvailable()?undefined:teamWritingTransport(this));this._writingJob=job;this._writingContext=context;this.setData({writingBusy:true});
      try{const suggestion=await job.result;if(this._writingJob===job&&this.data.writingOpen&&context===this.writingContext())this.setData({writingSuggestion:suggestion});}
      catch(error){if(this._writingJob===job)this.setData({writingError:errorText(error)});}
      finally{if(this._writingJob===job){this._writingJob=null;this.setData({writingBusy:false});}}
    }catch(error){this._writingBrief=null;this.setData({writingSummary:'',writingError:errorText(error)});}
  },
  applyWriting(){const suggestion=this.data.writingSuggestion;if(!suggestion||this._writingContext!==this.writingContext()){this.setData({writingError:'帖子已修改，请重新生成；原稿仍保留。'});return;}this.setData({title:suggestion.title,body:suggestion.body,writingOpen:false});this.clearWritingBrief();},
  publish(){if(this.data.busy||this.data.picking)return;if(!this.data.body.trim()){this.setData({error:'请写一点帖子内容，草稿仍然保留。'});return;}
    if(this.data.attachments.some(item=>!item.path)){this.setData({error:'请重新添加未保留的照片，或移除占位卡后继续。'});return;}
    setCompose({title:this.data.title,body:this.data.body,photo:this.data.image,manualCamera:this.data.manualCamera,attachments:this.data.attachments});hub('publish','compose');},
  async saveDraft(){if(this.data.busy||this.data.picking)return;const generation=this._composeGeneration;
    const input:PostDraft={version:2,title:this.data.title,body:this.data.body,images:this.data.attachments,writing:{purpose:this.data.writingPurpose,instructions:this.data.writingInstructions,includeImage:this.data.writingIncludeImage}};
    const signature=JSON.stringify(input);this.setData({busy:true,error:''});
    try{const saved=await savePostDraft(input);if(generation!==this._composeGeneration)return;
      const current={version:2,title:this.data.title,body:this.data.body,images:this.data.attachments,writing:{purpose:this.data.writingPurpose,instructions:this.data.writingInstructions,includeImage:this.data.writingIncludeImage}};
      if(JSON.stringify(current)===signature){this.setImages(saved.images);this.setData({writingIncludeImage:!!this.data.image&&saved.writing.includeImage});}
      wx.showToast({title:JSON.stringify(current)===signature?'草稿已保存到本机':'已保存开始时的版本',icon:'success'});
    }catch(error){if(generation===this._composeGeneration)this.setData({error:errorText(error)});}finally{if(generation===this._composeGeneration)this.setData({busy:false});}
  },
  loadDraft(){if(this.data.busy)return;try{const d=readPostDraft();if(d){this._composeGeneration++;this.setImages(d.images);this.setData({title:d.title,body:d.body,view:'compose',writingOpen:false,writingPurpose:Number.isInteger(d.writing?.purpose)&&POST_WRITING_PURPOSES[d.writing.purpose]?d.writing.purpose:1,writingInstructions:d.writing?.instructions||'',writingIncludeImage:!!(this.data.image&&d.writing?.includeImage),error:d.missingMedia?'文字与参数已恢复，请重新添加未保留的照片。':''});this.resizeFeed();resetPageScroll(this);}else wx.showToast({title:'还没有本机草稿',icon:'none'});}catch(error){this.setData({error:errorText(error)});}},
  back(){if(this.data.busy)return;if(this.data.journalPicker){this.closeJournals();return;}if(this.data.moreOpen){this.closeMore();return;}if(this.data.writingOpen){this.closeWriting();return;}this._composeGeneration++;this.setData({view:'feed',error:'',picking:false});this.resizeFeed();resetPageScroll(this);void this.loadFeed();}
});
