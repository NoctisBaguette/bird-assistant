import {downloadMemberCover,imageUrl} from './community';

export const profileThemes = [{id:'forest',name:'苔绿'},{id:'lake',name:'湖蓝'},{id:'sunset',name:'暮霞'}];
export const profileTags = ['湿地观鸟','林间漫步','城市观鸟','鸟类摄影','手帐记录','观鸟新手'];
export const profileStatuses = ['', '正在观鸟', '整理手帐', '等待鉴定'];
export interface Layout {
  theme:string; landscape:string; focus:number; cover:string|null; coverPhoto?:string|null; works:string[]; tags:string[]; status:string;
}
export interface Work {id:string; title:string; image?:string; date?:string; speciesName?:string; speciesId?:string}
export interface Presentation {layout:Layout; coverImage:string; items:Work[]; coverNotice?:string}
export function freshLayout():Layout {
  return {theme:'forest',landscape:'woodland',focus:25,cover:null,works:[],tags:[],status:''};
}
export function present(raw?:Partial<Presentation>):Presentation {
  return {layout:{...freshLayout(),...raw?.layout},coverImage:imageUrl(raw?.coverImage),
    items:(raw?.items || []).map(item=>({...item,image:imageUrl(item.image)}))};
}
export async function loadPresentation(member:string,raw?:Partial<Presentation>):Promise<Presentation>{
  const display=present(raw);
  if(display.layout.coverPhoto){
    try{display.coverImage=await downloadMemberCover(member,display.layout.coverPhoto);}
    catch{display.coverNotice='封面照片暂时无法加载';}
  }
  return display;
}
export function previewLayout(layout:Layout, catalogue:Work[],albumPhoto=''):Presentation {
  const lookup = new Map(catalogue.map(item=>[item.id,item]));
  return {layout,items:layout.works.map(id=>lookup.get(id)).filter((item):item is Work=>!!item),
    coverImage:albumPhoto || lookup.get(layout.cover || '')?.image || ''};
}
