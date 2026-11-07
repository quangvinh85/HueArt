import {stat} from 'node:fs/promises';
import originals from '../server/originals-manifest.json' with {type:'json'};
for(const item of originals)for(const width of [160,480,960])await stat(`public/images/preview-v2/${item.filename.replace('.jpg','')}-${width}.jpg`);
console.log('Public image assets: watermarked previews only, maximum 960 pixels.');
