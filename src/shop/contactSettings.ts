export interface ContactSettings {zaloEnabled:boolean;zaloPhone:string;messengerEnabled:boolean;messengerUrl:string;version:number}
export const defaultContactSettings:ContactSettings={zaloEnabled:false,zaloPhone:'',messengerEnabled:false,messengerUrl:'',version:0};
export function normalizeZaloPhone(value:string){
 let phone=value.trim().replace(/[\s().-]/g,'');
 if(phone.startsWith('+84'))phone='0'+phone.slice(3);
 else if(/^84\d{9}$/.test(phone))phone='0'+phone.slice(2);
 return /^0[35789]\d{8}$/.test(phone)?phone:'';
}
export function normalizeMessengerUrl(value:string){
 const raw=value.trim();if(!raw)return '';
 const identifier=/^[a-zA-Z0-9._-]{1,100}$/;
 if(identifier.test(raw))return 'https://m.me/'+raw;
 try{
  const url=new URL(/^https?:\/\//i.test(raw)?raw:'https://'+raw);
  if(url.protocol!=='https:'||url.username||url.password||url.port)return '';
  const host=url.hostname.toLowerCase().replace(/^www\./,'');let id='';
  if(host==='m.me')id=url.pathname.replace(/^\/|\/$/g,'');
  else if(['facebook.com','m.facebook.com','fb.com'].includes(host)){
   id=url.pathname==='/profile.php'?url.searchParams.get('id')||'':url.pathname.replace(/^\/|\/$/g,'');
  }else if(host==='messenger.com')id=/^\/t\/([^/]+)\/?$/.exec(url.pathname)?.[1]||'';
  return identifier.test(id)?'https://m.me/'+id:'';
 }catch{return '';}
}
export function contactLinks(settings:ContactSettings){
 const phone=normalizeZaloPhone(settings.zaloPhone),messenger=normalizeMessengerUrl(settings.messengerUrl);
 return {zalo:settings.zaloEnabled&&phone?'https://zalo.me/'+phone:'',messenger:settings.messengerEnabled?messenger:''};
}
