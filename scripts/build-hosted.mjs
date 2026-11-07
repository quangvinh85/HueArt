import { build } from 'esbuild';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
await import('./optimize-images.mjs');
await rm('dist', { recursive: true, force: true });
execFileSync(process.execPath, ['node_modules/vite/bin/vite.js', 'build', '--outDir', 'dist/client'], { stdio: 'inherit' });
await mkdir('dist/server', { recursive: true });
await mkdir('dist/.openai', { recursive: true });
await build({ entryPoints: ['server/worker.ts'], outfile: 'dist/server/index.js', bundle: true, format: 'esm', platform: 'browser', target: 'es2022', minify: true, inject:['scripts/buffer-shim.ts'] });
const hosting = JSON.parse(await readFile('.openai/hosting.json', 'utf8'));
if (!hosting.project_id || !hosting.d1) throw new Error('Missing Site identity or database binding');
await writeFile('dist/.openai/hosting.json', JSON.stringify(hosting, null, 2));
await cp('drizzle', 'dist/drizzle', { recursive: true });
await writeFile('dist/server/wrangler.json', JSON.stringify({
  name: 'hueart-orders', main: 'index.js', compatibility_date: '2026-11-01',
  assets: { directory: '../client', binding: 'ASSETS', run_worker_first: true },
  ...(hosting.r2 ? { r2_buckets: [{ binding: hosting.r2, bucket_name: 'hueart-submissions' }] } : {}),
  d1_databases: [{ binding: 'DB', database_name: 'hueart-orders', database_id: '00000000-0000-0000-0000-000000000000', migrations_dir: '../drizzle' }],
}, null, 2));
console.log('Hosted artifact ready: dist/server/index.js + dist/client + D1 migrations.');
