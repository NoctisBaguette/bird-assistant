import {api,community,imageUrl,saveAlbumCover,sessionRevision,sessionState} from '../../services/community';
import {choosePhoto} from '../../services/media';
import {navigate} from '../../services/navigation';
import {freshLayout,Layout,loadPresentation,present,previewLayout,profileStatuses,profileTags,profileThemes,Work} from '../../services/profile-showcase';

type Tap = WechatMiniprogram.TouchEvent;
Page({
  data:{profile:null as {nickname:string;handle:string;avatar:string;bio:string}|null,
    catalogue:[] as Work[], layout:freshLayout(), display:present(), albumPath:'', picking:false,
    themes:profileThemes, tags:[] as {name:string;selected:boolean}[], statuses:profileStatuses,
    choices:[] as {id:string;title:string;image?:string;rank:number}[],
    preview:false, loading:true, saving:false, error:'', dirty:false,dragId:'',previousOrder:[] as string[],
    publicPosts:[] as Work[], publicBookmarks:[] as Work[], previewTab:'posts',bookmarksVisible:false},
  _owner:'',_revision:-1,_load:0,_syncIdentity:false,_rows:[] as number[],_savedCover:'',
  onShow(){
    if(!this.data.profile || this._revision!==sessionRevision()){void this.load();return;}
    if(this._syncIdentity){this._syncIdentity=false;void this.refreshIdentity();}
  },
  async refreshIdentity(){
    const revision=this._revision;
    try{const account=await api(community+'/account');
      if(revision===sessionRevision() && account.id===this._owner)this.setData({profile:account.profile,bookmarksVisible:account.profile?.bookmarks==='public'});
    }catch{this.setData({error:'资料刷新失败，请重新进入主页。'});}
  },
  onUnload(){this._load++;},
  async load(){
    const generation=++this._load, revision=sessionRevision();
    this._owner='';this._revision=revision;this._syncIdentity=false;this._rows=[];this._savedCover='';
    this.setData({profile:null,catalogue:[],choices:[],display:present(),layout:freshLayout(),error:'',loading:true,
      preview:false,dirty:false,saving:false,publicPosts:[],publicBookmarks:[],previewTab:'posts',
      bookmarksVisible:false,previousOrder:[],dragId:'',albumPath:'',picking:false});
    const current=()=>generation===this._load && revision===sessionRevision();
    try{
      if(sessionState()!=='active')throw new Error('请先登录羽迹。');
      const account=await api(community+'/account');
      if(!current())return;
      if(!account.profile)throw new Error('请先完善社区资料。');
      const result=await api(community+'/members/'+encodeURIComponent(account.id));
      if(!current())return;
      if(!result.showcase)throw new Error('主页布置服务尚未就绪。');
      const display=await loadPresentation(account.id,result.showcase);
      if(!current())return;
      this._savedCover=display.layout.coverPhoto?display.coverImage:'';
      const catalogue=new Map<string,Work>();
      for(const post of [...display.items,...result.posts.map((item:Work)=>({...item,image:imageUrl(item.image)}))])catalogue.set(post.id,post);
      if(display.layout.cover && !catalogue.has(display.layout.cover))catalogue.set(display.layout.cover,{id:display.layout.cover,title:'当前封面',image:display.coverImage});
      this._owner=account.id;this.setData({profile:account.profile,catalogue:Array.from(catalogue.values()),
        publicPosts:result.posts,publicBookmarks:result.bookmarks,bookmarksVisible:account.profile.bookmarks==='public'});
      this.update(display.layout,false);
      if(display.coverNotice)this.setData({error:display.coverNotice+'，可以重新选择照片。'});
    }catch(error){if(current())this.setData({error:error instanceof Error?error.message:'主页读取失败'});}
    finally{if(current())this.setData({loading:false});}
  },
  update(layout:Layout,dirty=true){
    const albumImage=this.data.albumPath || (layout.coverPhoto?this._savedCover:'');
    this.setData({layout,dirty,display:previewLayout(layout,this.data.catalogue,albumImage),
      tags:profileTags.map(name=>({name,selected:layout.tags.includes(name)})),
      choices:this.data.catalogue.map(item=>({...item,rank:layout.works.indexOf(item.id)+1})),error:''});
  },
  choose(event:Tap){
    if(this.data.saving)return;
    const {field,value}=event.currentTarget.dataset;
    if(field==='landscape' || field==='cover'){
      this.setData({albumPath:''});
      this.update({...this.data.layout,coverPhoto:null,...(field==='cover'?{cover:value}:{landscape:value,cover:null})});
    }
    if(field==='theme'||field==='status')this.update({...this.data.layout,[field]:value});
    if(field==='tags'||field==='works'){
      const selected=this.data.layout[field as 'tags'|'works'];
      if(!selected.includes(value)&&selected.length>=3){wx.showToast({title:'最多可选三项',icon:'none'});return;}
      if(field==='works')this.setData({previousOrder:[]});
      this.update({...this.data.layout,[field]:selected.includes(value)?selected.filter(item=>item!==value):[...selected,value]});
    }
  },
  async chooseAlbum(){
    if(this.data.saving || this.data.picking)return;
    const generation=this._load;
    const current=()=>generation===this._load && this._revision===sessionRevision();
    this.setData({picking:true});
    try{
      const path=await choosePhoto(['album']);
      if(!path || !current())return;
      this.setData({albumPath:path});
      this.update({...this.data.layout,coverPhoto:null,cover:null});
    }catch(error){if(current())this.setData({error:error instanceof Error?error.message:'无法选择照片，请重试。'});}
    finally{if(current())this.setData({picking:false});}
  },
  promote(event:Tap){
    if(this.data.saving)return;
    const id=String(event.currentTarget.dataset.id),works=[...this.data.layout.works],index=works.indexOf(id);
    if(index<=0)return;
    this.setData({previousOrder:this.data.layout.works});works.splice(index,1);works.splice(index-1,0,id);this.update({...this.data.layout,works});
  },
  dragStart(event:Tap){
    if(this.data.saving)return;
    this._rows=[];this.setData({dragId:String(event.currentTarget.dataset.id)});
    wx.createSelectorQuery().in(this).selectAll('.selected-work').boundingClientRect(rows=>{
      if(Array.isArray(rows))this._rows=rows.map(row=>row.top+row.height/2);
    }).exec();
  },
  dragEnd(event:Tap){
    const id=this.data.dragId,touch=event.changedTouches[0];this.setData({dragId:''});
    if(!id || !touch || !this._rows.length)return;
    const works=[...this.data.layout.works],source=works.indexOf(id);
    const closest=this._rows.reduce((best,center,index)=>Math.abs(center-touch.clientY)<Math.abs(this._rows[best]-touch.clientY)?index:best,0);
    if(source<0 || source===closest)return;
    this.setData({previousOrder:this.data.layout.works});works.splice(source,1);works.splice(closest,0,id);this.update({...this.data.layout,works});
  },
  dragCancel(){this.setData({dragId:''});},
  undoOrder(){if(!this.data.saving && this.data.previousOrder.length){this.update({...this.data.layout,works:this.data.previousOrder});this.setData({previousOrder:[]});}},
  previewSection(event:Tap){this.setData({previewTab:event.currentTarget.dataset.tab==='bookmarks' && this.data.bookmarksVisible?'bookmarks':'posts'});},
  focus(event:WechatMiniprogram.CustomEvent<{value:number}>){if(!this.data.saving)this.update({...this.data.layout,focus:event.detail.value});},
  togglePreview(){this.setData({preview:!this.data.preview});wx.pageScrollTo({scrollTop:0,duration:180});},
  back(){if(this.data.saving)return;if(this.data.preview){this.togglePreview();return;}wx.navigateBack();},
  async save(){
    if(this.data.saving || this.data.picking || !this._owner || this._revision!==sessionRevision())return;
    const generation=this._load;this.setData({saving:true,error:''});
    try{
      if(this.data.albumPath)await saveAlbumCover(this.data.albumPath,this.data.layout);
      else await api(community+'/account/showcase','PUT',this.data.layout);
      if(generation!==this._load || this._revision!==sessionRevision())return;
      this.setData({dirty:false});wx.showToast({title:'主页已保存',icon:'success'});wx.navigateBack();
    }catch(error){if(generation===this._load)this.setData({error:error instanceof Error?error.message:'保存失败，请重试'});}
    finally{if(generation===this._load)this.setData({saving:false});}
  },
  editIdentity(){this._syncIdentity=true;navigate({url:'/field/social/index?screen=account&edit=1'});}
});
