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
  const metadata={submissionKey:crypto.randomUUID(),title:'Huế trong tôi',titleEn:'My Hue',titleFr:'Mon Hué',authorName:'Tác giả An',authorPhone:'0901234567',authorEmail:'',collection:'imperial-echoes',rightsConfirmed:true};
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
  const form=new FormData();form.append('image',new File(['<svg onload="alert(1)"></svg>'],'photo.png',{type:'image/png'}));form.append('metadata',JSON.stringify({submissionKey:crypto.randomUUID(),title:'Huế',authorName:'Tác giả',authorPhone:'0901234567',collection:'imperial-echoes',rightsConfirmed:true}));
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
  form.append('metadata',JSON.stringify({submissionKey:crypto.randomUUID(),title:'Tác phẩm đã duyệt',titleEn:'Approved artwork',titleFr:'Œuvre acceptée',authorName:'Nguyễn An',authorPhone:'0901234567',authorEmail:'private@example.com',location:'Huế',story:'Câu chuyện tác phẩm',collection:'imperial-echoes',rightsConfirmed:true}));
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
