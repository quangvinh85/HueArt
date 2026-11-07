export type ImageView = 'thumb'|'card'|'detail'|'hero';
const presets={thumb:{widths:[160],sizes:'80px'},card:{widths:[480,960],sizes:'(max-width: 520px) 100vw, (max-width: 760px) 50vw, 33vw'},detail:{widths:[480,960,1440],sizes:'(max-width: 760px) 90vw, 640px'},hero:{widths:[480,960,1440],sizes:'100vw'}};
export function imagePreview(src:string,view:ImageView='card',vercel=import.meta.env?.VITE_VERCEL_BUILD==='true'){
 const preset=presets[view];
 const staticImage=/^\/images\/hue\/([a-z0-9-]+)\.jpg$/.exec(src);
 const publicUpload=/^\/api\/catalog\/[0-9a-f-]{36}\/image$/.test(src);
 const url=(width:number)=>staticImage?`/images/previews/${staticImage[1]}-${width}.webp`:`/_vercel/image?url=${encodeURIComponent(src)}&w=${width}&q=75`;
 if(!staticImage&&!(vercel&&publicUpload))return {src};
 const defaultWidth=view==='thumb'?160:view==='hero'?1440:view==='detail'?960:480;
 return {src:url(defaultWidth),srcSet:preset.widths.map(width=>`${url(width)} ${width}w`).join(', '),sizes:preset.sizes};
}
