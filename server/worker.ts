import {mediaMigration} from './mediaMigration';
import {secureResponse} from './securityHeaders';
import {previewKey,adminOriginalAssets} from './media';
import {customerDownloads,downloadFile} from './downloads';
import {getContactSettings,publicContactSettings,saveContactSettings} from './contactSettings';
import {notificationSettings,queueOrderNotification,deliverOrderNotification,retryNotification} from './zaloNotifications';
import {getPaymentSettings,savePaymentSettings,paymentReceipt,customerPayment} from './payments';
import { catalogueAdmin } from './catalogueAdmin';
import { getCatalogue } from './catalogue';
import { adminAuth, adminIdentity } from './adminAuth';
import { submissions } from './submissions';
import { curate } from './curator';
import { ApiError, ORDER_STATUSES, PAYMENT_STATUSES, serializeOrder, validateOrder, validateUpdate } from './orders';

interface Statement { bind(...values: unknown[]): Statement; first<T = any>(): Promise<T | null>; all<T = any>(): Promise<{ results: T[] }>; run(): Promise<{ meta: { changes: number } }> }
interface Env { DB: { prepare(query: string): Statement }; ASSETS: { fetch(request: Request): Promise<Response> }; ADMIN_EMAIL: string; BUCKET?: any; GEMINI_API_KEY?: string; ADMIN_USERNAME?: string; ADMIN_PASSWORD_HASH?: string; VERCEL_BRIDGE_TOKEN?: string; MEDIA_MIGRATION_TOKEN_HASH?:string; MEDIA_MIGRATION_EXPIRES_AT?:string; }
const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
const sha256 = async (input: string) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input)))).map(byte => byte.toString(16).padStart(2, '0')).join('');
async function readJson(request: Request) {
  if (!request.headers.get('Content-Type')?.includes('application/json')) throw new ApiError(415, 'Yêu cầu phải là JSON.');
  if (Number(request.headers.get('Content-Length')) > 32768) throw new ApiError(413, 'Nội dung đơn hàng quá dài.');
  const body = await request.text();
  if (new TextEncoder().encode(body).length > 32768) throw new ApiError(413, 'Nội dung đơn hàng quá dài.');
  try { return JSON.parse(body); } catch { throw new ApiError(400, 'Dữ liệu không hợp lệ.'); }
}
const receipt = paymentReceipt;
async function notifyOrder(env:Env,order:any,context?:{waitUntil(promise:Promise<unknown>):void}){
  // Orders stay successful even if Zalo is unavailable. Repeated checkouts repair a missing queue entry.
  try{
    await queueOrderNotification(env,order);
    const delivery=deliverOrderNotification(env,order.id).catch(()=>console.error('Zalo notification delivery failed'));
    if(context)context.waitUntil(delivery);else await delivery;
  }catch{console.error('Zalo notification queue failed');}
}

export async function api(request: Request, env: Env, context?: {waitUntil(promise:Promise<unknown>):void}): Promise<Response> {
  const url = new URL(request.url);
  if(url.pathname.startsWith('/api/internal/media-'))return mediaMigration(request,env);
  const actor = await adminIdentity(request, env);
  if (request.method === 'GET' && url.pathname === '/api/session') return json({ authenticated: actor.authenticated, ownerAuthenticated: actor.ownerAuthenticated, isAdmin: actor.isAdmin });
  if (url.pathname.startsWith('/api/admin/') && !actor.isAdmin) throw new ApiError(actor.authenticated ? 403 : 401, 'Vui lòng đăng nhập quản trị để tiếp tục.');
  if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(request.method) && request.headers.get('Origin') !== url.origin) throw new ApiError(403, 'Nguồn gửi yêu cầu không hợp lệ. Vui lòng dùng website để đặt hàng.');
  if (!env.DB) throw new ApiError(503, 'Hệ thống đơn hàng đang được thiết lập. Vui lòng thử lại sau.');

  if(url.pathname.startsWith('/api/admin/zalo-notifications')){
    const retry=/^\/api\/admin\/zalo-notifications\/([0-9a-f-]{36})\/retry$/.exec(url.pathname);
    if(retry&&request.method==='POST')return json(await retryNotification(env,retry[1]));
    if(!/^\/api\/admin\/zalo-notifications(?:\/(?:test|recipient))?$/.test(url.pathname))throw new ApiError(404,'Không tìm thấy chức năng này.');
    return json(await notificationSettings(request,env,request.method==='PATCH'?await readJson(request):{}));
  }
  if (url.pathname === '/api/health' && request.method === 'GET') {
    await env.DB.prepare('SELECT 1 AS ok').first();
    return json({ok:true,database:true,uploads:Boolean(env.BUCKET),protocol:1});
  }
  if(url.pathname==='/api/contact-settings'&&request.method==='GET')return json(publicContactSettings(await getContactSettings(env)));
  if(url.pathname==='/api/site-stats'&&['GET','POST'].includes(request.method)){
    if(request.method==='POST'){
      const body=await readJson(request);
      if(typeof body.sessionId!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.sessionId))throw new ApiError(400,'Phiên truy cập không hợp lệ.');
      await env.DB.prepare('INSERT OR IGNORE INTO site_visits (session_id) VALUES (?)').bind(body.sessionId).run();
    }
    const [visits,sales,contributions]=await Promise.all([
      env.DB.prepare('SELECT COUNT(*) AS count FROM site_visits').first(),
      env.DB.prepare("SELECT COALESCE(SUM(CAST(json_extract(item.value, '$.quantity') AS INTEGER)), 0) AS count FROM orders, json_each(orders.items_json) AS item WHERE orders.payment_status = 'paid' AND orders.status != 'cancelled'").first(),
      env.DB.prepare("SELECT COUNT(*) AS count FROM artwork_submissions WHERE submission_origin = 'contributor' AND status = 'accepted'").first(),
    ]);
    return json({visits:1000000+Number(visits?.count||0),sold:1000+Number(sales?.count||0),contributions:100+Number(contributions?.count||0)});
  }
  if(url.pathname==='/api/admin/contact-settings'){
    if(request.method==='GET')return json(await getContactSettings(env));
    if(request.method==='PATCH')return json(await saveContactSettings(env,await readJson(request)));
  }
  if(url.pathname==='/api/payment-settings'&&request.method==='GET'){
    const settings=await getPaymentSettings(env);
    return json({...settings,bank:settings.transferEnabled?settings.bank:{bankName:'',bankBin:'',accountNumber:'',accountName:''}});
  }
  if(url.pathname==='/api/admin/payment-settings'){
    if(request.method==='GET')return json(await getPaymentSettings(env));
    if(request.method==='PATCH')return json(await savePaymentSettings(env,await readJson(request)));
  }
  if(url.pathname.startsWith('/api/order-payment/'))return json(await customerPayment(request,env,readJson));
  if (url.pathname.startsWith('/api/admin/catalog')) return catalogueAdmin(request,env,request.method==='PATCH'?await readJson(request):undefined);
  if (url.pathname === '/api/catalog' && request.method === 'GET') return json({ artworks: await getCatalogue(env) });
  if(url.pathname==='/api/retired-image'||/^\/api\/catalog\/[0-9a-f-]{36}\/image$/.test(url.pathname))return json({error:'Đường dẫn ảnh gốc công khai đã ngừng phục vụ.'},410);
  const download=/^\/api\/downloads\/([A-Za-z0-9_.-]+)$/.exec(url.pathname);
  if(download)return downloadFile(request,env,download[1]);
  const links=/^\/api\/order-downloads\/(DHT-[0-9]{8}-[A-F0-9]{8})$/.exec(url.pathname);
  if(links)return json(await customerDownloads(request,env,links[1]));
  const importAsset=/^\/api\/admin\/original-assets\/([a-z0-9-]+)\/(complete|[0-9]+)$/.exec(url.pathname);
  if(importAsset)return adminOriginalAssets(request,env,importAsset[1],importAsset[2]);
  const publicImage=/^\/api\/catalog\/([0-9a-f-]{36})\/preview$/.exec(url.pathname);
  if(publicImage&&['GET','HEAD'].includes(request.method)){
    const image=await env.DB.prepare("SELECT preview_version FROM artwork_submissions WHERE id = ? AND status = 'accepted'").bind(publicImage[1]).first();
    const override=await env.DB.prepare('SELECT hidden, deleted_at FROM catalogue_overrides WHERE artwork_id = ?').bind('submission-'+publicImage[1]).first();
    if(!image||image.preview_version<2||override?.hidden||override?.deleted_at)throw new ApiError(404,'Không tìm thấy ảnh xem trước.');
    const width=Number(url.searchParams.get('w')||960);if(![160,480,960].includes(width))throw new ApiError(400,'Kích thước xem trước không hợp lệ.');
    const object=await env.BUCKET?.get(previewKey(publicImage[1],width));if(!object)throw new ApiError(404,'Không tìm thấy ảnh xem trước.');
    return new Response(request.method==='HEAD'?null:object.body,{headers:{'Content-Type':'image/jpeg','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
  }

  if (url.pathname.startsWith('/api/admin-auth/') && request.method === 'POST') return adminAuth(request, env, actor, url.pathname.endsWith('/login') ? await readJson(request) : {});

  if (url.pathname === '/api/submissions' || url.pathname === '/api/admin/artworks' || url.pathname.startsWith('/api/admin/submissions')) return submissions(request, env, actor.rateKey,actor.isAdmin);
  if (url.pathname === '/api/curator' && request.method === 'POST') return json(await curate(await readJson(request), env));

  if (url.pathname === '/api/orders' && request.method === 'POST') {
    const body=await readJson(request);
    const bodyMethodPresent=body.paymentMethod!==undefined;
    const data = validateOrder(body, await getCatalogue(env));
    const settings=await getPaymentSettings(env);
    const {paymentMethod:ignoredMethod,...legacyData}=data;
    const fingerprint = await sha256(JSON.stringify(bodyMethodPresent?data:legacyData));
    const existing = await env.DB.prepare('SELECT * FROM orders WHERE checkout_key = ?').bind(data.checkoutKey).first();
    if (existing) {
      if (existing.payload_hash !== fingerprint) throw new ApiError(409, 'Yêu cầu này đã được gửi với nội dung khác. Vui lòng kiểm tra đơn đã gửi.');
      await notifyOrder(env,existing,context);
      return json(receipt(existing,settings));
    }
    if(['vietqr','transfer'].includes(data.paymentMethod)&&!settings.transferEnabled||data.paymentMethod==='cod'&&!settings.codEnabled)throw new ApiError(400,'Phương thức thanh toán hiện chưa khả dụng. Vui lòng chọn cách khác.');
    const requester = await sha256(actor.rateKey + ':hueart-orders');
    const cutoff = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const recent = await env.DB.prepare('SELECT COUNT(*) AS count FROM orders WHERE requester_hash = ? AND created_at > ?').bind(requester, cutoff).first();
    if (Number(recent?.count) >= 10) throw new ApiError(429, 'Bạn đã gửi nhiều đơn trong thời gian ngắn. Vui lòng thử lại sau 15 phút.');
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const localDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()).replace(/-/g, '');
    const orderNumber = `DHT-${localDate}-${id.slice(0, 8).toUpperCase()}`;
    const history = JSON.stringify([{ at: now, status: 'new', paymentStatus: 'unpaid', action: 'created' }]);
    try {
      await env.DB.prepare('INSERT INTO orders (id, order_number, checkout_key, payload_hash, requester_hash, customer_name, customer_phone, customer_email, customer_address, customer_note, items_json, subtotal_cents, shipping_cents, has_print, has_copyright, rights_accepted, status, payment_status, admin_note, history_json, version, created_at, updated_at, payment_method, exchange_rate, bank_snapshot_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').bind(id, orderNumber, data.checkoutKey, fingerprint, requester, data.name, data.phone, data.email, data.address, data.note, JSON.stringify(data.items), data.subtotalCents, data.hasPrint ? null : 0, Number(data.hasPrint), Number(data.hasCopyright), Number(data.rightsAccepted), 'new', 'unpaid', '', history, 1, now, now,data.paymentMethod,settings.exchangeRate,JSON.stringify(settings.transferEnabled?settings.bank:{})).run();
    } catch (error) {
      // A retried request may race the original insert. Return its receipt once.
      const saved = await env.DB.prepare('SELECT * FROM orders WHERE checkout_key = ?').bind(data.checkoutKey).first();
      if (saved?.payload_hash === fingerprint) {await notifyOrder(env,saved,context);return json(receipt(saved,settings));}
      throw error;
    }
    const saved = await env.DB.prepare('SELECT * FROM orders WHERE id = ?').bind(id).first();
    await notifyOrder(env,saved,context);
    return json(receipt(saved,settings), 201);
  }

  if (url.pathname === '/api/admin/orders' && request.method === 'GET') {
    const search = (url.searchParams.get('q') || '').trim().slice(0, 100);
    const status = url.searchParams.get('status') || '';
    const payment = url.searchParams.get('payment') || '';
    const page = Math.max(1, Math.min(100000, Number.parseInt(url.searchParams.get('page') || '1') || 1));
    if (status && !ORDER_STATUSES.includes(status as any)) throw new ApiError(400, 'Bộ lọc trạng thái không hợp lệ.');
    if (payment && !PAYMENT_STATUSES.includes(payment as any)) throw new ApiError(400, 'Bộ lọc thanh toán không hợp lệ.');
    const filters: string[] = []; const params: unknown[] = [];
    if (search) { filters.push('(order_number LIKE ? OR customer_name LIKE ? OR customer_phone LIKE ? OR customer_email LIKE ?)'); const term = `%${search.replace(/[\\%_]/g, '\\$&')}%`; for (let i = 0; i < 4; i++) params.push(term); }
    if (status) { filters.push('status = ?'); params.push(status); }
    if (payment) { filters.push('payment_status = ?'); params.push(payment); }
    // Search is parameter-bound; ESCAPE makes literal %, _ and backslash searchable.
    const where = filters.length ? ' WHERE ' + filters.join(' AND ').replaceAll('LIKE ?', "LIKE ? ESCAPE '\\'") : '';
    const [rows, count, stats] = await Promise.all([
      env.DB.prepare(`SELECT * FROM orders${where} ORDER BY created_at DESC, id DESC LIMIT 20 OFFSET ?`).bind(...params, (page - 1) * 20).all(),
      env.DB.prepare(`SELECT COUNT(*) AS count FROM orders${where}`).bind(...params).first(),
      env.DB.prepare("SELECT COUNT(*) AS total, SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) AS new_orders, SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) AS processing, SUM(CASE WHEN payment_status = 'paid' AND status != 'cancelled' THEN subtotal_cents + COALESCE(shipping_cents, 0) ELSE 0 END) AS paid_cents, SUM(CASE WHEN status != 'cancelled' THEN received_amount_vnd ELSE 0 END) AS received_vnd FROM orders").first(),
    ]);
    return json({ orders: rows.results.map(serializeOrder), total: Number(count?.count || 0), page, pageSize: 20, stats: { total: Number(stats?.total || 0), newOrders: Number(stats?.new_orders || 0), processing: Number(stats?.processing || 0), paidCents: Number(stats?.paid_cents || 0),receivedVnd:Number(stats?.received_vnd||0) } });
  }

  const match = /^\/api\/admin\/orders\/([0-9a-f-]{36})$/.exec(url.pathname);
  if (match && request.method === 'PATCH') {
    const row = await env.DB.prepare('SELECT * FROM orders WHERE id = ?').bind(match[1]).first();
    if (!row) throw new ApiError(404, 'Không tìm thấy đơn hàng.');
    const data = validateUpdate(await readJson(request), row);
    const now = new Date().toISOString();
    const history = [...JSON.parse(row.history_json), { at: now, action: 'updated', actorId: actor.userId, status: data.status, paymentStatus: data.paymentStatus, shippingCents: data.shippingCents,receivedAmountVnd:data.receivedAmountVnd,rightsConfirmed:data.rightsConfirmed }];
    const result = await env.DB.prepare('UPDATE orders SET status = ?, payment_status = ?, shipping_cents = ?, received_amount_vnd = ?, rights_confirmed = ?, admin_note = ?, history_json = ?, version = version + 1, updated_at = ? WHERE id = ? AND version = ?').bind(data.status, data.paymentStatus, data.shippingCents,data.receivedAmountVnd,Number(data.rightsConfirmed), data.adminNote, JSON.stringify(history), now, row.id, row.version).run();
    if (!result.meta.changes) throw new ApiError(409, 'Đơn vừa được cập nhật ở cửa sổ khác. Vui lòng tải lại.');
    return json(serializeOrder(await env.DB.prepare('SELECT * FROM orders WHERE id = ?').bind(row.id).first()));
  }
  throw new ApiError(404, 'Không tìm thấy chức năng này.');
}

export default {
  async fetch(request: Request, env: Env, context?: {waitUntil(promise:Promise<unknown>):void}): Promise<Response> {
    try {
      const url = new URL(request.url);
      if (url.pathname.startsWith('/api/')) return secureResponse(await api(request, env, context),true);
      if(/^\/(?:images\/(?:hue|previews)\/|_vercel\/image)/.test(url.pathname))return secureResponse(json({error:'Đường dẫn ảnh cũ đã ngừng phục vụ.'},410),true);
      // Fetch the root asset internally. /index.html triggers the asset service's
      // canonical redirect to /, which would erase the browser's /admin route.
      if (url.pathname === '/admin' || url.pathname === '/admin/') url.pathname = '/';
      return secureResponse(await env.ASSETS.fetch(new Request(url, request)),true);
    } catch (error) {
      if (error instanceof ApiError) return secureResponse(json({ error: error.message }, error.status),true);
      console.error('Order service failed', error instanceof Error ? error.name : 'UnknownError');
      return secureResponse(json({ error: 'Chưa xử lý được yêu cầu. Vui lòng thử lại; giỏ hàng của bạn vẫn được giữ.' }, 500),true);
    }
  },
};
