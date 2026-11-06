import {build} from 'esbuild';
import {execFileSync} from 'node:child_process';
await build({entryPoints:['tests/language-render.tsx'],outfile:'.work-tests/language-render.mjs',bundle:true,platform:'node',format:'esm',packages:'external',loader:{'.css':'empty'}});
execFileSync(process.execPath,['.work-tests/language-render.mjs'],{stdio:'inherit'});
