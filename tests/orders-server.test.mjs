import { pbkdf2Sync, createHash } from 'node:crypto';
import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import worker from '../dist/server/index.js';

const origin = 'https://shop.example';
const TEST_PASSWORD = 'test-password-only';
const TEST_SALT = '01'.repeat(24);
const TEST_HASH = 'pbkdf2-sha256$100000$'+TEST_SALT+'$'+pbkdf2Sync(TEST_PASSWORD, Buffer.from(TEST_SALT,'hex'),100000,32,'sha256').toString('hex');
const TEST_TOKEN = 'ab'.repeat(32);
const ownerIdentity = { 'oai-authenticated-user-id': 'site-owner-id', 'oai-authenticated-user-email': 'owner@example.com' };
const owner = {...ownerIdentity, Cookie:'__Host-hueart_admin='+TEST_TOKEN};
const artId = 'meridian-gate-twilight';
function fixture() {
  const sqlite = new DatabaseSync(':memory:');
  for (const file of readdirSync(new URL('../drizzle/', import.meta.url)).filter(file=>file.endsWith('.sql')).sort()) sqlite.exec(readFileSync(new URL('../drizzle/'+file, import.meta.url), 'utf8'));
  sqlite.prepare('INSERT INTO admin_sessions (token_hash,user_id,password_version,created_at,expires_at) VALUES (?,?,?,?,?)').run(createHash('sha256').update(TEST_TOKEN).digest('hex'),'site-owner-id',createHash('sha256').update(TEST_HASH).digest('hex'),Math.floor(Date.now()/1000),Math.floor(Date.now()/1000)+3600);
  const objects = new Map();
  const BUCKET = { async put(key,bytes) { objects.set(key, new Uint8Array(bytes)); }, async get(key) { return objects.has(key)?{body:objects.get(key)}:null; }, async delete(key) { objects.delete(key); } };
  const env = { ADMIN_USERNAME:'test-owner',ADMIN_PASSWORD_HASH:TEST_HASH, BUCKET, ADMIN_EMAIL: 'owner@example.com', DB: { prepare(sql) {
    const statement = sqlite.prepare(sql); let values = [];
    return { bind(...next) { values = next; return this; }, async first() { return statement.get(...values) || null; }, async all() { return { results: statement.all(...values) }; }, async run() { const result = statement.run(...values); return { meta: { changes: Number(result.changes) } }; } };
  } }, ASSETS: { async fetch() { return new Response('Storefront'); } } };
  const request = async (path, { method = 'GET', body, headers = {}, sameOrigin = true } = {}) => {
    const response = await worker.fetch(new Request(origin + path, { method, headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(sameOrigin ? { Origin: origin } : {}), ...headers }, ...(body ? { body: JSON.stringify(body) } : {}) }), env);
    return { status: response.status, headers:response.headers, data: response.headers.get('Content-Type')?.includes('application/json') ? await response.json() : await response.text() };
  };
  const payload = (overrides = {}) => ({ checkoutKey: crypto.randomUUID(), customer: { name: 'Nguyễn An', phone: '0901234567', email: '', address: '', note: '' }, items: [{ artworkId: artId, optionId: 'high-resolution', quantity: 1 }], rightsAccepted: false, ...overrides });
  return { sqlite, env, request, payload };
}

test('anonymous customer can place an order without email; server ignores forged prices', async () => {
  const f = fixture();
  const result = await f.request('/api/orders', { method: 'POST', body: f.payload({ items: [{ artworkId: artId, optionId: 'high-resolution', quantity: 1, unitPriceCents: 1 }], subtotalCents: 1 }) });
  assert.equal(result.status, 201);
  assert.equal(result.data.subtotalCents, 500);
  assert.equal(result.data.shippingCents, 0);
  assert.match(result.data.orderNumber, /^DHT-\d{8}-[0-9A-F]{8}$/);
  assert.equal(f.sqlite.prepare('SELECT COUNT(*) AS count FROM orders').get().count, 1);
  assert.equal(result.data.customer, undefined);
});

test('same checkout retry returns one receipt; changed data with same key is rejected', async () => {
  const f = fixture(); const body = f.payload();
  const first = await f.request('/api/orders', { method: 'POST', body });
  const second = await f.request('/api/orders', { method: 'POST', body });
  assert.equal(second.status, 200);
  assert.equal(first.data.orderNumber, second.data.orderNumber);
  assert.equal(f.sqlite.prepare('SELECT COUNT(*) AS count FROM orders').get().count, 1);
  const changed = await f.request('/api/orders', { method: 'POST', body: { ...body, customer: { ...body.customer, name: 'Another customer' } } });
  assert.equal(changed.status, 409);
});

test('order endpoints reject CSRF, invalid quantity, unknown artwork and missing phone', async () => {
  const f = fixture();
  assert.equal((await f.request('/api/orders', { method: 'POST', body: f.payload(), sameOrigin: false })).status, 403);
  assert.equal((await f.request('/api/orders', { method: 'POST', body: f.payload({ items: [{ artworkId: artId, optionId: 'copyright', quantity: 2 }] }) })).status, 400);
  assert.equal((await f.request('/api/orders', { method: 'POST', body: f.payload({ items: [{ artworkId: 'missing', optionId: 'high-resolution', quantity: 1 }] }) })).status, 400);
  assert.equal((await f.request('/api/orders', { method: 'POST', body: f.payload({ customer: { name: 'Nguyễn An' } }) })).status, 400);
});

test('framed print requires delivery address and shipping stays unquoted', async () => {
  const f = fixture(); const body = f.payload({ items: [{ artworkId: artId, optionId: 'framed-print', quantity: 2 }] });
  assert.equal((await f.request('/api/orders', { method: 'POST', body })).status, 400);
  body.customer.address = '273 Điện Biên Phủ, Huế';
  const result = await f.request('/api/orders', { method: 'POST', body });
  assert.equal(result.status, 201);
  assert.equal(result.data.subtotalCents, 1400);
  assert.equal(result.data.shippingCents, null);
});

test('copyright option requires explicit acknowledgement', async () => {
  const f = fixture(); const body = f.payload({ items: [{ artworkId: artId, optionId: 'copyright', quantity: 1 }] });
  assert.equal((await f.request('/api/orders', { method: 'POST', body })).status, 400);
  body.rightsAccepted = true;
  assert.equal((await f.request('/api/orders', { method: 'POST', body })).data.subtotalCents, 1000);
});

test('admin list and update reject anonymous and other signed-in accounts', async () => {
  const f = fixture();
  assert.equal((await f.request('/api/admin/orders')).status, 401);
  assert.equal((await f.request('/api/admin/orders', { headers: { ...owner, 'oai-authenticated-user-email': 'stranger@example.com' } })).status, 403);
  assert.equal((await f.request('/api/session', { headers: owner })).data.isAdmin, true);
  assert.equal((await f.request('/api/session')).data.isAdmin, false);
});

test('admin can search, quote shipping, update payment and status with audit and conflict protection', async () => {
  const f = fixture();
  await f.request('/api/orders', { method: 'POST', body: f.payload({ customer: { name: 'Khách Huế', phone: '0901234567', address: '273 Điện Biên Phủ, Huế' }, items: [{ artworkId: artId, optionId: 'framed-print', quantity: 2 }] }) });
  const list = await f.request('/api/admin/orders?q=090123&status=new', { headers: owner });
  assert.equal(list.status, 200); assert.equal(list.data.total, 1);
  let order = list.data.orders[0];
  assert.equal(order.totalCents, null);
  const body = { version: order.version, status: 'confirmed', paymentStatus: 'unpaid', shippingCents: 250, adminNote: 'Đã gọi khách' };
  const updated = await f.request(`/api/admin/orders/${order.id}`, { method: 'PATCH', headers: owner, body });
  assert.equal(updated.status, 200); assert.equal(updated.data.totalCents, 1650); assert.equal(updated.data.version, 2);
  assert.equal(updated.data.history.length, 2); assert.equal(updated.data.adminNote, 'Đã gọi khách');
  assert.equal((await f.request(`/api/admin/orders/${order.id}`, { method: 'PATCH', headers: owner, body })).status, 409);
  body.version = 2; body.status = 'completed';
  assert.equal((await f.request(`/api/admin/orders/${order.id}`, { method: 'PATCH', headers: owner, body })).status, 400);
  body.paymentStatus = 'paid';
  assert.equal((await f.request(`/api/admin/orders/${order.id}`, { method: 'PATCH', headers: owner, body })).status, 200);
  const final = await f.request('/api/admin/orders?payment=paid', { headers: owner });
  assert.equal(final.data.stats.paidCents, 1650);
  assert.equal(final.data.orders[0].status, 'completed');
});

test('rate limiting stops repeated new orders but permits idempotent retry', async () => {
  const f = fixture(); let firstBody; let firstReceipt;
  for (let index = 0; index < 10; index++) {
    const body = f.payload(); const result = await f.request('/api/orders', { method: 'POST', body });
    assert.equal(result.status, 201);
    if (index === 0) { firstBody = body; firstReceipt = result.data; }
  }
  assert.equal((await f.request('/api/orders', { method: 'POST', body: f.payload() })).status, 429);
  assert.equal((await f.request('/api/orders', { method: 'POST', body: firstBody })).data.orderNumber, firstReceipt.orderNumber);
});

test('admin route serves the app, and unknown API never falls back to HTML', async () => {
  const f = fixture();
  assert.equal((await f.request('/admin')).data, 'Storefront');
  assert.equal((await f.request('/api/missing')).status, 404);
});


test('admin keeps its URL when the asset service canonicalizes /index.html', async () => {
  const f = fixture();
  const fetchedPaths = [];
  f.env.ASSETS.fetch = async request => {
    const path = new URL(request.url).pathname;
    fetchedPaths.push(path);
    return path === '/index.html'
      ? Response.redirect(origin + '/', 307)
      : new Response('<div id="root"></div>', { headers: { 'Content-Type': 'text/html' } });
  };
  for (const path of ['/admin', '/admin/']) {
    const response = await worker.fetch(new Request(origin + path), f.env);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('Location'), null);
    assert.match(await response.text(), /id="root"/);
  }
  assert.deepEqual(fetchedPaths, ['/', '/']);
});

test('submission stores a private image once and permits admin review only', async () => {
  const f=fixture();
  const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jvhoAAAAASUVORK5CYII=','base64');
  const metadata={submissionKey:crypto.randomUUID(),title:'Huế trong tôi',titleEn:'My Hue',titleFr:'Mon Hué',authorName:'Tác giả An',authorPhone:'0901234567',authorEmail:'',collection:'imperial-echoes',rightsConfirmed:true,revenueTermsAccepted:true,revenueTermsVersion:'2026-11-07-v1'};
  const upload=async(bytes=png)=>{
    const form=new FormData();form.append('image',new File([bytes],'photo.png',{type:'image/png'}));form.append('metadata',JSON.stringify(metadata));
    return worker.fetch(new Request(origin+'/api/submissions',{method:'POST',headers:{Origin:origin},body:form}),f.env);
  };
  const response=await upload();assert.equal(response.status,201);const first=await response.json();assert.match(first.reference,/^DHT-ART-/);
  const retry=await upload();assert.equal(retry.status,200);assert.equal((await retry.json()).reference,first.reference);
  assert.equal(f.sqlite.prepare('SELECT COUNT(*) AS count FROM artwork_submissions').get().count,1);
  assert.equal((await f.request('/api/admin/submissions')).status,401);
  const listed=await f.request('/api/admin/submissions',{headers:owner});assert.equal(listed.status,200);assert.equal(listed.data.submissions[0].titleFr,'Mon Hué');
  const submission=listed.data.submissions[0];
  assert.equal((await f.request(submission.imageUrl)).status,401);
  const image=await worker.fetch(new Request(origin+submission.imageUrl,{headers:owner}),f.env);assert.equal(image.status,200);assert.equal(image.headers.get('Content-Type'),'image/png');
  assert.deepEqual(Buffer.from(await image.arrayBuffer()),png);
  const patch={method:'PATCH',headers:owner,body:{status:'reviewing',version:1,adminNote:'Đã xem ảnh'}};
  const updated=await f.request('/api/admin/submissions/'+submission.id,patch);assert.equal(updated.status,200);assert.equal(updated.data.status,'reviewing');
  assert.equal((await f.request('/api/admin/submissions/'+submission.id,patch)).status,409);
});

test('submission rejects disguised SVG, missing rights confirmation and cross-origin writes', async()=>{
  const f=fixture();
  const form=new FormData();form.append('image',new File(['<svg onload="alert(1)"></svg>'],'photo.png',{type:'image/png'}));form.append('metadata',JSON.stringify({submissionKey:crypto.randomUUID(),title:'Huế',authorName:'Tác giả',authorPhone:'0901234567',collection:'imperial-echoes',rightsConfirmed:true,revenueTermsAccepted:true,revenueTermsVersion:'2026-11-07-v1'}));
  assert.equal((await worker.fetch(new Request(origin+'/api/submissions',{method:'POST',headers:{Origin:origin},body:form}),f.env)).status,400);
  assert.equal((await worker.fetch(new Request(origin+'/api/submissions',{method:'POST',body:form}),f.env)).status,403);
  assert.equal(f.sqlite.prepare('SELECT COUNT(*) AS count FROM artwork_submissions').get().count,0);
});

test('curator recommendations are localized, use valid artwork IDs and current print size',async()=>{
  const f=fixture();
  for(const language of ['vi','en','fr']){
    const result=await f.request('/api/curator',{method:'POST',body:{language,query:'calm river, mist and water'}});
    assert.equal(result.status,200);assert.equal(result.data.mode,'catalog');assert.ok(result.data.recommendations.length>=2);
    assert.ok(result.data.recommendations.every(item=>item.recommendedSize==='40 × 60 cm'&&typeof item.artworkId==='string'));
    assert.match(result.data.curatorNote,language==='vi'?/mô tả/:language==='en'?/description/:/description/);
  }
});

test('AI provider results use known catalog IDs, remove duplicates and stay within current sizes',async()=>{
  const f=fixture();f.env.GEMINI_API_KEY='test-key-not-real';const originalFetch=globalThis.fetch;
  try{
    globalThis.fetch=async(url,init)=>{
      assert.equal(new URL(url).hostname,'generativelanguage.googleapis.com');
      assert.equal(init.headers['x-goog-api-key'],'test-key-not-real');
      return Response.json({candidates:[{content:{parts:[{text:JSON.stringify({curatorNote:'A tailored selection.',recommendations:[{artworkId:artId,reason:'Light and architecture',recommendedSize:'100 × 200 cm'},{artworkId:artId,reason:'Duplicate'},{artworkId:'invented-id',reason:'Invalid'}]})}]}}]});
    };
    const result=await f.request('/api/curator',{method:'POST',body:{language:'en',query:'A quiet imperial living room'}});
    assert.equal(result.data.mode,'ai');assert.equal(result.data.recommendations.length,1);
    assert.equal(result.data.recommendations[0].artworkId,artId);assert.equal(result.data.recommendations[0].recommendedSize,'40 × 60 cm');
  }finally{globalThis.fetch=originalFetch;}
});

test('AI provider failure transparently falls back to collection recommendations',async()=>{
  const f=fixture();f.env.GEMINI_API_KEY='test-key-not-real';const originalFetch=globalThis.fetch;
  try{
    globalThis.fetch=async()=>new Response('Unavailable',{status:503});
    const result=await f.request('/api/curator',{method:'POST',body:{language:'fr',query:'Une chambre calme'}});
    assert.equal(result.status,200);assert.equal(result.data.mode,'catalog');
    assert.ok(result.data.recommendations.length>=2);
  }finally{globalThis.fetch=originalFetch;}
});

test('owner identity alone cannot access management without the password session',async()=>{
  const f=fixture();
  const session=await f.request('/api/session',{headers:ownerIdentity});
  assert.equal(session.data.ownerAuthenticated,true);assert.equal(session.data.isAdmin,false);
  assert.equal((await f.request('/api/admin/orders',{headers:ownerIdentity})).status,403);
  assert.equal((await f.request('/api/admin/submissions',{headers:ownerIdentity})).status,403);
});

test('password login sets a private cookie; logout revokes the database session',async()=>{
  const f=fixture();
  const login=await f.request('/api/admin-auth/login',{method:'POST',headers:ownerIdentity,body:{username:'test-owner',password:TEST_PASSWORD}});
  assert.equal(login.status,200);
  const setCookie=login.headers.get('Set-Cookie');
  assert.match(setCookie,/HttpOnly/);assert.match(setCookie,/Secure/);assert.match(setCookie,/Partitioned/);assert.match(setCookie,/Max-Age=28800/);
  const cookie=setCookie.split(';')[0];const token=cookie.split('=')[1];
  const saved=f.sqlite.prepare('SELECT token_hash FROM admin_sessions WHERE token_hash=?').get(createHash('sha256').update(token).digest('hex'));
  assert.ok(saved);assert.notEqual(saved.token_hash,token);
  const headers={...ownerIdentity,Cookie:cookie};
  assert.equal((await f.request('/api/session',{headers})).data.isAdmin,true);
  assert.equal((await f.request('/api/admin/orders',{headers})).status,200);
  const logout=await f.request('/api/admin-auth/logout',{method:'POST',headers});
  assert.equal(logout.status,200);assert.match(logout.headers.get('Set-Cookie'),/Max-Age=0/);
  assert.equal((await f.request('/api/session',{headers})).data.isAdmin,false);
  assert.equal((await f.request('/api/admin/orders',{headers})).status,403);
});

test('wrong credentials are rejected and persistent attempt limits block repeated guessing',async()=>{
  const f=fixture();
  for(let index=0;index<5;index++){
    const result=await f.request('/api/admin-auth/login',{method:'POST',headers:ownerIdentity,body:{username:index%2?'wrong-user':'test-owner',password:'wrong-password'}});
    assert.equal(result.status,401);assert.equal(result.data.error,'Tên đăng nhập hoặc mật khẩu không đúng.');
  }
  const blocked=await f.request('/api/admin-auth/login',{method:'POST',headers:ownerIdentity,body:{username:'test-owner',password:TEST_PASSWORD}});
  assert.equal(blocked.status,429);
});

test('login rejects other accounts, anonymous users, cross-origin and forged cookies',async()=>{
  const f=fixture();const body={username:'test-owner',password:TEST_PASSWORD};
  assert.equal((await f.request('/api/admin-auth/login',{method:'POST',body})).status,401);
  assert.equal((await f.request('/api/admin-auth/login',{method:'POST',headers:{...ownerIdentity,'oai-authenticated-user-email':'stranger@example.com'},body})).status,403);
  assert.equal((await f.request('/api/admin-auth/login',{method:'POST',headers:ownerIdentity,body,sameOrigin:false})).status,403);
  assert.equal((await f.request('/api/session',{headers:{...ownerIdentity,Cookie:'__Host-hueart_admin='+'aa'.repeat(32)}})).data.isAdmin,false);
});

test('expired, rotated-password and unconfigured sessions fail closed',async()=>{
  const f=fixture();
  f.sqlite.prepare('UPDATE admin_sessions SET expires_at=0').run();
  assert.equal((await f.request('/api/session',{headers:owner})).data.isAdmin,false);
  f.sqlite.prepare('UPDATE admin_sessions SET expires_at=?').run(Math.floor(Date.now()/1000)+3600);
  f.env.ADMIN_PASSWORD_HASH=TEST_HASH+'changed';
  assert.equal((await f.request('/api/session',{headers:owner})).data.isAdmin,false);
  f.env.ADMIN_PASSWORD_HASH='';
  assert.equal((await f.request('/api/admin-auth/login',{method:'POST',headers:ownerIdentity,body:{username:'test-owner',password:TEST_PASSWORD}})).status,503);
});

test('accepting a submitted photo publishes it, enables all purchase options and withdrawal revokes access',async()=>{
  const f=fixture();
  const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jvhoAAAAASUVORK5CYII=','base64');
  const form=new FormData();
  form.append('image',new File([png],'new-art.png',{type:'image/png'}));
  form.append('metadata',JSON.stringify({submissionKey:crypto.randomUUID(),title:'Tác phẩm đã duyệt',titleEn:'Approved artwork',titleFr:'Œuvre acceptée',authorName:'Nguyễn An',authorPhone:'0901234567',authorEmail:'private@example.com',location:'Huế',story:'Câu chuyện tác phẩm',collection:'imperial-echoes',rightsConfirmed:true,revenueTermsAccepted:true,revenueTermsVersion:'2026-11-07-v1'}));
  const submitted=await worker.fetch(new Request(origin+'/api/submissions',{method:'POST',headers:{Origin:origin},body:form}),f.env);assert.equal(submitted.status,201);
  const id=f.sqlite.prepare('SELECT id FROM artwork_submissions').get().id;
  const artworkId='submission-'+id;
  assert.equal((await f.request('/api/catalog')).data.artworks.some(art=>art.id===artworkId),false);
  assert.equal((await f.request(`/api/catalog/${id}/image`)).status,404);
  const body=f.payload({items:[{artworkId,optionId:'high-resolution',quantity:1}]});
  assert.equal((await f.request('/api/orders',{method:'POST',body})).status,400);
  const accepted=await f.request('/api/admin/submissions/'+id,{method:'PATCH',headers:owner,body:{status:'accepted',version:1,adminNote:'Private admin note'}});assert.equal(accepted.status,200);
  const catalog=await f.request('/api/catalog');
  const art=catalog.data.artworks.find(art=>art.id===artworkId);
  assert.equal(art.titles.vi,'Tác phẩm đã duyệt');assert.equal(art.titles.en,'Approved artwork');assert.equal(art.titles.fr,'Œuvre acceptée');
  assert.equal(art.photographer,'Nguyễn An');assert.equal(art.imageUrl,`/api/catalog/${id}/image`);
  const library=(await f.request('/api/admin/catalog?q='+encodeURIComponent('Tác phẩm đã duyệt'),{headers:owner})).data;
  assert.equal(library.total,1);assert.equal(library.items[0].artwork.id,artworkId);
  const serialized=JSON.stringify(catalog.data);
  assert.doesNotMatch(serialized,/private@example.com|0901234567|Private admin note|object_key|password_hash/);
  const image=await worker.fetch(new Request(origin+art.imageUrl),f.env);assert.equal(image.status,200);assert.equal(image.headers.get('Cache-Control'),'no-store');
  assert.deepEqual(Buffer.from(await image.arrayBuffer()),png);
  const advice=await f.request('/api/curator',{method:'POST',body:{language:'en',query:'A photograph for my room'}});
  const recommendation=advice.data.recommendations.find(rec=>rec.artworkId===artworkId);
  assert.ok(recommendation);assert.equal(recommendation.artwork.titles.en,'Approved artwork');
  const ordered=await f.request('/api/orders',{method:'POST',body:f.payload({customer:{name:'Người mua',phone:'0907654321',address:'273 Điện Biên Phủ, Huế'},rightsAccepted:true,items:['copyright','high-resolution','framed-print'].map(optionId=>({artworkId,optionId,quantity:1,unitPriceCents:1}))})});
  assert.equal(ordered.status,201);assert.equal(ordered.data.subtotalCents,2200);assert.equal(ordered.data.shippingCents,null);
  const withdrawn=await f.request('/api/admin/submissions/'+id,{method:'PATCH',headers:owner,body:{status:'rejected',version:2,adminNote:'Withdrawn'}});assert.equal(withdrawn.status,200);
  assert.equal((await f.request('/api/catalog')).data.artworks.some(art=>art.id===artworkId),false);
  assert.equal((await f.request(`/api/catalog/${id}/image`)).status,404);
  assert.equal((await f.request('/api/orders',{method:'POST',body:f.payload({items:[{artworkId,optionId:'high-resolution',quantity:1}]})})).status,400);
  const saved=(await f.request('/api/admin/orders',{headers:owner})).data.orders[0];
  assert.equal(saved.items[0].title,'Tác phẩm đã duyệt');assert.equal(saved.items.length,3);
});

test('admin photo library lists every public artwork, paginates and rejects anonymous writes',async()=>{
 const f=fixture();
 assert.equal((await f.request('/api/admin/catalog')).status,401);
 const publicIds=(await f.request('/api/catalog')).data.artworks.map(a=>a.id).sort();
 const library=await f.request('/api/admin/catalog',{headers:owner});
 assert.equal(library.status,200);assert.equal(library.data.stats.visible,publicIds.length);assert.equal(library.data.items.length,12);
 const second=await f.request('/api/admin/catalog?page=2',{headers:owner});
 assert.deepEqual([...library.data.items,...second.data.items].map(i=>i.artwork.id).sort(),publicIds);
 assert.equal((await f.request('/api/admin/catalog/'+artId,{method:'PATCH',body:{action:'trash',version:0}})).status,401);
 assert.equal((await f.request('/api/admin/catalog/'+artId,{method:'PATCH',headers:owner,sameOrigin:false,body:{action:'trash',version:0}})).status,403);
 assert.equal((await f.request('/api/admin/catalog?state=invalid',{headers:owner})).status,400);
});

test('catalogue edits, visibility, trash and restore preserve order snapshots and reject stale updates',async()=>{
 const f=fixture();
 await f.request('/api/orders',{method:'POST',body:f.payload()});
 const old=(await f.request('/api/admin/orders',{headers:owner})).data.orders[0];
 const artwork=(await f.request('/api/catalog')).data.artworks.find(a=>a.id===artId);
 const patch={action:'save',version:0,hidden:false,titles:{vi:'Tên ảnh mới',en:'New title',fr:'Nouveau titre'},stories:artwork.stories,locations:artwork.locations,photographer:'New author',collection:artwork.collection};
 assert.equal((await f.request('/api/admin/catalog/'+artId,{method:'PATCH',headers:owner,body:{...patch,titles:{vi:''}}})).status,400);
 assert.equal((await f.request('/api/admin/catalog/'+artId,{method:'PATCH',headers:owner,body:patch})).status,200);
 assert.equal((await f.request('/api/catalog')).data.artworks.find(a=>a.id===artId).titles.en,'New title');
 assert.equal((await f.request('/api/admin/catalog/'+artId,{method:'PATCH',headers:owner,body:patch})).status,409);
 assert.equal((await f.request('/api/admin/orders',{headers:owner})).data.orders[0].items[0].title,old.items[0].title);
 patch.version=1;patch.hidden=true;
 assert.equal((await f.request('/api/admin/catalog/'+artId,{method:'PATCH',headers:owner,body:patch})).status,200);
 assert.equal((await f.request('/api/catalog')).data.artworks.some(a=>a.id===artId),false);
 assert.equal((await f.request('/api/orders',{method:'POST',body:f.payload()})).status,400);
 assert.equal((await f.request('/api/admin/catalog?state=hidden',{headers:owner})).data.total,1);
 assert.equal((await f.request('/api/admin/catalog/'+artId,{method:'PATCH',headers:owner,body:{action:'trash',version:2}})).status,200);
 assert.equal((await f.request('/api/admin/catalog?state=trash',{headers:owner})).data.total,1);
 assert.equal((await f.request('/api/admin/catalog?state=all',{headers:owner})).data.items.some(i=>i.artwork.id===artId),false);
 assert.equal((await f.request('/api/admin/catalog/'+artId,{method:'PATCH',headers:owner,body:{action:'restore',version:3}})).status,200);
 assert.equal((await f.request('/api/admin/catalog?state=hidden',{headers:owner})).data.total,1);
 patch.version=4;patch.hidden=false;
 assert.equal((await f.request('/api/admin/catalog/'+artId,{method:'PATCH',headers:owner,body:patch})).status,200);
 assert.equal((await f.request('/api/catalog')).data.artworks.find(a=>a.id===artId).titles.vi,'Tên ảnh mới');
 assert.equal((await f.request('/api/orders',{method:'POST',body:f.payload()})).status,201);
});

const bankFixture={bankName:'MB Bank test',bankBin:'970422',accountNumber:'0000000123456',accountName:'TEST ONLY'};
async function enableBank(f){return f.request('/api/admin/payment-settings',{method:'PATCH',headers:owner,body:{version:0,exchangeRate:26000,transferEnabled:true,codEnabled:true,bank:bankFixture}});}

test('payment settings require admin, validate bank details and preserve order rate snapshots',async()=>{
 const f=fixture();
 assert.equal((await f.request('/api/payment-settings')).data.exchangeRate,26000);
 assert.equal((await f.request('/api/admin/payment-settings')).status,401);
 assert.equal((await f.request('/api/admin/payment-settings',{method:'PATCH',headers:owner,body:{version:0,exchangeRate:26000,transferEnabled:true,codEnabled:true,bank:{}}})).status,400);
 assert.equal((await f.request('/api/orders',{method:'POST',body:f.payload({paymentMethod:'vietqr'})})).status,400);
 assert.equal((await enableBank(f)).status,200);
 const first=await f.request('/api/orders',{method:'POST',body:f.payload({paymentMethod:'vietqr',exchangeRate:1,paymentStatus:'paid'})});
 assert.equal(first.data.expectedAmountVnd,130000);assert.equal(first.data.paymentStatus,'unpaid');assert.equal(first.data.receivedAmountVnd,0);assert.ok(first.data.qrPayload.includes('A000000727'));assert.ok(first.data.qrPayload.includes('5406130000'));assert.ok(first.data.qrPayload.includes(first.data.orderNumber));
 const changed={version:1,exchangeRate:30000,transferEnabled:true,codEnabled:true,bank:{...bankFixture,accountNumber:'0000000987654'}};
 assert.equal((await f.request('/api/admin/payment-settings',{method:'PATCH',headers:owner,body:changed})).status,200);
 assert.equal((await f.request('/api/admin/payment-settings',{method:'PATCH',headers:owner,body:changed})).status,409);
 const previous=await f.request('/api/order-payment/'+first.data.orderNumber,{headers:{'X-HueArt-Checkout-Key':first.data.paymentAccessKey}});
 assert.equal(previous.data.expectedAmountVnd,130000);assert.equal(previous.data.bank.accountNumber,bankFixture.accountNumber);
 const next=await f.request('/api/orders',{method:'POST',body:f.payload({paymentMethod:'transfer'})});assert.equal(next.data.expectedAmountVnd,150000);
});

test('customer payment reports are private, idempotent and never mark an order as paid',async()=>{
 const f=fixture();await enableBank(f);
 const placed=(await f.request('/api/orders',{method:'POST',body:f.payload({paymentMethod:'vietqr'})})).data;
 const path='/api/order-payment/'+placed.orderNumber,headers={'X-HueArt-Checkout-Key':placed.paymentAccessKey};
 assert.equal((await f.request(path)).status,404);assert.equal((await f.request(path,{headers:{'X-HueArt-Checkout-Key':crypto.randomUUID()}})).status,404);
 assert.doesNotMatch(JSON.stringify((await f.request(path,{headers})).data),/Nguyễn An|0901234567|customer_name|customer_phone/);
 assert.equal((await f.request(path+'/report',{method:'POST',headers,sameOrigin:false,body:{method:'vietqr'}})).status,403);
 const report=await f.request(path+'/report',{method:'POST',headers,body:{method:'vietqr',reference:'TEST-TXN',paymentStatus:'paid',receivedAmountVnd:999999999}});
 assert.equal(report.status,200);assert.equal(report.data.paymentStatus,'reported');assert.equal(report.data.receivedAmountVnd,0);assert.equal(report.data.reportedAmountVnd,130000);assert.equal(report.data.canPay,false);
 assert.equal((await f.request(path+'/report',{method:'POST',headers,body:{method:'vietqr'}})).status,200);
 let order=(await f.request('/api/admin/orders',{headers:owner})).data.orders[0];assert.equal(order.version,2);assert.equal(order.paymentReference,'TEST-TXN');assert.equal(order.history.filter(x=>x.action==='payment_reported').length,1);
 const update={version:order.version,status:'confirmed',paymentStatus:'paid',shippingCents:0,receivedAmountVnd:0,rightsConfirmed:false};
 assert.equal((await f.request('/api/admin/orders/'+order.id,{method:'PATCH',headers:owner,body:update})).status,400);
 update.receivedAmountVnd=130000;
 assert.equal((await f.request('/api/admin/orders/'+order.id,{method:'PATCH',headers:owner,body:update})).status,200);
 const verified=(await f.request(path,{headers})).data;assert.equal(verified.paymentStatus,'paid');assert.equal(verified.receivedAmountVnd,130000);assert.equal(verified.expectedAmountVnd,0);assert.equal(verified.qrPayload,null);
 assert.equal((await f.request(path+'/report',{method:'POST',headers,body:{method:'vietqr'}})).status,400);
 assert.equal((await f.request('/api/admin/orders',{headers:owner})).data.stats.receivedVnd,130000);
});

test('framed prints accept a verified deposit and a separate shipping balance; COD requires a print',async()=>{
 const f=fixture();await enableBank(f);
 assert.equal((await f.request('/api/orders',{method:'POST',body:f.payload({paymentMethod:'cod'})})).status,400);
 const body=f.payload({paymentMethod:'transfer',items:[{artworkId:artId,optionId:'framed-print',quantity:1}],customer:{name:'Test print',phone:'0901234567',address:'Hue test address'}});
 const placed=(await f.request('/api/orders',{method:'POST',body})).data;
 assert.equal(placed.shippingCents,null);assert.equal(placed.expectedAmountVnd,182000);
 const path='/api/order-payment/'+placed.orderNumber,headers={'X-HueArt-Checkout-Key':placed.paymentAccessKey};
 await f.request(path+'/report',{method:'POST',headers,body:{method:'transfer'}});
 let order=(await f.request('/api/admin/orders',{headers:owner})).data.orders[0];
 const deposit=await f.request('/api/admin/orders/'+order.id,{method:'PATCH',headers:owner,body:{version:order.version,status:'confirmed',paymentStatus:'partial',shippingCents:null,receivedAmountVnd:182000}});assert.equal(deposit.status,200);
 assert.equal((await f.request(path,{headers})).data.canPay,false);
 order=deposit.data;
 const quoted=await f.request('/api/admin/orders/'+order.id,{method:'PATCH',headers:owner,body:{version:order.version,status:'confirmed',paymentStatus:'partial',shippingCents:100,receivedAmountVnd:182000}});assert.equal(quoted.status,200);
 assert.equal((await f.request(path,{headers})).data.expectedAmountVnd,26000);
 assert.equal((await f.request(path+'/report',{method:'POST',headers,body:{method:'transfer'}})).data.reportedAmountVnd,26000);
 order=(await f.request('/api/admin/orders',{headers:owner})).data.orders[0];
 assert.equal((await f.request('/api/admin/orders/'+order.id,{method:'PATCH',headers:owner,body:{version:order.version,status:'completed',paymentStatus:'paid',shippingCents:100,receivedAmountVnd:208000}})).status,200);
 assert.equal((await f.request('/api/orders',{method:'POST',body:{...body,checkoutKey:crypto.randomUUID(),paymentMethod:'cod'}})).status,201);
});

test('copyright payment waits for admin confirmation of the written agreement',async()=>{
 const f=fixture();await enableBank(f);
 const placed=(await f.request('/api/orders',{method:'POST',body:f.payload({paymentMethod:'vietqr',rightsAccepted:true,items:[{artworkId:artId,optionId:'copyright',quantity:1}]})})).data;
 assert.equal(placed.awaitingRights,true);assert.equal(placed.canPay,false);assert.equal(placed.qrPayload,null);
 let order=(await f.request('/api/admin/orders',{headers:owner})).data.orders[0];
 assert.equal((await f.request('/api/admin/orders/'+order.id,{method:'PATCH',headers:owner,body:{version:order.version,status:'confirmed',paymentStatus:'unpaid',shippingCents:0,receivedAmountVnd:0,rightsConfirmed:true,revenueTermsAccepted:true,revenueTermsVersion:'2026-11-07-v1'}})).status,200);
 const ready=(await f.request('/api/order-payment/'+placed.orderNumber,{headers:{'X-HueArt-Checkout-Key':placed.paymentAccessKey}})).data;
 assert.equal(ready.canPay,true);assert.equal(ready.expectedAmountVnd,260000);
});

test('chat settings require admin, validate destinations, normalize links and hide disabled drafts',async()=>{
 const f=fixture();
 const defaults=(await f.request('/api/contact-settings')).data;assert.equal(defaults.zaloEnabled,false);assert.equal(defaults.messengerEnabled,false);
 assert.equal((await f.request('/api/admin/contact-settings')).status,401);
 const body={version:0,zaloEnabled:true,zaloPhone:'+84 901 234 567',messengerEnabled:true,messengerUrl:'https://www.facebook.com/fixture.page?ref=test'};
 assert.equal((await f.request('/api/admin/contact-settings',{method:'PATCH',body})).status,401);
 assert.equal((await f.request('/api/admin/contact-settings',{method:'PATCH',headers:owner,sameOrigin:false,body})).status,403);
 for(const messengerUrl of ['javascript:alert(1)','https://example.com/chat','https://facebook.com.evil.example/page','https://user:pass@facebook.com/page','http://m.me/page']){
  assert.equal((await f.request('/api/admin/contact-settings',{method:'PATCH',headers:owner,body:{...body,messengerUrl}})).status,400);
 }
 assert.equal((await f.request('/api/admin/contact-settings',{method:'PATCH',headers:owner,body:{...body,zaloPhone:'123'}})).status,400);
 const result=await f.request('/api/admin/contact-settings',{method:'PATCH',headers:owner,body});assert.equal(result.status,200);assert.equal(result.data.zaloPhone,'0901234567');assert.equal(result.data.messengerUrl,'https://m.me/fixture.page');
 assert.equal((await f.request('/api/contact-settings')).data.messengerUrl,'https://m.me/fixture.page');
 assert.equal((await f.request('/api/admin/contact-settings',{method:'PATCH',headers:owner,body})).status,409);
 const disabled=await f.request('/api/admin/contact-settings',{method:'PATCH',headers:owner,body:{...result.data,zaloEnabled:false,messengerEnabled:false}});assert.equal(disabled.status,200);
 const publicState=(await f.request('/api/contact-settings')).data;assert.equal(publicState.zaloPhone,'');assert.equal(publicState.messengerUrl,'');
 assert.equal((await f.request('/api/admin/contact-settings',{headers:owner})).data.zaloPhone,'0901234567');
 const facebookId=await f.request('/api/admin/contact-settings',{method:'PATCH',headers:owner,body:{...disabled.data,messengerEnabled:true,messengerUrl:'https://facebook.com/profile.php?id=1234567890'}});assert.equal(facebookId.data.messengerUrl,'https://m.me/1234567890');
});

const adminUploadPng=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jvhoAAAAASUVORK5CYII=','base64');
function uploadForm(metadata,bytes=adminUploadPng){const form=new FormData();form.append('image',new File([bytes],'admin-photo.png',{type:'image/png'}));form.append('metadata',JSON.stringify(metadata));return form;}
async function uploadAdmin(f,metadata,headers=owner,originHeader=origin,bytes=adminUploadPng){return worker.fetch(new Request(origin+'/api/admin/artworks',{method:'POST',headers:{Origin:originHeader,...headers},body:uploadForm(metadata,bytes)}),f.env);}

test('admin can add and immediately sell a photo without submitting a contact phone; retries create only one record',async()=>{
 const f=fixture(),metadata={submissionKey:crypto.randomUUID(),title:'Ảnh admin mới',titleEn:'Admin photo',titleFr:'Photo admin',authorName:'Đặng Huy Trứ',collection:'imperial-echoes',rightsConfirmed:true,revenueTermsAccepted:true,revenueTermsVersion:'2026-11-07-v1',publish:true};
 assert.equal((await uploadAdmin(f,metadata,{})).status,401);
 assert.equal((await uploadAdmin(f,metadata,ownerIdentity)).status,403);
 assert.equal((await uploadAdmin(f,metadata,owner,'https://other.example')).status,403);
 const saved=await uploadAdmin(f,metadata);assert.equal(saved.status,201);const receipt=await saved.json();assert.match(receipt.artworkId,/^submission-/);
 const retry=await uploadAdmin(f,metadata);assert.equal(retry.status,200);assert.equal((await retry.json()).artworkId,receipt.artworkId);
 assert.equal(f.sqlite.prepare('SELECT COUNT(*) AS count FROM artwork_submissions').get().count,1);
 const row=f.sqlite.prepare('SELECT * FROM artwork_submissions').get();assert.equal(row.status,'accepted');assert.equal(row.author_phone,'');
 const publicArt=(await f.request('/api/catalog')).data.artworks.find(art=>art.id===receipt.artworkId);assert.equal(publicArt.titles.vi,metadata.title);assert.equal(publicArt.titles.en,metadata.titleEn);
 assert.equal((await f.request('/api/orders',{method:'POST',body:f.payload({items:[{artworkId:receipt.artworkId,optionId:'high-resolution',quantity:1}]})})).status,201);
 assert.equal((await uploadAdmin(f,{...metadata,title:'Changed retry'})).status,409);
});

test('admin can save a photo hidden from both the public catalogue and image endpoint',async()=>{
 const f=fixture(),metadata={submissionKey:crypto.randomUUID(),title:'Ảnh admin lưu ẩn',authorName:'Đặng Huy Trứ',collection:'perfume-river',rightsConfirmed:true,revenueTermsAccepted:true,revenueTermsVersion:'2026-11-07-v1',publish:false};
 const saved=await uploadAdmin(f,metadata);assert.equal(saved.status,201);const receipt=await saved.json();
 assert.equal((await f.request('/api/catalog')).data.artworks.some(art=>art.id===receipt.artworkId),false);
 assert.equal((await f.request('/api/catalog/'+receipt.artworkId.slice(11)+'/image')).status,404);
 const library=(await f.request('/api/admin/catalog?state=hidden',{headers:owner})).data;const entry=library.items.find(item=>item.artwork.id===receipt.artworkId);assert.ok(entry);assert.equal(entry.hidden,true);
 assert.equal((await f.request('/api/orders',{method:'POST',body:f.payload({items:[{artworkId:receipt.artworkId,optionId:'high-resolution',quantity:1}]})})).status,400);
 assert.equal((await f.request('/api/admin/catalog/'+receipt.artworkId,{method:'PATCH',headers:owner,body:{...entry.artwork,version:entry.version,action:'save',hidden:false}})).status,200);
 assert.equal((await f.request('/api/catalog')).data.artworks.some(art=>art.id===receipt.artworkId),true);
});

test('direct library upload rejects invalid files and public contributions cannot forge admin publication',async()=>{
 const f=fixture(),metadata={submissionKey:crypto.randomUUID(),title:'Ảnh thử',authorName:'Đặng Huy Trứ',collection:'imperial-echoes',rightsConfirmed:true,revenueTermsAccepted:true,revenueTermsVersion:'2026-11-07-v1',publish:true};
 assert.equal((await uploadAdmin(f,metadata,owner,origin,Buffer.from('<svg>not a photo</svg>'))).status,400);
 assert.equal((await uploadAdmin(f,{...metadata,publish:'yes'})).status,400);
 assert.equal((await uploadAdmin(f,{...metadata,rightsConfirmed:false})).status,400);
 const forged=await worker.fetch(new Request(origin+'/api/submissions',{method:'POST',headers:{Origin:origin},body:uploadForm({...metadata,authorPhone:'0901234567',adminUpload:true,status:'accepted'})}),f.env);assert.equal(forged.status,201);
 assert.equal(f.sqlite.prepare('SELECT status FROM artwork_submissions').get().status,'pending');
});

test('a committed upload keeps its original image if the database write response is lost',async()=>{
 const f=fixture(),prepare=f.env.DB.prepare.bind(f.env.DB);
 f.env.DB.prepare=sql=>{const statement=prepare(sql);if(sql.startsWith('INSERT INTO artwork_submissions')){const run=statement.run.bind(statement);statement.run=async()=>{await run();throw new Error('Simulated lost database response');};}return statement;};
 const response=await uploadAdmin(f,{submissionKey:crypto.randomUUID(),title:'Ảnh giữ nguyên',authorName:'Test owner',collection:'imperial-echoes',rightsConfirmed:true,revenueTermsAccepted:true,revenueTermsVersion:'2026-11-07-v1',publish:true});assert.equal(response.status,200);const saved=await response.json();
 const image=await worker.fetch(new Request(origin+'/api/catalog/'+saved.artworkId.slice(11)+'/image'),f.env);assert.equal(image.status,200);assert.deepEqual(Buffer.from(await image.arrayBuffer()),adminUploadPng);
 assert.equal(f.sqlite.prepare('SELECT COUNT(*) AS count FROM artwork_submissions').get().count,1);
});

test('contributors must accept the current 20% revenue terms and cannot forge the recorded percentages',async()=>{
 const f=fixture(),base={submissionKey:crypto.randomUUID(),title:'Ảnh cộng tác',authorName:'Test photographer',authorPhone:'0901234567',collection:'imperial-echoes',rightsConfirmed:true};
 const submit=data=>worker.fetch(new Request(origin+'/api/submissions',{method:'POST',headers:{Origin:origin},body:uploadForm(data)}),f.env);
 assert.equal((await submit(base)).status,400);
 assert.equal((await submit({...base,revenueTermsAccepted:true,revenueTermsVersion:'old'})).status,409);
 const before=Date.now();const saved=await submit({...base,revenueTermsAccepted:true,revenueTermsVersion:'2026-11-07-v1',revenueTerms:{totalFeePercent:0,photographerPercent:100,acceptedAt:'1900-01-01'}});assert.equal(saved.status,201);
 const row=f.sqlite.prepare('SELECT * FROM artwork_submissions').get(),terms=JSON.parse(row.revenue_terms_json);assert.equal(row.submission_origin,'contributor');assert.equal(terms.totalFeePercent,20);assert.equal(terms.associationFundPercent,10);assert.equal(terms.administrationPercent,10);assert.equal(terms.photographerPercent,80);assert.ok(new Date(terms.acceptedAt).getTime()>=before);
 const reviewed=(await f.request('/api/admin/submissions',{headers:owner})).data.submissions[0];assert.equal(reviewed.revenueTerms.totalFeePercent,20);
 const direct=await uploadAdmin(f,{submissionKey:crypto.randomUUID(),title:'Ảnh riêng admin',authorName:'Owner',collection:'imperial-echoes',rightsConfirmed:true,publish:true});assert.equal(direct.status,201);
 const own=f.sqlite.prepare("SELECT * FROM artwork_submissions WHERE submission_origin = 'admin'").get();assert.equal(own.revenue_terms_json,'{}');assert.equal((await f.request('/api/admin/submissions',{headers:owner})).data.submissions.length,1);
});

test('site statistics persist each session once and count only paid non-cancelled photo quantities', async () => {
  const f=fixture();
  assert.deepEqual((await f.request('/api/site-stats')).data,{visits:1000000,sold:1000,contributions:100});
  const sessionId=crypto.randomUUID();
  const visit=()=>f.request('/api/site-stats',{method:'POST',body:{sessionId}});
  assert.equal((await visit()).data.visits,1000001);
  assert.equal((await visit()).data.visits,1000001);
  assert.equal((await f.request('/api/site-stats',{method:'POST',body:{sessionId:'invalid'}})).status,400);
  assert.equal((await f.request('/api/site-stats',{method:'POST',body:{sessionId:crypto.randomUUID()},sameOrigin:false})).status,403);
  const first=await f.request('/api/orders',{method:'POST',body:f.payload({customer:{name:'Nguyễn An',phone:'0901234567',address:'273 Điện Biên Phủ, Huế'},items:[{artworkId:artId,optionId:'framed-print',quantity:3}]})});
  assert.equal(first.status,201);
  assert.equal((await f.request('/api/site-stats')).data.sold,1000);
  f.sqlite.prepare("UPDATE orders SET payment_status='paid'").run();
  assert.equal((await f.request('/api/site-stats')).data.sold,1003);
  f.sqlite.prepare("UPDATE orders SET status='cancelled'").run();
  assert.equal((await f.request('/api/site-stats')).data.sold,1000);
  assert.equal((await f.request('/api/site-stats')).data.visits,1000001);
});

test('Zalo bot settings are admin-only, encrypted, masked and validated before enabling',async()=>{
 const f=fixture();f.env.VERCEL_BRIDGE_TOKEN='cd'.repeat(32);
 const path='/api/admin/zalo-notifications',token='123456:test-token-local-only';
 assert.equal((await f.request(path)).status,401);
 assert.equal((await f.request(path,{headers:owner})).data.tokenConfigured,false);
 assert.equal((await f.request(path,{method:'PATCH',headers:owner,body:{enabled:true,chatId:'',version:0}})).status,400);
 const saved=await f.request(path,{method:'PATCH',headers:owner,body:{enabled:true,chatId:'admin-chat',token,version:0}});
 assert.equal(saved.status,200);assert.equal(saved.data.tokenConfigured,true);assert.equal(JSON.stringify(saved.data).includes(token),false);
 const row=f.sqlite.prepare("SELECT value_json FROM shop_settings WHERE key='zalo_notifications'").get();assert.equal(row.value_json.includes(token),false);
 assert.equal(JSON.stringify((await f.request(path,{headers:owner})).data).includes('secret'),false);
 assert.equal(JSON.stringify((await f.request('/api/contact-settings')).data).includes('token'),false);
 assert.equal((await f.request(path,{method:'PATCH',headers:owner,body:{enabled:false,chatId:'admin-chat',version:0}})).status,409);
 assert.equal((await f.request(path,{method:'PATCH',headers:owner,sameOrigin:false,body:{enabled:false,chatId:'admin-chat',version:1}})).status,403);
});

test('saved orders send full details to configured Zalo admin once; failed delivery preserves the order and supports retry',async()=>{
 const f=fixture();f.env.VERCEL_BRIDGE_TOKEN='cd'.repeat(32);
 const token='123456:test-token-local-only',path='/api/admin/zalo-notifications';
 await f.request(path,{method:'PATCH',headers:owner,body:{enabled:true,chatId:'admin-chat',token,version:0}});
 const originalFetch=globalThis.fetch,messages=[];let fail=false;
 globalThis.fetch=async(url,init)=>{
  assert.equal(url,`https://bot-api.zaloplatforms.com/bot${token}/sendMessage`);
  if(fail)throw new Error('Connection failed '+token);
  const body=JSON.parse(init.body);assert.equal(body.chat_id,'admin-chat');assert.ok(body.text.length<=2000);messages.push(body.text);
  return Response.json({ok:true,result:{message_id:'local-test-only'}});
 };
 try{
  const body=f.payload({customer:{name:'Khách Nguyễn An',phone:'0901234567',email:'test@example.com',address:'',note:'Liên hệ sau 18h'}});
  const saved=await f.request('/api/orders',{method:'POST',body});assert.equal(saved.status,201);assert.equal(messages.length,1);
  for(const detail of [saved.data.orderNumber,'Khách Nguyễn An','0901234567','test@example.com','5 USD','130.000 VND','Liên hệ sau 18h','Chưa thanh toán'])assert.ok(messages[0].includes(detail),detail);
  await f.request('/api/orders',{method:'POST',body});assert.equal(messages.length,1);
  let logs=(await f.request(path,{headers:owner})).data.deliveries;assert.equal(logs[0].status,'sent');
  fail=true;const failed=await f.request('/api/orders',{method:'POST',body:f.payload()});assert.equal(failed.status,201);
  logs=(await f.request(path,{headers:owner})).data.deliveries;const row=logs.find(item=>item.order_number===failed.data.orderNumber);assert.equal(row.status,'failed');assert.equal(row.last_error.includes(token),false);
  fail=false;assert.equal((await f.request(`${path}/${row.order_id}/retry`,{method:'POST',headers:owner})).status,200);assert.equal(messages.length,2);
  assert.equal((await f.request(`${path}/${row.order_id}/retry`,{method:'POST',headers:owner})).status,409);
  assert.equal((await f.request(`${path}/${row.order_id}/retry`,{method:'POST'})).status,401);
 }finally{globalThis.fetch=originalFetch;}
});

test('collaboration counter includes accepted contributor photos and excludes direct admin uploads',async()=>{
 const f=fixture();
 const metadata={submissionKey:crypto.randomUUID(),title:'Admin image',authorName:'Owner',collection:'imperial-echoes',rightsConfirmed:true,publish:true};
 assert.equal((await uploadAdmin(f,metadata)).status,201);
 assert.equal((await f.request('/api/site-stats')).data.contributions,100);
 const response=await worker.fetch(new Request(origin+'/api/submissions',{method:'POST',headers:{Origin:origin},body:uploadForm({...metadata,submissionKey:crypto.randomUUID(),authorPhone:'0901234567',revenueTermsAccepted:true,revenueTermsVersion:'2026-11-07-v1'})}),f.env);
 assert.equal(response.status,201);assert.equal((await f.request('/api/site-stats')).data.contributions,100);
 f.sqlite.prepare("UPDATE artwork_submissions SET status='accepted' WHERE submission_origin='contributor'").run();
 assert.equal((await f.request('/api/site-stats')).data.contributions,101);
 f.sqlite.prepare("UPDATE artwork_submissions SET status='rejected' WHERE submission_origin='contributor'").run();
 assert.equal((await f.request('/api/site-stats')).data.contributions,100);
});

test('Zalo keeps every detail of long orders within the API message limit',async()=>{
 const f=fixture();f.env.VERCEL_BRIDGE_TOKEN='cd'.repeat(32);
 await f.request('/api/admin/zalo-notifications',{method:'PATCH',headers:owner,body:{enabled:true,chatId:'admin-chat',token:'123456:test-local-token',version:0}});
 const originalFetch=globalThis.fetch,messages=[];
 globalThis.fetch=async(url,init)=>{const body=JSON.parse(init.body);messages.push(body.text);assert.ok(body.text.length<=2000);return Response.json({ok:true,result:{message_id:'local-only'}});};
 try{
  const result=await f.request('/api/orders',{method:'POST',body:f.payload({customer:{name:'Nguyễn An',phone:'0901234567',email:'',address:'Địa chỉ thử nghiệm dài '.repeat(20),note:'Ghi chú thử nghiệm '.repeat(50)}})});
  assert.equal(result.status,201); // Digital orders omit delivery addresses.
  const row=f.sqlite.prepare('SELECT * FROM orders').get();
  f.sqlite.prepare("UPDATE orders SET customer_address=?,customer_note=? WHERE id=?").run('Địa chỉ '.repeat(60),'Ghi chú '.repeat(120),row.id);
  // Resume an unsent long notification through the same admin retry path.
  f.sqlite.prepare("UPDATE order_notifications SET status='pending',next_chunk=0 WHERE order_id=?").run(row.id);messages.length=0;
  assert.equal((await f.request(`/api/admin/zalo-notifications/${row.id}/retry`,{method:'POST',headers:owner})).status,200);
  assert.ok(messages.length>1);assert.ok(messages.join('').includes('Quản lý đơn: https://hue-art2.vercel.app/admin'));
  assert.equal(f.sqlite.prepare('SELECT status FROM order_notifications').get().status,'sent');
 }finally{globalThis.fetch=originalFetch;}
});
