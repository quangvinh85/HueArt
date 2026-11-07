import {ApiError} from './orders';
import originals from './originals-manifest.json';
export const PREVIEW_WIDTHS=[160,480,960];
export function jpegSize(bytes:Uint8Array){
 if(bytes[0]!==255||bytes[1]!==216)return null;
 for(let i=2;i+8<bytes.length;){if(bytes[i++]!==255)return null;while(bytes[i]===255)i++;const marker=bytes[i++];if(marker===217||marker===218)return null;if(marker===1||marker>=208&&marker<=215)continue;const length=(bytes[i]<<8)|bytes[i+1];if(length<2||i+length>bytes.length)return null;if([192,193,194].includes(marker))return {height:(bytes[i+3]<<8)|bytes[i+4],width:(bytes[i+5]<<8)|bytes[i+6]};i+=length;}return null;
}
export async function readPreviews(form:FormData){
 const previews:{width:number;bytes:Uint8Array}[]=[];
 const present=PREVIEW_WIDTHS.filter(w=>form.get('preview'+w));if(!present.length)return previews;
 if(present.length!==3)throw new ApiError(400,'Cần đủ ba ảnh xem trước.');
 for(const width of PREVIEW_WIDTHS){const file=form.get('preview'+width);if(!(file instanceof File)||file.size>524288||file.type!=='image/jpeg')throw new ApiError(400,'Ảnh xem trước không hợp lệ.');const bytes=new Uint8Array(await file.arrayBuffer()),info=jpegSize(bytes);if(!info||info.width<1||info.height<1||info.width>width||info.height>width)throw new ApiError(400,'Ảnh xem trước vượt giới hạn độ phân giải.');previews.push({width,bytes});}
 return previews;
}
export const previewKey=(id:string,width:number)=>`submissions/${id}/preview-v2/${width}.jpg`;
export async function putPreviews(env:any,id:string,previews:{width:number;bytes:Uint8Array}[]){for(const image of previews)await env.BUCKET.put(previewKey(id,image.width),image.bytes,{httpMetadata:{contentType:'image/jpeg'}});}
export async function adminOriginalAssets(request:Request,env:any,id:string,part:string){
 const asset=originals.find(item=>item.id===id);if(!asset)throw new ApiError(404,'Không tìm thấy tác phẩm.');
 if(request.method!=='POST')throw new ApiError(405,'Phương thức không được hỗ trợ.');
 const chunkSize=2*1024*1024,count=Math.ceil(asset.size/chunkSize),prefix=`original-import/${id}/${asset.sha256}`;
 if(part!=='complete'){
  const index=Number(part);if(!Number.isInteger(index)||index<0||index>=count)throw new ApiError(400,'Phần tệp không hợp lệ.');
  if(Number(request.headers.get('Content-Length'))>chunkSize)throw new ApiError(413,'Phần tệp quá lớn.');const bytes=new Uint8Array(await request.arrayBuffer());
  if(bytes.length!==Math.min(chunkSize,asset.size-index*chunkSize))throw new ApiError(400,'Dung lượng phần tệp không hợp lệ.');
  await env.BUCKET.put(`${prefix}/${index}`,bytes);return Response.json({ok:true});
 }
 const bytes=new Uint8Array(asset.size);
 for(let i=0;i<count;i++){const object=await env.BUCKET.get(`${prefix}/${i}`);if(!object)throw new ApiError(400,'Chưa đủ các phần của tệp.');const data=new Uint8Array(await object.arrayBuffer());if(data.length!==Math.min(chunkSize,asset.size-i*chunkSize))throw new ApiError(400,'Dung lượng phần tệp không hợp lệ.');bytes.set(data,i*chunkSize);}
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(b=>b.toString(16).padStart(2,'0')).join('');
 if(hash!==asset.sha256)throw new ApiError(400,'Dấu kiểm tra tệp gốc không khớp.');
 await env.BUCKET.put(`catalogue/originals/${id}`,bytes,{httpMetadata:{contentType:asset.contentType},customMetadata:{sha256:hash}});
 for(let i=0;i<count;i++)await env.BUCKET.delete(`${prefix}/${i}`);
 return Response.json({ok:true,sha256:hash});
}

export async function readMultipart(request:Request,maxBytes=10*1024*1024){
 if(!request.body)throw new ApiError(400,'Không có dữ liệu ảnh.');
 const reader=request.body.getReader(),parts:Uint8Array[]=[];let size=0;
 try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>maxBytes){await reader.cancel();throw new ApiError(413,'Dữ liệu ảnh quá lớn.');}parts.push(value);}}finally{reader.releaseLock();}
 const bytes=new Uint8Array(size);let offset=0;for(const part of parts){bytes.set(part,offset);offset+=part.length;}
 try{return await new Response(bytes,{headers:{'Content-Type':request.headers.get('Content-Type')||''}}).formData();}catch{throw new ApiError(400,'Dữ liệu ảnh không hợp lệ.');}
}
