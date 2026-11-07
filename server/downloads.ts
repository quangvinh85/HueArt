import {ApiError} from './orders';
import originals from './originals-manifest.json';
const encoder=new TextEncoder();
const b64=(bytes:Uint8Array)=>btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const unb64=(text:string)=>{const bytes=Uint8Array.from(atob(text.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));if(b64(bytes)!==text)throw new Error('Noncanonical token');return bytes;};
async function signingKey(env:any){if(!env.VERCEL_BRIDGE_TOKEN)throw new ApiError(503,'Chưa cấu hình tải file bảo mật.');return crypto.subtle.importKey('raw',encoder.encode('hueart-download-v1:'+env.VERCEL_BRIDGE_TOKEN),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);}
function allowed(order:any,item:any){return order&&order.payment_status==='paid'&&order.status!=='cancelled'&&item&&['high-resolution','copyright'].includes(item.optionId)&&(item.optionId!=='copyright'||Boolean(order.rights_confirmed));}
export async function customerDownloads(request:Request,env:any,orderNumber:string){
 if(request.method!=='GET')throw new ApiError(405,'Phương thức không được hỗ trợ.');
 const access=request.headers.get('X-HueArt-Checkout-Key')||'';
 if(!/^[0-9a-f-]{36}$/i.test(access))throw new ApiError(404,'Không tìm thấy đơn hàng.');
 const order=await env.DB.prepare('SELECT * FROM orders WHERE order_number = ? AND checkout_key = ?').bind(orderNumber,access).first();
 if(!order)throw new ApiError(404,'Không tìm thấy đơn hàng.');
 if(order.payment_status!=='paid'||order.status==='cancelled')throw new ApiError(403,'Chỉ tải được file sau khi admin xác nhận đã thanh toán.');
 const expires=Math.floor(Date.now()/1000)+600,files=[];
 for(const item of JSON.parse(order.items_json))if(allowed(order,item)){
  const payload=b64(encoder.encode(JSON.stringify({orderId:order.id,artworkId:item.artworkId,optionId:item.optionId,expires}))),signature=b64(new Uint8Array(await crypto.subtle.sign('HMAC',await signingKey(env),encoder.encode(payload))));
  files.push({title:item.title,optionId:item.optionId,url:`/api/downloads/${payload}.${signature}`});
 }
 return {files,expiresAt:new Date(expires*1000).toISOString()};
}
export async function downloadFile(request:Request,env:any,token:string){
 if(request.method!=='GET'||token.length>2000||!/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token))throw new ApiError(404,'Link tải không hợp lệ hoặc đã hết hạn.');
 let grant:any;
 try{const [payload,signature]=token.split('.');if(!await crypto.subtle.verify('HMAC',await signingKey(env),unb64(signature),encoder.encode(payload)))throw new Error();grant=JSON.parse(new TextDecoder().decode(unb64(payload)));if(!Number.isInteger(grant.expires)||grant.expires<=Math.floor(Date.now()/1000)||grant.expires>Math.floor(Date.now()/1000)+600||!/^[0-9a-f-]{36}$/i.test(grant.orderId))throw new Error();}catch{throw new ApiError(404,'Link tải không hợp lệ hoặc đã hết hạn.');}
 const order=await env.DB.prepare('SELECT * FROM orders WHERE id = ?').bind(grant.orderId).first();
 const item=order&&JSON.parse(order.items_json).find((entry:any)=>entry.artworkId===grant.artworkId&&entry.optionId===grant.optionId);
 if(!allowed(order,item))throw new ApiError(403,'Đơn hàng không còn quyền tải file này.');
 let key='',contentType='image/jpeg';
 const original=originals.find(entry=>entry.id===item.artworkId);
 if(original)key='catalogue/originals/'+original.id;
 else{
  const id=/^submission-([0-9a-f-]{36})$/.exec(item.artworkId)?.[1];if(!id)throw new ApiError(404,'Không tìm thấy tác phẩm.');
  const row=await env.DB.prepare('SELECT object_key,content_type FROM artwork_submissions WHERE id = ?').bind(id).first();if(!row)throw new ApiError(404,'Không tìm thấy tác phẩm.');key=row.object_key;contentType=row.content_type;
 }
 const object=await env.BUCKET?.get(key);if(!object)throw new ApiError(503,'File đang được chuẩn bị. Vui lòng thử lại hoặc liên hệ admin.');
 const extension=contentType==='image/png'?'.png':contentType==='image/webp'?'.webp':'.jpg';
 return new Response(object.body,{headers:{'Content-Type':contentType,'Content-Disposition':`attachment; filename="hue-artwork${extension}"; filename*=UTF-8''${encodeURIComponent(String(item.title).slice(0,120)+extension)}`,'Cache-Control':'private, no-store, max-age=0','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; frame-ancestors 'none'; sandbox"}});
}
