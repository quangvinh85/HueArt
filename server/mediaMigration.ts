import originals from './originals-manifest.json';
import {ApiError} from './orders';
import {adminOriginalAssets,readMultipart,readPreviews,putPreviews} from './media';
export async function mediaMigration(request:Request,env:any){
 const path=new URL(request.url).pathname,token=(request.headers.get('Authorization')||'').replace(/^Bearer /,'');
 if(!env.MEDIA_MIGRATION_TOKEN_HASH||!/^[0-9a-f]{64}$/.test(token)||!Number.isFinite(Number(env.MEDIA_MIGRATION_EXPIRES_AT))||Date.now()>Number(env.MEDIA_MIGRATION_EXPIRES_AT))throw new ApiError(404,'Không tìm thấy chức năng này.');
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token)))).map(b=>b.toString(16).padStart(2,'0')).join('');
 if(hash!==env.MEDIA_MIGRATION_TOKEN_HASH)throw new ApiError(404,'Không tìm thấy chức năng này.');
 const upload=/^\/api\/internal\/media-import\/([a-z0-9-]+)\/(complete|[0-9]+)$/.exec(path);
 if(upload)return adminOriginalAssets(request,env,upload[1],upload[2]);
 if(path==='/api/internal/media-list'&&request.method==='GET'){
  const rows=await env.DB.prepare('SELECT id, preview_version FROM artwork_submissions ORDER BY id LIMIT 1000').all();const checks=env.BUCKET.head?await Promise.all(originals.map(async item=>{const object=await env.BUCKET.head('catalogue/originals/'+item.id);return object?.size===item.size&&object?.customMetadata?.sha256===item.sha256;})):[];return Response.json({items:rows.results,originalsVerified:checks.length===originals.length&&checks.every(Boolean)});
 }
 const item=/^\/api\/internal\/media-(original|previews)\/([0-9a-f-]{36})$/.exec(path);if(!item)throw new ApiError(404,'Không tìm thấy chức năng này.');
 const row=await env.DB.prepare('SELECT object_key, content_type FROM artwork_submissions WHERE id = ?').bind(item[2]).first();if(!row)throw new ApiError(404,'Không tìm thấy tác phẩm.');
 if(item[1]==='original'&&request.method==='GET'){
  const object=await env.BUCKET.get(row.object_key);if(!object)throw new ApiError(404,'Không tìm thấy tệp.');return new Response(object.body,{headers:{'Content-Type':row.content_type,'Cache-Control':'private, no-store'}});
 }
 if(item[1]==='previews'&&request.method==='POST'){
  const previews=await readPreviews(await readMultipart(request,2*1024*1024));if(previews.length!==3)throw new ApiError(400,'Cần đủ ba ảnh xem trước.');await putPreviews(env,item[2],previews);await env.DB.prepare('UPDATE artwork_submissions SET preview_version = 2 WHERE id = ?').bind(item[2]).run();return Response.json({ok:true});
 }
 throw new ApiError(405,'Phương thức không được hỗ trợ.');
}
