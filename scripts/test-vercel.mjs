import {build} from 'esbuild';
import {execFileSync} from 'node:child_process';
await build({entryPoints:['server/worker.ts'],outfile:'.work-tests/vercel-worker.mjs',bundle:true,platform:'node',format:'esm'});
await build({entryPoints:['server/vercelProxy.ts'],outfile:'.work-tests/vercel-proxy.mjs',bundle:true,platform:'node',format:'esm'});
await build({entryPoints:['api/backend.ts'],outfile:'.work-tests/vercel-handler.mjs',bundle:true,platform:'node',format:'esm'});
execFileSync(process.execPath,['tests/vercel-proxy.test.mjs'],{stdio:'inherit'});
