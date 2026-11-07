import {createHash} from 'node:crypto';
import originals from '../server/originals-manifest.json' with {type:'json'};
import {preview} from './watermark.mjs';
const token=process.env.HUEART_MEDIA_MIGRATION_TOKEN;
if(token){
 const backend=process.env.HUEART_BACKEND_URL,service=process.env.HUEART_BACKEND_SERVICE_TOKEN;
 if(backend!=='https://hueart-preview-qv85.glazedvine2.chatgpt.site'||!service||!/^[0-9a-f]{64}$/.test(token))throw new Error('Media migration configuration is invalid');
 const call=async(path,method='GET',body)=>{
  const response=await fetch(backend+path,{method,body,redirect:'error',headers:{Authorization:'Bearer '+token,'OAI-Sites-Authorization':'Bearer '+service,Origin:backend},signal:AbortSignal.timeout(90000)});
  if(!response.ok)throw new Error('Private media migration failed with status '+response.status);return response;
 };
 console.log('Starting owner-authorized private media migration.');
 const chunkSize=2*1024*1024;
 for(const asset of originals){
  const source=await fetch('https://raw.githubusercontent.com/quangvinh85/HueArt/b04e707bf47cc1f90f35594be4317932527a1630/public/images/hue/'+asset.filename,{redirect:'error',signal:AbortSignal.timeout(60000)});
  if(!source.ok)throw new Error('Original backup source unavailable');const bytes=Buffer.from(await source.arrayBuffer());
  if(bytes.length!==asset.size||createHash('sha256').update(bytes).digest('hex')!==asset.sha256)throw new Error('Original source checksum mismatch');
  for(let part=0;part<Math.ceil(bytes.length/chunkSize);part++)await call(`/api/internal/media-import/${asset.id}/${part}`,'POST',bytes.subarray(part*chunkSize,(part+1)*chunkSize));
  await call(`/api/internal/media-import/${asset.id}/complete`,'POST');
 }
 console.log('Verified and stored '+originals.length+' original catalogue files privately.');
 const {items}=await (await call('/api/internal/media-list')).json();let converted=0;
 for(const item of items){
  if(item.preview_version>=2)continue;
  const original=Buffer.from(await (await call('/api/internal/media-original/'+item.id)).arrayBuffer()),form=new FormData();
  for(const width of [160,480,960])form.append('preview'+width,new Blob([await preview(original,width)],{type:'image/jpeg'}),'preview.jpg');
  await call('/api/internal/media-previews/'+item.id,'POST',form);converted++;
 }
 const verified=await (await call('/api/internal/media-list')).json();if(!verified.originalsVerified||verified.items.some(item=>item.preview_version<2))throw new Error('Private media verification incomplete');
 console.log('Private media migration complete. Generated safe previews for '+converted+' existing submissions.');
}
