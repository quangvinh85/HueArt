export type ImageView = 'thumb'|'card'|'detail'|'hero';
const presets={thumb:{widths:[160],sizes:'80px'},card:{widths:[480,960],sizes:'(max-width: 520px) 100vw, (max-width: 760px) 50vw, 33vw'},detail:{widths:[480,960],sizes:'(max-width: 760px) 90vw, 640px'},hero:{widths:[480,960],sizes:'100vw'}};
export function imagePreview(src:string,view:ImageView='card',_vercel?:boolean){
 const preset=presets[view],staticImage=/^\/images\/preview-v2\/([a-z0-9-]+)-(?:160|480|960)\.jpg$/.exec(src),upload=/^(\/api\/catalog\/[0-9a-f-]{36}\/preview)(?:\?.*)?$/.exec(src);
 if(!staticImage&&!upload)return {src};
 const url=(width:number)=>staticImage?`/images/preview-v2/${staticImage[1]}-${width}.jpg`:`${upload![1]}?w=${width}`;
 return {src:url(view==='thumb'?160:view==='card'?480:960),srcSet:preset.widths.map(width=>`${url(width)} ${width}w`).join(', '),sizes:preset.sizes};
}
