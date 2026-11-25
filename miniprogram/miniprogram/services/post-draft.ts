import {PostImage,checkPostImages,cleanPostImage,postImage} from './post-media';

export const POST_DRAFT_KEY='bird-assistant.post-draft.v2';
export const POST_RECOVERY_KEY='bird-assistant.post-draft-recovery.v2';
const LEGACY='bird-assistant.post-draft.v1';
export interface PostDraft {version:2;title:string;body:string;images:PostImage[];writing:{purpose:number;instructions:string;includeImage:boolean};missingMedia?:number;}
const copy=<T>(value:T):T=>JSON.parse(JSON.stringify(value));
function checked(value:any):PostDraft {
  if(!value||value.version!==2||typeof value.title!=='string'||typeof value.body!=='string'||!Array.isArray(value.images))throw new Error('帖子草稿无法读取，原有资料未覆盖。');
  const images=value.images.map(cleanPostImage);checkPostImages(images);
  return {...copy(value),images};
}
export function readPostDraft():PostDraft|null {
  const recovery=wx.getStorageSync(POST_RECOVERY_KEY),current=wx.getStorageSync(POST_DRAFT_KEY);
  if(current&&recovery&&current.saveId===recovery.saveId)return checked(current);
  if(recovery)return checked(recovery);if(current)return checked(current);
  const old=wx.getStorageSync(LEGACY);if(!old)return null;
  if(typeof old.title!=='string'||typeof old.body!=='string'||typeof old.image!=='string')throw new Error('旧帖子草稿无法读取，原有资料未覆盖。');
  const image=old.image?postImage(old.image):null;if(image)image.manualCamera=old.manualCamera||{};
  return {version:2,title:old.title,body:old.body,images:image?[image]:[],writing:old.writing||{purpose:1,instructions:'',includeImage:false}};
}
function prefix(){return wx.env.USER_DATA_PATH+'/bird-post-draft/';}
function removeOwned(paths:string[]) {
  const root=wx.env?.USER_DATA_PATH;if(!root)return;
  const dir=root+'/bird-post-draft/';
  const owned=[...new Set(paths)].filter(path=>path.startsWith(dir)&&/^[a-z0-9-]+\.(?:jpe?g|png|webp)$/i.test(path.slice(dir.length)));
  if(!owned.length)return;const fs=wx.getFileSystemManager();
  for(const path of owned)try{fs.unlinkSync(path);}catch{/* A locked file can be reclaimed on a later save. */}
}
/** Keep originals intact. Commit the manifest only after every copy succeeds. */
export async function savePostDraft(input:PostDraft):Promise<PostDraft> {
  const value={...checked(input),saveId:Date.now().toString(36)+'-'+Math.random().toString(36).slice(2)};
  // This is an explicit text recovery, never a claim that temporary photos are durable.
  const recovery={...copy(value),images:value.images.map(item=>({...item,path:''})),missingMedia:value.images.length};
  wx.setStorageSync(POST_RECOVERY_KEY,recovery);
  const previousRaw=wx.getStorageSync(POST_DRAFT_KEY),previous=previousRaw?checked(previousRaw):null;
  const created:string[]=[];
  try{
    if(value.images.some(image=>!image.path.startsWith('/assets/'))){
    const fs=wx.getFileSystemManager(),dir=prefix();
    try{fs.mkdirSync(dir,true);}catch(error){try{fs.accessSync(dir);}catch{throw error;}}
    const references=new Set(previous?.images.map(item=>item.path)||[]);
    try{removeOwned(fs.readdirSync(dir).map(name=>dir+name).filter(path=>!references.has(path)));}catch{}
    for(const image of value.images){
      if(!image.path)throw new Error('有照片尚未保留，请重新添加后保存；文字已保存在本机。');
      if(image.path.startsWith('/assets/'))continue;
      fs.accessSync(image.path);
      if(image.path.startsWith(dir))continue;
      const existing=previous?.images.find(item=>item.id===image.id&&item.path===image.path);
      if(existing)continue;
      const suffix=/\.(jpe?g|png|webp)$/i.exec(image.path)?.[1]?.toLowerCase()||'jpg';
      const target=dir+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10)+'.'+suffix;
      created.push(target);
      await new Promise<void>((resolve,reject)=>fs.copyFile({srcPath:image.path,destPath:target,success:()=>resolve(),fail:reject}));
      image.path=target;
    }
    }
    wx.setStorageSync(POST_DRAFT_KEY,value);
  }catch(error){removeOwned(created);throw new Error('照片草稿未保存，文字与参数已保存在本机。请检查小程序可用空间后重试；已有完整草稿未覆盖。');}
  try{wx.removeStorageSync(POST_RECOVERY_KEY);}catch{}
  removeOwned((previous?.images||[]).map(item=>item.path).filter(path=>!value.images.some(item=>item.path===path)));
  return value;
}
