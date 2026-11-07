import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import {pbkdf2Sync} from 'node:crypto';
import {Readable,Writable} from 'node:stream';
import {finished} from 'node:stream/promises';
import {proxyApi,MAX_VERCEL_BODY} from '../.work-tests/vercel-proxy.mjs';
import handler from '../.work-tests/vercel-handler.mjs';
import worker from '../.work-tests/vercel-worker.mjs';
const publicOrigin='https://hue-art2.vercel.app';
const config={backendUrl:'https://backend.example',serviceToken:'test-service-token',bridgeToken:'cd'.repeat(32)};
const password='fixture-password-only';
const salt='02'.repeat(24);
const passwordHash='pbkdf2-sha256$100000$'+salt+'$'+pbkdf2Sync(password,Buffer.from(salt,'hex'),100000,32,'sha256').toString('hex');
const makeRequest=(path,body,cookie)=>new Request(publicOrigin+path,{method:body?'POST':'GET',headers:{Origin:publicOrigin,'x-forwarded-for':'203.0.113.10',...(body?{'Content-Type':'application/json'}:{}),...(cookie?{Cookie:cookie}:{})},...(body?{body:JSON.stringify(body)}:{})});

test('Vercel proxy rejects missing configuration and cross-origin writes',async()=>{
 assert.equal((await proxyApi(makeRequest('/api/health'),{})).status,503);
 assert.equal((await proxyApi(new Request(publicOrigin+'/api/orders',{method:'POST',body:'{}'}),config)).status,403);
 assert.equal((await proxyApi(makeRequest('/api/private-unknown'),config)).status,404);
});

test('proxy supplies only server-side credentials and strips caller identity headers',async()=>{
 const request=new Request(publicOrigin+'/api/session',{headers:{Authorization:'attacker-token','oai-authenticated-user-id':'spoofed-owner',Cookie:'tracking=private; __Host-hueart_admin='+'ab'.repeat(32),'x-forwarded-for':'203.0.113.1'}});
 let sent=false;
 const result=await proxyApi(request,config,async(url,init)=>{
  sent=true;assert.equal(new URL(url).origin,config.backendUrl);
  assert.equal(init.headers.get('Authorization'),'Bearer '+config.bridgeToken);
  assert.equal(init.headers.get('OAI-Sites-Authorization'),'Bearer '+config.serviceToken);
  assert.equal(init.headers.get('oai-authenticated-user-id'),null);
  assert.equal(init.headers.get('Cookie'),'__Host-hueart_admin='+'ab'.repeat(32));
  assert.equal(init.headers.get('X-HueArt-Client-IP'),'203.0.113.1');
  return Response.json({isAdmin:false});
 });
 assert.equal(sent,true);assert.equal(result.status,200);
});

test('proxy rewrites mutation origin after validating the public origin and preserves session cookies',async()=>{
 const request=makeRequest('/api/admin-auth/login',{username:'test',password:'fixture-only'});
 const result=await proxyApi(request,config,async(url,init)=>{
  assert.equal(init.headers.get('Origin'),'https://backend.example');
  assert.equal(JSON.parse(new TextDecoder().decode(init.body)).username,'test');
  const response=Response.json({isAdmin:true});response.headers.append('Set-Cookie','__Host-hueart_admin='+'aa'.repeat(32)+'; Path=/; HttpOnly; Secure; SameSite=None; Partitioned');response.headers.append('Set-Cookie','unrelated_backend_cookie=do-not-forward; Path=/');return response;
 });
 assert.equal(result.headers.getSetCookie().length,1);assert.match(result.headers.get('Set-Cookie'),/HttpOnly/);assert.doesNotMatch(result.headers.get('Set-Cookie'),/unrelated_backend_cookie/);
});

test('proxy refuses redirects and oversize upload bodies without leaking credentials',async()=>{
 const redirected=await proxyApi(makeRequest('/api/session'),config,async()=>Response.redirect('https://other.example/',307));
 assert.equal(redirected.status,502);
 assert.doesNotMatch(await redirected.text(),new RegExp(config.bridgeToken));
 const large=new Request(publicOrigin+'/api/submissions',{method:'POST',headers:{Origin:publicOrigin,'Content-Type':'application/octet-stream'},body:new Uint8Array(MAX_VERCEL_BODY+1)});
 assert.equal((await proxyApi(large,config)).status,413);
});

test('Vercel can log in, manage orders and log out without Sites browser identity',async()=>{
 const sqlite=new DatabaseSync(':memory:');
 for(const file of readdirSync(new URL('../drizzle/',import.meta.url)).filter(file=>file.endsWith('.sql')).sort())sqlite.exec(readFileSync(new URL('../drizzle/'+file,import.meta.url),'utf8'));
 const env={ADMIN_EMAIL:'owner@example.com',ADMIN_USERNAME:'fixture-owner',ADMIN_PASSWORD_HASH:passwordHash,VERCEL_BRIDGE_TOKEN:config.bridgeToken,BUCKET:{},DB:{prepare(sql){const statement=sqlite.prepare(sql);let values=[];return{bind(...next){values=next;return this;},async first(){return statement.get(...values)||null;},async all(){return{results:statement.all(...values)};},async run(){return{meta:{changes:Number(statement.run(...values).changes)}};}};}}};
 const send=(url,init)=>worker.fetch(new Request(url,init),env);
 const proxy=(path,body,cookie)=>proxyApi(makeRequest(path,body,cookie),config,send);
 assert.equal((await proxy('/api/health')).status,200);
 const before=await(await proxy('/api/session')).json();assert.equal(before.ownerAuthenticated,true);assert.equal(before.isAdmin,false);
 assert.equal((await proxy('/api/admin/orders')).status,403);
 assert.equal((await proxy('/api/admin-auth/login',{username:'fixture-owner',password:'wrong'})).status,401);
 const login=await proxy('/api/admin-auth/login',{username:'fixture-owner',password});assert.equal(login.status,200);
 const cookie=login.headers.get('Set-Cookie').split(';')[0];
 assert.equal((await(await proxy('/api/session',null,cookie)).json()).isAdmin,true);
 const order=await proxy('/api/orders',{checkoutKey:crypto.randomUUID(),items:[{artworkId:'meridian-gate-twilight',optionId:'high-resolution',quantity:1}],customer:{name:'Khách Vercel',phone:'0901234567'},rightsAccepted:false});assert.equal(order.status,201);
 const orders=await(await proxy('/api/admin/orders',null,cookie)).json();assert.equal(orders.total,1);assert.equal(orders.orders[0].customer.name,'Khách Vercel');
 const library=await(await proxy('/api/admin/catalog',null,cookie)).json();assert.equal(library.stats.visible,12);
 const mutation=new Request(publicOrigin+'/api/admin/catalog/meridian-gate-twilight',{method:'PATCH',headers:{Origin:publicOrigin,Cookie:cookie,'Content-Type':'application/json'},body:JSON.stringify({action:'trash',version:0})});
 assert.equal((await proxyApi(mutation,config,send)).status,200);
 assert.equal((await(await proxy('/api/catalog')).json()).artworks.some(a=>a.id==='meridian-gate-twilight'),false);
 const advice=await(await proxy('/api/curator',{query:'A royal photograph',language:'en'})).json();assert.ok(advice.recommendations);assert.equal(advice.recommendations.some(a=>a.artworkId==='meridian-gate-twilight'),false);
 assert.equal((await proxy('/api/admin-auth/logout',{},cookie)).status,200);
 assert.equal((await proxy('/api/admin/orders',null,cookie)).status,403);
});

class CaptureResponse extends Writable{
 statusCode=200;headersSent=false;headers=new Map();chunks=[];
 setHeader(name,value){this.headers.set(name.toLowerCase(),value);}
 _write(chunk,encoding,done){this.headersSent=true;this.chunks.push(Buffer.from(chunk));done();}
 get text(){return Buffer.concat(this.chunks).toString('utf8');}
}

test('Vercel Node handler handles parsed JSON and streams the backend response',async()=>{
 const saved={};for(const key of ['VERCEL_URL','HUEART_BACKEND_URL','HUEART_BACKEND_SERVICE_TOKEN','HUEART_BACKEND_BRIDGE_TOKEN'])saved[key]=process.env[key];
 Object.assign(process.env,{VERCEL_URL:'hue-art2.vercel.app',HUEART_BACKEND_URL:config.backendUrl,HUEART_BACKEND_SERVICE_TOKEN:config.serviceToken,HUEART_BACKEND_BRIDGE_TOKEN:config.bridgeToken});
 const originalFetch=globalThis.fetch;
 try{
  globalThis.fetch=async(url,init)=>{assert.equal(new URL(url).pathname,'/api/admin-auth/login');assert.equal(JSON.parse(new TextDecoder().decode(init.body)).username,'fixture-owner');return Response.json({isAdmin:true});};
  const req=Readable.from([]);Object.assign(req,{method:'POST',url:'/api/backend?__hueart_route=admin-auth%2Flogin',headers:{host:'hue-art2.vercel.app',origin:publicOrigin,'content-type':'application/json'},body:{username:'fixture-owner',password:'fixture-only'}});
  const res=new CaptureResponse();await handler(req,res);await finished(res);
  assert.equal(res.statusCode,200);assert.equal(JSON.parse(res.text).isAdmin,true);
 }finally{globalThis.fetch=originalFetch;for(const [key,value]of Object.entries(saved)){if(value===undefined)delete process.env[key];else process.env[key]=value;}}
});
