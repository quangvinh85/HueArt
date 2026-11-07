export const PREVIEW_WIDTHS=[160,480,960] as const;
export interface PreparedImage {display:string;files:Record<number,File>}
export async function prepareImage(file:File):Promise<PreparedImage>{
 const data=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(new Error('Không đọc được ảnh. Vui lòng chọn lại ảnh JPG, PNG hoặc WebP.'));reader.readAsDataURL(file);});
 const image=await new Promise<HTMLImageElement>((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('Không đọc được ảnh. Vui lòng chọn lại ảnh JPG, PNG hoặc WebP.'));img.src=data;});
 if(!image.naturalWidth||!image.naturalHeight||image.naturalWidth*image.naturalHeight>80000000)throw new Error('Ảnh quá lớn hoặc không hợp lệ.');
 const files:Record<number,File>={};let display='';
 for(const size of PREVIEW_WIDTHS){
  const scale=Math.min(1,size/Math.max(image.naturalWidth,image.naturalHeight)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
  const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Không tạo được ảnh xem trước.');
  ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0,canvas.width,canvas.height);
  const font=Math.max(5,Math.min(12,canvas.width*.022));ctx.font=`600 ${font}px sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='rgba(255,255,255,.45)';ctx.shadowColor='rgba(0,0,0,.65)';ctx.shadowBlur=2;
  for(const x of [.25,.75])for(const y of [.25,.75]){ctx.save();ctx.translate(canvas.width*x,canvas.height*y);ctx.rotate(-25*Math.PI/180);ctx.fillText('© NHIẾP ẢNH NGHỆ THUẬT HUẾ',0,0);ctx.restore();}
  const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(new Error('Không tạo được ảnh xem trước.')),'image/jpeg',.72));
  files[size]=new File([blob],`preview-${size}.jpg`,{type:'image/jpeg'});if(size===960)display=canvas.toDataURL('image/jpeg',.72);canvas.width=canvas.height=1;
 }
 return {display,files};
}
