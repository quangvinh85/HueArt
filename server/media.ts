import {readBoundedBytes} from './limits';
import {ApiError} from './orders';
import {canonicalPreviews} from './imageValidation';
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
 return canonicalPreviews(previews.find(image=>image.width===960)!.bytes);
}
export const previewKey=(id:string,width:number)=>`submissions/${id}/preview-v2/${width}.jpg`;
export async function putPreviews(env:any,id:string,previews:{width:number;bytes:Uint8Array}[]){for(const image of previews)await env.BUCKET.put(previewKey(id,image.width),image.bytes,{httpMetadata:{contentType:'image/jpeg'}});}
export async function readMultipart(request:Request,maxBytes=10*1024*1024){
 const bytes=await readBoundedBytes(request,maxBytes);
 try{return await new Response(bytes,{headers:{'Content-Type':request.headers.get('Content-Type')||''}}).formData();}catch{throw new ApiError(400,'Dữ liệu ảnh không hợp lệ.');}
}
