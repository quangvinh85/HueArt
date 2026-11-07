import {REVENUE_POLICY} from '../src/shop/revenueTerms';
import { ApiError } from './orders';
const MAX_FILE_BYTES = 8 * 1024 * 1024;
const clean = (value: unknown, max: number) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const digest = async (data: ArrayBuffer | Uint8Array) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', data as BufferSource))).map(value => value.toString(16).padStart(2, '0')).join('');
const json = (value: unknown, status = 200) => Response.json(value, { status, headers: { 'Cache-Control': 'no-store' } });
export function imageType(bytes: Uint8Array): string | null {
  if (bytes.length >= 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return 'image/jpeg';
  if (bytes.length >= 8 && [137,80,78,71,13,10,26,10].every((value,index) => bytes[index] === value)) return 'image/png';
  if (bytes.length >= 12 && String.fromCharCode(...bytes.slice(0,4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8,12)) === 'WEBP') return 'image/webp';
  return null;
}
const serialize = (row: any) => ({ id: row.id, reference: row.reference, title: row.title, titleEn: row.title_en, titleFr: row.title_fr, authorName: row.author_name, authorEmail: row.author_email, authorPhone: row.author_phone, location: row.location, story: row.story, collection: row.collection, status: row.status, adminNote: row.admin_note, version: row.version, createdAt: row.created_at, revenueTerms:row.revenue_terms_json&&JSON.parse(row.revenue_terms_json).acceptedAt?JSON.parse(row.revenue_terms_json):null,imageUrl: `/api/admin/submissions/${row.id}/image` });

export async function submissions(request: Request, env: any, rateKey?: string, isAdmin = false): Promise<Response> {
  const path = new URL(request.url).pathname;
  const adminUpload=path==='/api/admin/artworks';
  if(adminUpload&&!isAdmin)throw new ApiError(403,'Vui lòng đăng nhập quản trị để tiếp tục.');
  const receipt=(row:any)=>adminUpload?{reference:row.reference,artworkId:'submission-'+row.id}:{reference:row.reference};
  if ((path === '/api/submissions'||adminUpload) && request.method === 'POST') {
    if (!env.BUCKET) throw new ApiError(503, 'Tính năng gửi ảnh đang được thiết lập. Vui lòng thử lại sau.');
    if (!request.headers.get('Content-Type')?.startsWith('multipart/form-data')) throw new ApiError(415, 'Định dạng gửi ảnh không hợp lệ.');
    if (Number(request.headers.get('Content-Length')) > MAX_FILE_BYTES + 32768) throw new ApiError(413, 'Ảnh tối đa 8 MB.');
    const form = await request.formData();
    const image = form.get('image');
    if (!(image instanceof File) || image.size === 0 || image.size > MAX_FILE_BYTES) throw new ApiError(400, 'Chọn ảnh JPG, PNG hoặc WebP, tối đa 8 MB.');
    const metadataRaw = form.get('metadata');
    if (typeof metadataRaw !== 'string' || metadataRaw.length > 12000) throw new ApiError(400, 'Thông tin tác phẩm không hợp lệ.');
    let data: any;
    try { data = JSON.parse(metadataRaw); } catch { throw new ApiError(400, 'Thông tin tác phẩm không hợp lệ.'); }
    const title = clean(data.title, 160), titleEn = clean(data.titleEn, 160), titleFr = clean(data.titleFr, 160);
    const authorName = clean(data.authorName, 100), authorEmail = clean(data.authorEmail, 150), authorPhone = clean(data.authorPhone, 30);
    const location = clean(data.location, 200), story = clean(data.story, 2000), collection = clean(data.collection, 50);
    const key = clean(data.submissionKey, 80);
    if(adminUpload&&typeof data.publish!=='boolean')throw new ApiError(400,'Vui lòng chọn trạng thái hiển thị ảnh.');
    const invalidPhone=(!adminUpload||Boolean(authorPhone))&&(!/^[+\d\s().-]{7,30}$/.test(authorPhone)||authorPhone.replace(/\D/g,'').length<7);
    if (!/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(key) || title.length < 2 || authorName.length < 2 || invalidPhone) throw new ApiError(400,adminUpload?'Vui lòng nhập tên tác phẩm và tác giả hợp lệ.':'Vui lòng nhập tên tác phẩm, tên tác giả và số điện thoại hợp lệ.');
    if (authorEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authorEmail)) throw new ApiError(400, 'Email không hợp lệ.');
    if (!['imperial-echoes','perfume-river','living-traditions','poetic-monochrome'].includes(collection) || data.rightsConfirmed !== true) throw new ApiError(400, 'Vui lòng chọn bộ sưu tập và xác nhận quyền gửi tác phẩm.');
    if(!adminUpload&&data.revenueTermsAccepted!==true)throw new ApiError(400,'Vui lòng đọc và đồng ý mức phí cộng tác 20% trước khi gửi tác phẩm.');
    if(!adminUpload&&data.revenueTermsVersion!==REVENUE_POLICY.version)throw new ApiError(409,'Điều kiện cộng tác đã thay đổi. Vui lòng tải lại biểu mẫu để đọc và xác nhận.');
    const revenueTerms=adminUpload?{}:{...REVENUE_POLICY,acceptedAt:new Date().toISOString()};
    const bytes = new Uint8Array(await image.arrayBuffer());
    const type = imageType(bytes);
    if (!type) throw new ApiError(400, 'Chỉ nhận ảnh JPG, PNG hoặc WebP hợp lệ.');
    const payloadHash = await digest(new TextEncoder().encode(JSON.stringify({title,titleEn,titleFr,authorName,authorEmail,authorPhone,location,story,collection,imageHash:await digest(bytes),...(adminUpload?{adminUpload:true,publish:data.publish}:{revenueTermsVersion:REVENUE_POLICY.version})})));
    const existing = await env.DB.prepare('SELECT * FROM artwork_submissions WHERE submission_key = ?').bind(key).first();
    if (existing) {
      if (existing.payload_hash !== payloadHash) throw new ApiError(409, 'Yêu cầu đã gửi có nội dung khác. Vui lòng đóng rồi mở lại biểu mẫu.');
      return json(receipt(existing));
    }
    const requester = await digest(new TextEncoder().encode((rateKey || request.headers.get('oai-authenticated-user-id') || request.headers.get('CF-Connecting-IP') || 'anonymous') + (adminUpload?':admin-artwork':':submission')));
    const recent = adminUpload?null:await env.DB.prepare('SELECT COUNT(*) AS count FROM artwork_submissions WHERE requester_hash = ? AND created_at > ?').bind(requester, new Date(Date.now()-3600000).toISOString()).first();
    if (!adminUpload&&Number(recent?.count) >= 5) throw new ApiError(429, 'Bạn đã gửi nhiều tác phẩm. Vui lòng thử lại sau một giờ.');
    const id = crypto.randomUUID(), reference = `DHT-ART-${id.slice(0,8).toUpperCase()}`;
    const objectKey = `submissions/${id}/original`;
    await env.BUCKET.put(objectKey, bytes, { httpMetadata: { contentType: type } });
    try {
      if(adminUpload&&!data.publish)await env.DB.prepare('INSERT INTO catalogue_overrides (artwork_id, metadata_json, hidden, deleted_at, version, updated_at) VALUES (?, ?, 1, NULL, 1, ?)').bind('submission-'+id,'{}',new Date().toISOString()).run();
      await env.DB.prepare('INSERT INTO artwork_submissions (id, reference, submission_key, payload_hash, requester_hash, title, title_en, title_fr, author_name, author_email, author_phone, location, story, collection, object_key, content_type, status, admin_note, version, created_at, updated_at, submission_origin, revenue_terms_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').bind(id,reference,key,payloadHash,requester,title,titleEn,titleFr,authorName,authorEmail,authorPhone,location,story,collection,objectKey,type,adminUpload?'accepted':'pending',adminUpload?'Thêm trực tiếp từ thư viện admin':'',1,new Date().toISOString(),new Date().toISOString(),adminUpload?'admin':'contributor',JSON.stringify(revenueTerms)).run();
    } catch (error) {
      // A database write may have committed even when its response was lost.
      // Keep that row's original file; only clean up this request's unused object.
      const saved = await env.DB.prepare('SELECT id, reference, payload_hash FROM artwork_submissions WHERE submission_key = ?').bind(key).first();
      if(saved?.id===id&&saved.payload_hash===payloadHash)return json(receipt(saved));
      await env.BUCKET.delete(objectKey);
      if(adminUpload)await env.DB.prepare('DELETE FROM catalogue_overrides WHERE artwork_id = ?').bind('submission-'+id).run();
      if (saved?.payload_hash === payloadHash) return json(receipt(saved));
      if(saved)throw new ApiError(409,'Yêu cầu đã gửi có nội dung khác. Vui lòng đóng rồi mở lại biểu mẫu.');
      throw error;
    }
    return json(receipt({id,reference}), 201);
  }
  if (path === '/api/admin/submissions' && request.method === 'GET') {
    const result = await env.DB.prepare("SELECT * FROM artwork_submissions WHERE submission_origin = 'contributor' ORDER BY created_at DESC LIMIT 50").all();
    return json({ submissions: result.results.map(serialize) });
  }
  const match = /^\/api\/admin\/submissions\/([0-9a-f-]{36})(\/image)?$/.exec(path);
  if (!match) throw new ApiError(404, 'Không tìm thấy hồ sơ.');
  const row = await env.DB.prepare('SELECT * FROM artwork_submissions WHERE id = ?').bind(match[1]).first();
  if (!row) throw new ApiError(404, 'Không tìm thấy hồ sơ.');
  if (match[2] && request.method === 'GET') {
    const object = await env.BUCKET?.get(row.object_key);
    if (!object) throw new ApiError(404, 'Không tìm thấy ảnh.');
    return new Response(object.body, { headers: { 'Content-Type': row.content_type, 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "default-src 'none'" } });
  }
  if (!match[2] && request.method === 'PATCH') {
    let data: any;
    try { data = await request.json(); } catch { throw new ApiError(400, 'Dữ liệu không hợp lệ.'); }
    if (!['pending','reviewing','accepted','rejected'].includes(data.status)) throw new ApiError(400, 'Trạng thái không hợp lệ.');
    if (data.version !== row.version) throw new ApiError(409, 'Hồ sơ đã thay đổi. Vui lòng tải lại.');
    const result = await env.DB.prepare('UPDATE artwork_submissions SET status = ?, admin_note = ?, version = version + 1, updated_at = ? WHERE id = ? AND version = ?').bind(data.status, clean(data.adminNote,2000), new Date().toISOString(), row.id,row.version).run();
    if (!result.meta.changes) throw new ApiError(409, 'Hồ sơ đã thay đổi. Vui lòng tải lại.');
    return json(serialize(await env.DB.prepare('SELECT * FROM artwork_submissions WHERE id = ?').bind(row.id).first()));
  }
  throw new ApiError(405, 'Phương thức không được hỗ trợ.');
}
