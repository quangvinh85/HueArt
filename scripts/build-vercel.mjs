await import('./migrate-private-media.mjs');
await import('./optimize-images.mjs');
import {execFileSync} from 'node:child_process';
execFileSync(process.execPath,['node_modules/vite/bin/vite.js','build'],{stdio:'inherit',env:{...process.env,VITE_VERCEL_BUILD:'true'}});
