import sharp from 'sharp';
import {mkdir,readdir,stat} from 'node:fs/promises';
import path from 'node:path';
const source='public/images/hue',output='public/images/previews';
await mkdir(output,{recursive:true});
let originalBytes=0,cardBytes=0;
for(const file of await readdir(source)){
 if(!/\.jpe?g$/i.test(file))continue;
 const input=path.join(source,file),info=await stat(input),name=file.replace(/\.jpe?g$/i,'');
 originalBytes+=info.size;
 for(const width of [160,480,960,1440]){
  const target=path.join(output,`${name}-${width}.webp`);
  let previous;try{previous=await stat(target)}catch{}
  if(!previous||previous.mtimeMs<info.mtimeMs)await sharp(input,{limitInputPixels:80000000}).rotate().resize({width,withoutEnlargement:true}).webp({quality:74,effort:4}).toFile(target);
  if(width===480)cardBytes+=(await stat(target)).size;
 }
}
console.log(`Image previews: ${(originalBytes/1048576).toFixed(1)} MB originals → ${(cardBytes/1048576).toFixed(2)} MB for all 480px cards.`);
