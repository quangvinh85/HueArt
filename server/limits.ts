import {ApiError} from './orders';
import originals from './originals-manifest.json';
export async function readBoundedBytes(request:Request,maxBytes:number){
 if(Number(request.headers.get('Content-Length'))>maxBytes)throw new ApiError(413,'Dữ liệu gửi lên quá lớn.');if(!request.body)return new Uint8Array();const reader=request.body.getReader(),parts:Uint8Array[]=[];let length=0;
 try{while(true){const {done,value}=await reader.read();if(done)break;length+=value.byteLength;if(length>maxBytes){await reader.cancel();throw new ApiError(413,'Dữ liệu gửi lên quá lớn.');}parts.push(value);}}finally{reader.releaseLock();}
 const bytes=new Uint8Array(length);let offset=0;for(const part of parts){bytes.set(part,offset);offset+=part.length;}return bytes;
}
export async function limitRequest(env:any,key:string,limit:number,windowSeconds:number){
 const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode((env.VERCEL_BRIDGE_TOKEN||'local')+':rate:'+key)))).map(b=>b.toString(16).padStart(2,'0')).join(''),now=Math.floor(Date.now()/1000),cutoff=now-windowSeconds;
 const row=await env.DB.prepare('INSERT INTO request_limits (request_key, attempts, window_started) VALUES (?, 1, ?) ON CONFLICT(request_key) DO UPDATE SET attempts=CASE WHEN window_started<=? THEN 1 ELSE attempts+1 END, window_started=CASE WHEN window_started<=? THEN ? ELSE window_started END RETURNING attempts').bind(digest,now,cutoff,cutoff,now).first();
 if(Number(row.attempts)>limit)throw new ApiError(429,'Bạn đã gửi nhiều yêu cầu. Vui lòng thử lại sau.');
}
export async function reserveMedia(env:any,id:string,bytes:number){
 const configured=Number(env.MAX_MEDIA_STORAGE_MB),budget=(Number.isFinite(configured)&&configured>=32&&configured<=100000?configured:2048)*1048576,base=originals.reduce((sum,item)=>sum+item.size,0);
 const result=await env.DB.prepare('INSERT INTO media_upload_reservations (id, bytes, created_at) SELECT ?, ?, ? WHERE ? + COALESCE((SELECT SUM(CASE WHEN stored_bytes>0 THEN stored_bytes ELSE 10485760 END) FROM artwork_submissions),0) + COALESCE((SELECT SUM(bytes) FROM media_upload_reservations),0) + ? <= ?').bind(id,bytes,new Date().toISOString(),base,bytes,budget).run();
 if(!result.meta.changes)throw new ApiError(503,'Kho ảnh đã đạt hạn mức. Vui lòng liên hệ admin.');
}
export const releaseMedia=(env:any,id:string)=>env.DB.prepare('DELETE FROM media_upload_reservations WHERE id = ?').bind(id).run();
