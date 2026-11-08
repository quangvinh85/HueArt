export interface VercelBackendConfig { backendUrl?: string; serviceToken?: string; bridgeToken?: string; }
const allowedPath = /^\/api\/(?:health|session|retired-image|order-downloads\/DHT-[0-9]{8}-[A-F0-9]{8}|downloads\/[A-Za-z0-9_.-]{1,2000}|site-stats|homepage-settings|curator|contact-settings|payment-settings|order-payment\/DHT-[0-9]{8}-[A-F0-9]{8}(?:\/report)?|catalog(?:\/[0-9a-f-]{36}\/(?:image|preview))?|orders|submissions|admin-auth\/(?:login|logout|change-password)|admin\/(?:security(?:\/(?:setup|enable|disable))?|artworks|zalo-notifications(?:\/(?:test|recipient|[0-9a-f-]{36}\/retry))?|contact-settings|homepage-settings|payment-settings|catalog(?:\/[a-z0-9-]{1,100})?|orders(?:\/[0-9a-f-]{36})?|submissions(?:\/[0-9a-f-]{36}(?:\/(?:image|original|previews))?)?))$/;
const json=(error:string,status:number)=>Response.json({error},{status,headers:{'Cache-Control':'no-store'}});
export const MAX_VERCEL_BODY=4*1024*1024;

export async function proxyApi(request:Request,config:VercelBackendConfig,send:typeof fetch=fetch):Promise<Response>{
  const incoming=new URL(request.url);
  if(!allowedPath.test(incoming.pathname))return json('Không tìm thấy chức năng này.',404);
  if(!['GET','POST','PATCH'].includes(request.method))return json('Phương thức không được hỗ trợ.',405);
  const unsafe=request.method!=='GET';
  if(unsafe&&request.headers.get('Origin')!==incoming.origin)return json('Nguồn gửi yêu cầu không hợp lệ.',403);
  let backend:URL;
  try{
    backend=new URL(config.backendUrl||'');
    if(backend.protocol!=='https:'||backend.username||backend.password||backend.search||backend.hash||backend.pathname!=='/'||!config.serviceToken||!/^[0-9a-f]{64}$/.test(config.bridgeToken||''))throw new Error('Invalid backend config');
  }catch{return json('Backend Vercel chưa được cấu hình đầy đủ. Vui lòng liên hệ quản trị viên.',503);}
  const headers=new Headers({
    Accept:request.headers.get('Accept')||'application/json',
    'OAI-Sites-Authorization':'Bearer '+config.serviceToken,
    Authorization:'Bearer '+config.bridgeToken,
  });
  const checkoutKey=request.headers.get('X-HueArt-Checkout-Key')||'';
  if(/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(checkoutKey))headers.set('X-HueArt-Checkout-Key',checkoutKey);
  const contentType=request.headers.get('Content-Type');if(contentType)headers.set('Content-Type',contentType);
  const adminCookie=request.headers.get('Cookie')?.split(';').map(part=>part.trim()).find(part=>/^__Host-hueart_admin=[0-9a-f]{64}$/.test(part));
  if(adminCookie)headers.set('Cookie',adminCookie);
  const ip=(request.headers.get('x-vercel-forwarded-for')||request.headers.get('x-forwarded-for')||'').split(',')[0].trim();
  if(ip.length<=64&&/^[0-9a-f:.]+$/i.test(ip))headers.set('X-HueArt-Client-IP',ip);
  if(unsafe)headers.set('Origin',backend.origin);
  let body:ArrayBuffer|undefined;
  if(unsafe){
    if(Number(request.headers.get('Content-Length'))>MAX_VERCEL_BODY)return json('Ảnh gửi từ Vercel tối đa 3 MB.',413);
    body=await request.arrayBuffer();
    if(body.byteLength>MAX_VERCEL_BODY)return json('Ảnh gửi từ Vercel tối đa 3 MB.',413);
  }
  backend.pathname=incoming.pathname;backend.search=incoming.search;
  try{
    const upstream=await send(backend,{method:request.method,headers,body,redirect:'manual',signal:AbortSignal.timeout(30000)});
    if(upstream.status>=300&&upstream.status<400)return json('Không kết nối được backend. Vui lòng kiểm tra cấu hình Vercel.',502);
    const outputHeaders=new Headers({'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
    for(const name of ['Content-Type','Content-Disposition','Referrer-Policy']){const value=upstream.headers.get(name);if(value)outputHeaders.set(name,value);}
    const cookies=typeof upstream.headers.getSetCookie==='function'?upstream.headers.getSetCookie():[upstream.headers.get('Set-Cookie')||''];
    for(const value of cookies)if(value.startsWith('__Host-hueart_admin='))outputHeaders.append('Set-Cookie',value);
    return new Response(upstream.body,{status:upstream.status,headers:outputHeaders});
  }catch{return json('Máy chủ tạm thời chưa phản hồi. Vui lòng thử lại; giỏ hàng của bạn vẫn được giữ.',503);}
}
