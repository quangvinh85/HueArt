import {ApiError} from './orders';
import {PAYMENT_METHOD_LABELS} from '../src/shop/paymentTypes';
type Env={DB:any;VERCEL_BRIDGE_TOKEN?:string};
const textEncoder=new TextEncoder();
async function encryptionKey(env:Env){
 if(!env.VERCEL_BRIDGE_TOKEN)throw new ApiError(503,'Chưa có khóa bảo mật thông báo Zalo.');
 const digest=await crypto.subtle.digest('SHA-256',textEncoder.encode('hueart-zalo-notifications:'+env.VERCEL_BRIDGE_TOKEN));
 return crypto.subtle.importKey('raw',digest,'AES-GCM',false,['encrypt','decrypt']);
}
async function encrypt(env:Env,token:string){const iv=crypto.getRandomValues(new Uint8Array(12)),key=await encryptionKey(env);const bytes=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},key,textEncoder.encode(token)));return {iv:Array.from(iv),bytes:Array.from(bytes)};}
async function decrypt(env:Env,secret:any){return new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:new Uint8Array(secret.iv)},await encryptionKey(env),new Uint8Array(secret.bytes)));}
async function load(env:Env){const row=await env.DB.prepare("SELECT value_json,version FROM shop_settings WHERE key = 'zalo_notifications'").first();return row?{...JSON.parse(row.value_json),version:row.version}:{enabled:false,chatId:'',secret:null,version:0};}
function safe(settings:any){return {enabled:Boolean(settings.enabled),chatId:settings.chatId,tokenConfigured:Boolean(settings.secret),version:settings.version};}
async function botCall(token:string,method:'sendMessage'|'getUpdates',body:unknown){
 let response:Response;
 try{response=await fetch(`https://bot-api.zaloplatforms.com/bot${token}/${method}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),redirect:'error',signal:AbortSignal.timeout(7000)});}catch{throw new ApiError(502,'Chưa xác định Zalo đã nhận tin. Kiểm tra Zalo trước khi gửi lại để tránh trùng tin.');}
 let result:any;try{result=await response.json();}catch{throw new ApiError(502,'Zalo trả về phản hồi không hợp lệ.');}
 if(!response.ok||result?.ok!==true)throw new ApiError(502,'Zalo từ chối yêu cầu. Kiểm tra Bot Token, người nhận và quyền nhắn tin của bot.');
 return result.result;
}
export async function notificationSettings(request:Request,env:Env,body:any){
 const path=new URL(request.url).pathname,current=await load(env);
 if(request.method==='GET'&&path==='/api/admin/zalo-notifications'){
  const rows=await env.DB.prepare('SELECT n.order_id,n.status,n.last_error,n.sent_at,n.last_attempt_at,n.attempts,o.order_number FROM order_notifications n JOIN orders o ON o.id=n.order_id ORDER BY n.created_at DESC LIMIT 30').all();
  return {...safe(current),deliveries:rows.results};
 }
 if(path.endsWith('/recipient')&&request.method==='POST'){
  if(!current.secret)throw new ApiError(400,'Lưu Bot Token trước khi kết nối người nhận.');
  const event=await botCall(await decrypt(env,current.secret),'getUpdates',{timeout:'1'});
  const message=event?.message;
  if(!message?.chat?.id||message.chat.chat_type!=='PRIVATE'||message.from?.is_bot)throw new ApiError(400,'Chưa nhận được tin nhắn riêng. Hãy nhắn cho bot từ Zalo của admin rồi thử lại.');
  return {chatId:String(message.chat.id),name:String(message.from?.display_name||'')};
 }
 if(path.endsWith('/test')&&request.method==='POST'){
  if(!current.secret||!current.chatId)throw new ApiError(400,'Lưu Bot Token và người nhận trước khi gửi thử.');
  await botCall(await decrypt(env,current.secret),'sendMessage',{chat_id:current.chatId,text:'NHIẾP ẢNH NGHỆ THUẬT HUẾ: Kết nối thông báo đơn hàng thành công. Tài khoản này sẽ nhận chi tiết đơn hàng khi bật thông báo trong admin.'});return {ok:true};
 }
 if(request.method!=='PATCH'||path!=='/api/admin/zalo-notifications')throw new ApiError(405,'Phương thức không được hỗ trợ.');
 if(body?.version!==current.version)throw new ApiError(409,'Cài đặt đã thay đổi. Vui lòng tải lại.');
 if(typeof body.enabled!=='boolean'||typeof body.chatId!=='string'||body.chatId.length>150||body.chatId&&!/^[a-zA-Z0-9_.:-]+$/.test(body.chatId))throw new ApiError(400,'Cài đặt thông báo Zalo không hợp lệ.');
 if(body.token!==undefined&&(typeof body.token!=='string'||body.token&&!/^[a-zA-Z0-9_:-]{10,300}$/.test(body.token)))throw new ApiError(400,'Bot Token không hợp lệ.');
 const secret=body.token?await encrypt(env,body.token):current.secret;
 if(body.enabled&&(!secret||!body.chatId))throw new ApiError(400,'Cần Bot Token và người nhận trước khi bật thông báo.');
 const saved={enabled:body.enabled,chatId:body.chatId,secret};
 const result=await env.DB.prepare("INSERT INTO shop_settings (key,value_json,version,updated_at) VALUES ('zalo_notifications',?,1,?) ON CONFLICT(key) DO UPDATE SET value_json=excluded.value_json,version=shop_settings.version+1,updated_at=excluded.updated_at WHERE shop_settings.version=?").bind(JSON.stringify(saved),new Date().toISOString(),current.version).run();
 if(!result.meta.changes)throw new ApiError(409,'Cài đặt đã thay đổi. Vui lòng tải lại.');
 return safe({...saved,version:current.version+1});
}
export function orderMessage(order:any){
 const paymentStatuses:Record<string,string>={unpaid:'Chưa thanh toán',reported:'Khách báo đã thanh toán, chờ kiểm tra',partial:'Đã nhận một phần',paid:'Đã thanh toán'};
 const money=(cents:number)=>`${(cents/100).toLocaleString('vi-VN')} USD ~ ${Math.round(cents/100*order.exchange_rate).toLocaleString('vi-VN')} VND`;
 const items=JSON.parse(order.items_json);
 return [`ĐƠN HÀNG MỚI · ${order.order_number}`,`Thời gian: ${new Date(order.created_at).toLocaleString('vi-VN',{timeZone:'Asia/Ho_Chi_Minh'})}`,`Khách: ${order.customer_name}`,`Điện thoại: ${order.customer_phone}`,order.customer_email&&`Email: ${order.customer_email}`,order.customer_address&&`Địa chỉ: ${order.customer_address}`,'',...items.map((item:any,i:number)=>`${i+1}. ${item.title}\n${item.optionTitle} × ${item.quantity} · ${money(item.unitPriceCents*item.quantity)}`),'',`Tiền ảnh: ${money(order.subtotal_cents)}`,order.shipping_cents===null?'Vận chuyển: chờ báo phí':`Vận chuyển: ${money(order.shipping_cents)}`,`Tổng${order.shipping_cents===null?' tạm tính':''}: ${money(order.subtotal_cents+(order.shipping_cents||0))}`,`Thanh toán: ${PAYMENT_METHOD_LABELS[order.payment_method as keyof typeof PAYMENT_METHOD_LABELS]||order.payment_method}`,`Trạng thái: ${paymentStatuses[order.payment_status]||order.payment_status}`,order.customer_note&&`Ghi chú: ${order.customer_note}`,'Quản lý đơn: https://hue-art2.vercel.app/admin'].filter(line=>line!==false&&line!==null&&line!==undefined).join('\n');
}
function chunks(text:string){const result:string[]=[];let rest=text;while(rest.length>1800){let end=rest.lastIndexOf('\n',1800);if(end<900)end=1800;result.push(rest.slice(0,end));rest=rest.slice(end);}if(rest)result.push(rest);return result;}
export async function queueOrderNotification(env:Env,order:any){
 const settings=await load(env);
 await env.DB.prepare("INSERT OR IGNORE INTO order_notifications (order_id,status,created_at) VALUES (?,?,?)").bind(order.id,settings.enabled?'pending':'disabled',new Date().toISOString()).run();
}
export async function deliverOrderNotification(env:Env,orderId:string){
 const settings=await load(env);if(!settings.enabled||!settings.secret||!settings.chatId)return;
 const claim=await env.DB.prepare("UPDATE order_notifications SET status='sending',attempts=attempts+1,last_error='',last_attempt_at=? WHERE order_id=? AND status='pending'").bind(new Date().toISOString(),orderId).run();if(!claim.meta.changes)return;
 try{
  const order=await env.DB.prepare('SELECT * FROM orders WHERE id=?').bind(orderId).first();
  if(!order)throw new ApiError(404,'Không tìm thấy đơn hàng.');
  const row=await env.DB.prepare('SELECT next_chunk FROM order_notifications WHERE order_id=?').bind(orderId).first();
  const parts=chunks(orderMessage(order)),token=await decrypt(env,settings.secret);
  for(let i=Number(row.next_chunk);i<parts.length;i++){
   await botCall(token,'sendMessage',{chat_id:settings.chatId,text:parts.length>1?`[${i+1}/${parts.length}]\n${parts[i]}`:parts[i]});
   await env.DB.prepare('UPDATE order_notifications SET next_chunk=? WHERE order_id=?').bind(i+1,orderId).run();
  }
  await env.DB.prepare("UPDATE order_notifications SET status='sent',sent_at=?,last_error='' WHERE order_id=?").bind(new Date().toISOString(),orderId).run();
 }catch(error){
  const message=error instanceof ApiError?error.message:'Không gửi được thông báo Zalo. Vui lòng kiểm tra kết nối.';
  await env.DB.prepare("UPDATE order_notifications SET status='failed',last_error=? WHERE order_id=?").bind(message,orderId).run();
 }
}
export async function retryNotification(env:Env,orderId:string){
 const settings=await load(env);if(!settings.enabled)throw new ApiError(400,'Bật thông báo Zalo trước khi gửi lại.');
 const result=await env.DB.prepare("UPDATE order_notifications SET status='pending' WHERE order_id=? AND (status IN ('failed','disabled','pending') OR (status='sending' AND last_attempt_at<?))").bind(orderId,new Date(Date.now()-10*60000).toISOString()).run();
 if(!result.meta.changes)throw new ApiError(409,'Tin đã gửi hoặc đang được xử lý. Vui lòng tải lại.');
 await deliverOrderNotification(env,orderId);return {ok:true};
}
