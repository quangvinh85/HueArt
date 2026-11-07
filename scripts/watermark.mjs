import sharp from 'sharp';
export async function preview(bytes,width){
 const base=await sharp(bytes,{limitInputPixels:80000000}).rotate().resize({width,height:width,fit:'inside',withoutEnlargement:true}).jpeg({quality:72}).toBuffer();
 const info=await sharp(base).metadata(),w=info.width,h=info.height,font=Math.max(5,Math.min(12,w*.022));
 const text='© NHIẾP ẢNH NGHỆ THUẬT HUẾ';
 const labels=[.25,.75].flatMap(x=>[.25,.75].map(y=>`<text x="${w*x}" y="${h*y}" text-anchor="middle" font-family="DejaVu Sans, sans-serif" font-size="${font}" fill="white" fill-opacity=".42" stroke="black" stroke-opacity=".3" stroke-width=".3" transform="rotate(-25 ${w*x} ${h*y})">${text}</text>`)).join('');
 return sharp(base).composite([{input:Buffer.from(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">${labels}</svg>`)}]).jpeg({quality:72}).toBuffer();
}
