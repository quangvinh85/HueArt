import { getCatalogue } from './catalogue';
import { adminAuth, adminIdentity } from './adminAuth';
import { submissions } from './submissions';
import { curate } from './curator';
import { ApiError, ORDER_STATUSES, PAYMENT_STATUSES, serializeOrder, validateOrder, validateUpdate } from './orders';

interface Statement { bind(...values: unknown[]): Statement; first<T = any>(): Promise<T | null>; all<T = any>(): Promise<{ results: T[] }>; run(): Promise<{ meta: { changes: number } }> }
interface Env { DB: { prepare(query: string): Statement }; ASSETS: { fetch(request: Request): Promise<Response> }; ADMIN_EMAIL: string; BUCKET?: any; GEMINI_API_KEY?: string; ADMIN_USERNAME?: string; ADMIN_PASSWORD_HASH?: string; VERCEL_BRIDGE_TOKEN?: string; }
const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
const sha256 = async (input: string) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input)))).map(byte => byte.toString(16).padStart(2, '0')).join('');
async function readJson(request: Request) {
  if (!request.headers.get('Content-Type')?.includes('application/json')) throw new ApiError(415, 'Yêu cầu phải là JSON.');
  if (Number(request.headers.get('Content-Length')) > 32768) throw new ApiError(413, 'Nội dung đơn hàng quá dài.');
  const body = await request.text();
  if (new TextEncoder().encode(body).length > 32768) throw new ApiError(413, 'Nội dung đơn hàng quá dài.');
  try { return JSON.parse(body); } catch { throw new ApiError(400, 'Dữ liệu không hợp lệ.'); }
}
function receipt(row: any) { return { orderNumber: row.order_number, subtotalCents: row.subtotal_cents, shippingCents: row.shipping_cents, status: row.status, createdAt: row.created_at }; }

export async function api(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const actor = await adminIdentity(request, env);
  if (request.method === 'GET' && url.pathname === '/api/session') return json({ authenticated: actor.authenticated, ownerAuthenticated: actor.ownerAuthenticated, isAdmin: actor.isAdmin });
  if (url.pathname.startsWith('/api/admin/') && !actor.isAdmin) throw new ApiError(actor.authenticated ? 403 : 401, 'Vui lòng đăng nhập quản trị để tiếp tục.');
  if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(request.method) && request.headers.get('Origin') !== url.origin) throw new ApiError(403, 'Nguồn gửi yêu cầu không hợp lệ. Vui lòng dùng website để đặt hàng.');
  if (!env.DB) throw new ApiError(503, 'Hệ thống đơn hàng đang được thiết lập. Vui lòng thử lại sau.');

  if (url.pathname === '/api/health' && request.method === 'GET') {
    await env.DB.prepare('SELECT 1 AS ok').first();
    return json({ok:true,database:true,uploads:Boolean(env.BUCKET),protocol:1});
  }
  if (url.pathname === '/api/catalog' && request.method === 'GET') return json({ artworks: await getCatalogue(env) });
  const publicImage = /^\/api\/catalog\/([0-9a-f-]{36})\/image$/.exec(url.pathname);
  if (publicImage && request.method === 'GET') {
    const image = await env.DB.prepare("SELECT object_key, content_type FROM artwork_submissions WHERE id = ? AND status = 'accepted'").bind(publicImage[1]).first();
    if (!image) throw new ApiError(404, 'Tác phẩm chưa được xuất bản hoặc đã ngừng bán.');
    const object = await env.BUCKET?.get(image.object_key);
    if (!object) throw new ApiError(404, 'Không tìm thấy ảnh.');
    return new Response(object.body, { headers: { 'Content-Type': image.content_type, 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff', 'Content-Security-Policy':"default-src 'none'" } });
  }

  if (url.pathname.startsWith('/api/admin-auth/') && request.method === 'POST') return adminAuth(request, env, actor, url.pathname.endsWith('/login') ? await readJson(request) : {});

  if (url.pathname === '/api/submissions' || url.pathname.startsWith('/api/admin/submissions')) return submissions(request, env, actor.rateKey);
  if (url.pathname === '/api/curator' && request.method === 'POST') return json(await curate(await readJson(request), env));

  if (url.pathname === '/api/orders' && request.method === 'POST') {
    const data = validateOrder(await readJson(request), await getCatalogue(env));
    const fingerprint = await sha256(JSON.stringify(data));
    const existing = await env.DB.prepare('SELECT * FROM orders WHERE checkout_key = ?').bind(data.checkoutKey).first();
    if (existing) {
      if (existing.payload_hash !== fingerprint) throw new ApiError(409, 'Yêu cầu này đã được gửi với nội dung khác. Vui lòng kiểm tra đơn đã gửi.');
      return json(receipt(existing));
    }
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
      await env.DB.prepare('INSERT INTO orders (id, order_number, checkout_key, payload_hash, requester_hash, customer_name, customer_phone, customer_email, customer_address, customer_note, items_json, subtotal_cents, shipping_cents, has_print, has_copyright, rights_accepted, status, payment_status, admin_note, history_json, version, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').bind(id, orderNumber, data.checkoutKey, fingerprint, requester, data.name, data.phone, data.email, data.address, data.note, JSON.stringify(data.items), data.subtotalCents, data.hasPrint ? null : 0, Number(data.hasPrint), Number(data.hasCopyright), Number(data.rightsAccepted), 'new', 'unpaid', '', history, 1, now, now).run();
    } catch (error) {
      // A retried request may race the original insert. Return its receipt once.
      const saved = await env.DB.prepare('SELECT * FROM orders WHERE checkout_key = ?').bind(data.checkoutKey).first();
      if (saved?.payload_hash === fingerprint) return json(receipt(saved));
      throw error;
    }
    const saved = await env.DB.prepare('SELECT * FROM orders WHERE id = ?').bind(id).first();
    return json(receipt(saved), 201);
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
      env.DB.prepare("SELECT COUNT(*) AS total, SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) AS new_orders, SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) AS processing, SUM(CASE WHEN payment_status = 'paid' AND status != 'cancelled' THEN subtotal_cents + COALESCE(shipping_cents, 0) ELSE 0 END) AS paid_cents FROM orders").first(),
    ]);
    return json({ orders: rows.results.map(serializeOrder), total: Number(count?.count || 0), page, pageSize: 20, stats: { total: Number(stats?.total || 0), newOrders: Number(stats?.new_orders || 0), processing: Number(stats?.processing || 0), paidCents: Number(stats?.paid_cents || 0) } });
  }

  const match = /^\/api\/admin\/orders\/([0-9a-f-]{36})$/.exec(url.pathname);
  if (match && request.method === 'PATCH') {
    const row = await env.DB.prepare('SELECT * FROM orders WHERE id = ?').bind(match[1]).first();
    if (!row) throw new ApiError(404, 'Không tìm thấy đơn hàng.');
    const data = validateUpdate(await readJson(request), row);
    const now = new Date().toISOString();
    const history = [...JSON.parse(row.history_json), { at: now, action: 'updated', actorId: actor.userId, status: data.status, paymentStatus: data.paymentStatus, shippingCents: data.shippingCents }];
    const result = await env.DB.prepare('UPDATE orders SET status = ?, payment_status = ?, shipping_cents = ?, admin_note = ?, history_json = ?, version = version + 1, updated_at = ? WHERE id = ? AND version = ?').bind(data.status, data.paymentStatus, data.shippingCents, data.adminNote, JSON.stringify(history), now, row.id, row.version).run();
    if (!result.meta.changes) throw new ApiError(409, 'Đơn vừa được cập nhật ở cửa sổ khác. Vui lòng tải lại.');
    return json(serializeOrder(await env.DB.prepare('SELECT * FROM orders WHERE id = ?').bind(row.id).first()));
  }
  throw new ApiError(404, 'Không tìm thấy chức năng này.');
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const url = new URL(request.url);
      if (url.pathname.startsWith('/api/')) return await api(request, env);
      // Fetch the root asset internally. /index.html triggers the asset service's
      // canonical redirect to /, which would erase the browser's /admin route.
      if (url.pathname === '/admin' || url.pathname === '/admin/') url.pathname = '/';
      return await env.ASSETS.fetch(new Request(url, request));
    } catch (error) {
      if (error instanceof ApiError) return json({ error: error.message }, error.status);
      console.error('Order service failed', error instanceof Error ? error.name : 'UnknownError');
      return json({ error: 'Chưa xử lý được yêu cầu. Vui lòng thử lại; giỏ hàng của bạn vẫn được giữ.' }, 500);
    }
  },
};
