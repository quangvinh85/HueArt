const fs=require('node:fs/promises');
const path=require('node:path');
const os=require('node:os');
const {createRequire}=require('node:module');
const {pathToFileURL}=require('node:url');
const {pipeline,finished}=require('node:stream/promises');
const {Readable,Writable}=require('node:stream');
const {createWriteStream}=require('node:fs');
const assert=require('node:assert/strict');

class CaptureResponse extends Writable{
 statusCode=200;headersSent=false;chunks=[];headers=new Map();
 setHeader(name,value){this.headers.set(name.toLowerCase(),value);}
 _write(chunk,encoding,done){this.headersSent=true;this.chunks.push(Buffer.from(chunk));done();}
}
(async()=>{
 const tools=path.resolve(process.argv[2]||'.');
 const load=createRequire(path.join(tools,'package.json'));
 const {build}=load('@vercel/node');const {FileFsRef}=load('@vercel/build-utils');
 const source=process.cwd();const temp=await fs.mkdtemp(path.join(os.tmpdir(),'hueart-vercel-'));
 const workPath=path.join(temp,'project'),out=path.join(temp,'artifact');
 const originalFetch=globalThis.fetch;
 const keys=['HUEART_BACKEND_URL','HUEART_BACKEND_SERVICE_TOKEN','HUEART_BACKEND_BRIDGE_TOKEN','HUEART_PUBLIC_HOSTS'];
 const saved=Object.fromEntries(keys.map(key=>[key,process.env[key]]));
 try{
  await fs.mkdir(workPath,{recursive:true});await fs.symlink(path.join(source,'node_modules'),path.join(workPath,'node_modules'),'dir');
  const files={};for(const name of ['api/backend.ts','api/tsconfig.json','server/vercelProxy.ts','server/securityHeaders.ts','package.json','tsconfig.json'])files[name]=new FileFsRef({fsPath:path.join(source,name)});
  const result=await build({files,entrypoint:'api/backend.ts',workPath,config:{functions:{'api/backend.ts':{installCommand:''}},projectSettings:{nodeVersion:'24.x'}},meta:{isDev:false}});
  assert.equal(result.output.runtime,'nodejs24.x');
  for(const[name,file]of Object.entries(result.output.files)){
   const target=path.resolve(out,name);assert.ok(target.startsWith(out+path.sep));
   await fs.mkdir(path.dirname(target),{recursive:true});await pipeline(file.toStream(),createWriteStream(target));
  }
  const {default:handler}=await import(pathToFileURL(path.join(out,'api/backend.js')).href);
  assert.equal(typeof handler,'function');
  Object.assign(process.env,{HUEART_BACKEND_URL:'https://backend.example',HUEART_BACKEND_SERVICE_TOKEN:'fixture-service-only',HUEART_BACKEND_BRIDGE_TOKEN:'cd'.repeat(32),HUEART_PUBLIC_HOSTS:''});
  globalThis.fetch=async(url,init)=>{assert.equal(new URL(url).pathname,'/api/session');assert.equal(init.headers.get('Authorization'),'Bearer '+'cd'.repeat(32));return Response.json({isAdmin:false,ownerAuthenticated:true});};
  const req=Readable.from([]);Object.assign(req,{method:'GET',url:'/api/backend?__hueart_route=session',headers:{host:'preview.example'}});
  const res=new CaptureResponse();await handler(req,res);await finished(res);
  assert.equal(res.statusCode,200);assert.equal(JSON.parse(Buffer.concat(res.chunks).toString()).ownerAuthenticated,true);
  console.log('Vercel native function build and runtime smoke test passed.');
 }finally{
  globalThis.fetch=originalFetch;
  for(const key of keys){if(saved[key]===undefined)delete process.env[key];else process.env[key]=saved[key];}
  await fs.rm(temp,{recursive:true,force:true});
 }
})().catch(error=>{console.error(error);process.exitCode=1;});
