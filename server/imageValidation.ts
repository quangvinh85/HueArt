import jpeg from 'jpeg-js';
import {ApiError} from './orders';
import sprite from './watermark-sprite.json';
import {jpegSize} from './media';
const bad=()=>new ApiError(400,'Nội dung ảnh không hợp lệ. Vui lòng chọn ảnh JPG, PNG hoặc WebP thật.');
const u32=(bytes:Uint8Array,offset:number)=>new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength).getUint32(offset);
export function validateOriginal(bytes:Uint8Array,type:string){
 let width=0,height=0;
 if(type==='image/jpeg'){const info=jpegSize(bytes);if(!info||bytes[bytes.length-2]!==255||bytes[bytes.length-1]!==217)throw bad();({width,height}=info);}
 else if(type==='image/png'){
  if(bytes.length<45||String.fromCharCode(...bytes.slice(12,16))!=='IHDR'||u32(bytes,8)!==13)throw bad();width=u32(bytes,16);height=u32(bytes,20);let data=false,end=false;
  for(let offset=8;offset+12<=bytes.length;){const length=u32(bytes,offset),tag=String.fromCharCode(...bytes.slice(offset+4,offset+8));if(length>bytes.length-offset-12)throw bad();if(tag==='IDAT')data=true;if(tag==='IEND'){if(length!==0||offset+12!==bytes.length)throw bad();end=true;break;}offset+=length+12;}
  if(!data||!end)throw bad();
 }else if(type==='image/webp'){
  const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);if(bytes.length<30||view.getUint32(4,true)+8!==bytes.length)throw bad();const tag=String.fromCharCode(...bytes.slice(12,16));
  if(tag==='VP8X'){if(bytes[20]&2)throw new ApiError(400,'Chỉ nhận ảnh tĩnh.');width=1+bytes[24]+(bytes[25]<<8)+(bytes[26]<<16);height=1+bytes[27]+(bytes[28]<<8)+(bytes[29]<<16);}
  else if(tag==='VP8L'){if(bytes[20]!==47)throw bad();const bits=view.getUint32(21,true);width=(bits&16383)+1;height=((bits>>>14)&16383)+1;}
  else if(tag==='VP8 '){if(bytes[23]!==157||bytes[24]!==1||bytes[25]!==42)throw bad();width=view.getUint16(26,true)&16383;height=view.getUint16(28,true)&16383;}else throw bad();
 }else throw bad();
 if(!width||!height||width>20000||height>20000||width*height>40000000)throw new ApiError(400,'Ảnh tối đa 40 megapixel và 20.000 pixel mỗi chiều.');
 return {width,height};
}
const alpha=new Uint8Array(sprite.width*sprite.height);let pointer=0;for(const [length,value] of sprite.runs){alpha.fill(value,pointer,pointer+length);pointer+=length;}
export function canonicalPreviews(bytes:Uint8Array){
 let decoded:{width:number;height:number;data:Uint8Array};
 try{decoded=jpeg.decode(bytes,{useTArray:true,formatAsRGBA:true,tolerantDecoding:false,maxResolutionInMP:1,maxMemoryUsageInMB:32});}catch{throw new ApiError(400,'Không giải mã được ảnh xem trước. Vui lòng chọn lại ảnh.');}
 if(decoded.width>960||decoded.height>960)throw bad();
 return [160,480,960].map(size=>{
  const scale=Math.min(1,size/Math.max(decoded.width,decoded.height)),width=Math.max(1,Math.round(decoded.width*scale)),height=Math.max(1,Math.round(decoded.height*scale)),data=new Uint8Array(width*height*4);
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){const from=(Math.min(decoded.height-1,Math.floor(y/scale))*decoded.width+Math.min(decoded.width-1,Math.floor(x/scale)))*4,to=(y*width+x)*4;data.set(decoded.data.subarray(from,from+4),to);}
  const markScale=Math.min(1,Math.max(.35,width/960)),mw=Math.round(sprite.width*markScale),mh=Math.round(sprite.height*markScale);
  for(const cx of [.25,.75])for(const cy of [.25,.75])for(let y=0;y<mh;y++)for(let x=0;x<mw;x++){
   const px=Math.round(width*cx-mw/2+x),py=Math.round(height*cy-mh/2+y);if(px<0||px>=width||py<0||py>=height)continue;const opacity=alpha[Math.min(sprite.height-1,Math.floor(y/markScale))*sprite.width+Math.min(sprite.width-1,Math.floor(x/markScale))]/255,offset=(py*width+px)*4;
   for(let channel=0;channel<3;channel++)data[offset+channel]=Math.round(data[offset+channel]*(1-opacity)+255*opacity);
  }
  return {width:size,bytes:new Uint8Array(jpeg.encode({width,height,data},68).data)};
 });
}
