import {ApiError} from './orders';
import {hashToken,verifyPassword,cookieToken} from './adminAuth';
import {limitRequest} from './limits';
type Security={enabled:boolean;epoch:number;version:number;secret?:any;pending?:any;pendingUntil?:number;lastCounter?:number;recovery?:string[]};
export async function getAdminSecurity(env:any):Promise<Security>{const row=await env.DB.prepare("SELECT value_json,version FROM shop_settings WHERE key='admin_security'").first();return row?{...JSON.parse(row.value_json),version:row.version}:{enabled:false,epoch:0,version:0};}
async function save(env:any,state:Security){const {version,...value}=state;const result=await env.DB.prepare("INSERT INTO shop_settings (key,value_json,version,updated_at) VALUES ('admin_security',?,1,?) ON CONFLICT(key) DO UPDATE SET value_json=excluded.value_json,version=shop_settings.version+1,updated_at=excluded.updated_at WHERE shop_settings.version=?").bind(JSON.stringify(value),new Date().toISOString(),version).run();if(!result.meta.changes)throw new ApiError(409,'Cấu hình bảo mật đã thay đổi. Vui lòng thử lại.');}
const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
export function base32(bytes:Uint8Array){let value=0,bits=0,out='';for(const b of bytes){value=(value<<8)|b;bits+=8;while(bits>=5){bits-=5;out+=alphabet[(value>>>bits)&31];}}if(bits)out+=alphabet[(value<<(5-bits))&31];return out;}
function decode32(value:string){let bits=0,buffer=0;const bytes=[];for(const letter of value){const index=alphabet.indexOf(letter);if(index<0)throw new Error('Invalid secret');buffer=(buffer<<5)|index;bits+=5;if(bits>=8){bits-=8;bytes.push((buffer>>>bits)&255);}}return new Uint8Array(bytes);}
async function key(env:any){if(!env.VERCEL_BRIDGE_TOKEN)throw new ApiError(503,'Chưa có khóa bảo mật 2FA.');return crypto.subtle.importKey('raw',await crypto.subtle.digest('SHA-256',new TextEncoder().encode('hueart-totp-v1:'+env.VERCEL_BRIDGE_TOKEN)),'AES-GCM',false,['encrypt','decrypt']);}
async function encrypt(env:any,secret:string){const iv=crypto.getRandomValues(new Uint8Array(12)),bytes=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},await key(env),new TextEncoder().encode(secret)));return {iv:Array.from(iv),bytes:Array.from(bytes)};}
async function decrypt(env:any,value:any){return new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:new Uint8Array(value.iv)},await key(env),new Uint8Array(value.bytes)));}
export async function totp(secret:string,counter:number){const data=new Uint8Array(8);new DataView(data.buffer).setBigUint64(0,BigInt(counter));const material=await crypto.subtle.importKey('raw',decode32(secret),{name:'HMAC',hash:'SHA-1'},false,['sign']);const result=new Uint8Array(await crypto.subtle.sign('HMAC',material,data)),offset=result[19]&15,value=((result[offset]&127)<<24)|(result[offset+1]<<16)|(result[offset+2]<<8)|result[offset+3];return String(value%1000000).padStart(6,'0');}
async function counterFor(secret:string,code:string,last=-1){if(!/^\d{6}$/.test(code))return null;const now=Math.floor(Date.now()/30000);for(const counter of [now,now-1,now+1])if(counter>last&&await totp(secret,counter)===code)return counter;return null;}
export async function authenticateSecondFactor(env:any,value:unknown):Promise<number|null>{
 const state=await getAdminSecurity(env);if(!state.enabled)return state.epoch;
 await limitRequest(env,'admin-second-factor',30,900);
 const code=typeof value==='string'?value.trim().toLowerCase():'';let next:Security|null=null;
 if(/^\d{6}$/.test(code)){try{const counter=await counterFor(await decrypt(env,state.secret),code,state.lastCounter??-1);if(counter!==null)next={...state,lastCounter:counter};}catch{return null;}}
 else if(/^[a-f0-9]{4}(?:-[a-f0-9]{4}){3}$/.test(code)){const digest=await hashToken('hueart-recovery:'+code);if(state.recovery?.includes(digest))next={...state,recovery:state.recovery.filter(hash=>hash!==digest)};}
 if(!next)return null;try{await save(env,next);return state.epoch;}catch{return null;}
}
async function keepOnlyCurrentSession(request:Request,env:any,epoch:number){const hash=await hashToken(cookieToken(request));await env.DB.prepare('UPDATE admin_sessions SET security_epoch=? WHERE token_hash=?').bind(epoch,hash).run();await env.DB.prepare('DELETE FROM admin_sessions WHERE token_hash!=?').bind(hash).run();}
export async function adminSecurity(request:Request,env:any,data:any,actor:any){
 const path=new URL(request.url).pathname,state=await getAdminSecurity(env);
 if(request.method==='GET'&&path==='/api/admin/security')return {enabled:state.enabled,recoveryRemaining:state.recovery?.length||0};
 if(request.method!=='POST')throw new ApiError(405,'Phương thức không được hỗ trợ.');
 await limitRequest(env,'admin-security:'+actor.userId,12,900);
 if(typeof data.password!=='string'||data.password.length>256||!await verifyPassword(data.password,env.ADMIN_PASSWORD_HASH))throw new ApiError(401,'Mật khẩu hiện tại không đúng.');
 if(path.endsWith('/setup')){
  if(state.enabled)throw new ApiError(409,'2FA đã bật. Tắt 2FA trước khi đăng ký lại.');
  const secret=base32(crypto.getRandomValues(new Uint8Array(20)));await save(env,{...state,pending:await encrypt(env,secret),pendingUntil:Date.now()+600000});
  return {secret,otpauth:`otpauth://totp/${encodeURIComponent('HueArt:'+env.ADMIN_USERNAME)}?secret=${secret}&issuer=HueArt&algorithm=SHA1&digits=6&period=30`};
 }
 if(path.endsWith('/enable')){
  if(state.enabled||!state.pending||!state.pendingUntil||state.pendingUntil<Date.now())throw new ApiError(400,'Phiên đăng ký 2FA đã hết hạn. Vui lòng tạo lại.');
  const counter=await counterFor(await decrypt(env,state.pending),String(data.code||''));if(counter===null)throw new ApiError(400,'Mã xác thực không đúng.');
  const codes=Array.from({length:10},()=>Array.from(crypto.getRandomValues(new Uint8Array(8))).map(b=>b.toString(16).padStart(2,'0')).join('').match(/.{4}/g)!.join('-'));
  const epoch=state.epoch+1;await save(env,{enabled:true,epoch,version:state.version,secret:state.pending,lastCounter:counter,recovery:await Promise.all(codes.map(code=>hashToken('hueart-recovery:'+code)))});await keepOnlyCurrentSession(request,env,epoch);return {enabled:true,recoveryCodes:codes};
 }
 if(path.endsWith('/disable')){
  if(!state.enabled)throw new ApiError(400,'2FA chưa được bật.');
  if(await authenticateSecondFactor(env,data.code)===null)throw new ApiError(401,'Mã xác thực không đúng hoặc đã dùng.');
  const current=await getAdminSecurity(env),epoch=current.epoch+1;await save(env,{enabled:false,epoch,version:current.version});await keepOnlyCurrentSession(request,env,epoch);return {enabled:false};
 }
 throw new ApiError(404,'Không tìm thấy chức năng này.');
}
