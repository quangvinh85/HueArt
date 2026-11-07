import {getAdminSecurity,authenticateSecondFactor} from './twoFactor';
import { vercelBridge } from './vercelBridge';
import { ApiError } from './orders';
const COOKIE_NAME = '__Host-hueart_admin';
const SESSION_SECONDS = 8 * 60 * 60;
interface AuthEnv { ADMIN_EMAIL: string; ADMIN_USERNAME?: string; ADMIN_PASSWORD_HASH?: string; VERCEL_BRIDGE_TOKEN?: string; DB: any; }
export const hashToken = async (value: string) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)))).map(byte=>byte.toString(16).padStart(2,'0')).join('');
const hexBytes = (hex: string) => new Uint8Array(hex.match(/.{2}/g)!.map(value=>Number.parseInt(value,16)));
const timingEqual = (left: string, right: string) => {
  const length = Math.max(left.length, right.length);
  let difference = left.length ^ right.length;
  for(let index=0;index<length;index++) difference |= (left.charCodeAt(index)||0) ^ (right.charCodeAt(index)||0);
  return difference === 0;
};
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algorithm,iterations,salt,expected] = stored.split('$');
  if(algorithm!=='pbkdf2-sha256'||iterations!=='100000'||!/^[0-9a-f]{48}$/.test(salt||'')||!/^[0-9a-f]{64}$/.test(expected||'')) throw new ApiError(503,'Cấu hình đăng nhập chưa sẵn sàng.');
  const material = await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
  const bits = await crypto.subtle.deriveBits({name:'PBKDF2',salt:hexBytes(salt),iterations:100000,hash:'SHA-256'},material,256);
  const actual = Array.from(new Uint8Array(bits)).map(byte=>byte.toString(16).padStart(2,'0')).join('');
  return timingEqual(actual,expected);
}
export const cookieToken = (request: Request) => {
  const value = request.headers.get('Cookie')?.split(';').map(part=>part.trim()).find(part=>part.startsWith(COOKIE_NAME+'='))?.slice(COOKIE_NAME.length+1) || '';
  return /^[0-9a-f]{64}$/.test(value) ? value : '';
};
const cookie = (value:string,maxAge:number,bridge=false) => `${COOKIE_NAME}=${value}; Path=/; HttpOnly; Secure; ${bridge?'SameSite=Lax':'SameSite=None; Partitioned'}; Max-Age=${maxAge}`;
function authResponse(data:unknown,request:Request,env:AuthEnv,token:string,age:number){const result=response(data);const bridge=Boolean(vercelBridge(request,env));if(bridge)result.headers.append('Set-Cookie',cookie('',0));result.headers.append('Set-Cookie',cookie(token,age,bridge));return result;}
const response = (data:unknown,headers:Record<string,string>={}) => Response.json(data,{headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});

export async function adminIdentity(request: Request, env: AuthEnv) {
  const bridge=vercelBridge(request,env);
  const userId=bridge?.userId || request.headers.get('oai-authenticated-user-id');
  const email=request.headers.get('oai-authenticated-user-email');
  const ownerAuthenticated=Boolean(bridge || (userId&&env.ADMIN_EMAIL&&email?.toLowerCase()===env.ADMIN_EMAIL.toLowerCase()));
  let isAdmin=false;
  const token=cookieToken(request);
  if(ownerAuthenticated&&token&&env.ADMIN_USERNAME&&env.ADMIN_PASSWORD_HASH&&env.DB){
    const session=await env.DB.prepare('SELECT user_id, expires_at, password_version, security_epoch FROM admin_sessions WHERE token_hash = ?').bind(await hashToken(token)).first();
    const security=await getAdminSecurity(env);
    isAdmin=Boolean(session&&Number(session.security_epoch||0)===security.epoch&&session.user_id===userId&&session.expires_at>Math.floor(Date.now()/1000)&&session.password_version===await hashToken(env.ADMIN_PASSWORD_HASH));
  }
  return {authenticated:Boolean(userId),ownerAuthenticated,isAdmin,userId,rateKey:bridge?.rateKey || userId || request.headers.get('CF-Connecting-IP') || 'anonymous'};
}

export async function adminAuth(request: Request,env:AuthEnv,actor:Awaited<ReturnType<typeof adminIdentity>>,body:any) {
  const path=new URL(request.url).pathname;
  if(!actor.ownerAuthenticated)throw new ApiError(actor.authenticated?403:401,'Vui lòng đăng nhập bằng tài khoản chủ website trước.');
  if(path==='/api/admin-auth/logout'){
    const token=cookieToken(request);
    if(token)await env.DB.prepare('DELETE FROM admin_sessions WHERE token_hash = ?').bind(await hashToken(token)).run();
    return authResponse({isAdmin:false},request,env,'',0);
  }
  if(path!=='/api/admin-auth/login')throw new ApiError(404,'Không tìm thấy chức năng này.');
  if(!env.ADMIN_USERNAME||!env.ADMIN_PASSWORD_HASH)throw new ApiError(503,'Cấu hình đăng nhập chưa sẵn sàng.');
  const username=typeof body?.username==='string'?body.username.trim():'';
  const password=typeof body?.password==='string'?body.password:'';
  if(username.length>100||password.length>256)throw new ApiError(400,'Tên đăng nhập hoặc mật khẩu không đúng.');
  const now=Math.floor(Date.now()/1000);
  const attemptKey=await hashToken(actor.rateKey+':admin-login');
  const attempts=await env.DB.prepare('INSERT INTO admin_login_attempts (attempt_key, failures, window_started) VALUES (?, 1, ?) ON CONFLICT(attempt_key) DO UPDATE SET failures = CASE WHEN window_started <= ? THEN 1 ELSE failures + 1 END, window_started = CASE WHEN window_started <= ? THEN ? ELSE window_started END RETURNING failures').bind(attemptKey,now,now-900,now-900,now).first();
  if(Number(attempts.failures)>5)throw new ApiError(429,'Bạn đã nhập sai nhiều lần. Vui lòng thử lại sau 15 phút.');
  const validPassword=await verifyPassword(password,env.ADMIN_PASSWORD_HASH);
  if(!validPassword||!timingEqual(username,env.ADMIN_USERNAME))throw new ApiError(401,'Tên đăng nhập hoặc mật khẩu không đúng.');
  const epoch=await authenticateSecondFactor(env,body.otp);if(epoch===null)throw new ApiError(401,'Mã xác thực không đúng hoặc đã dùng.');
  const token=Array.from(crypto.getRandomValues(new Uint8Array(32))).map(value=>value.toString(16).padStart(2,'0')).join('');
  await env.DB.prepare('INSERT INTO admin_sessions (token_hash, user_id, password_version, created_at, expires_at, security_epoch) VALUES (?, ?, ?, ?, ?, ?)').bind(await hashToken(token),actor.userId,await hashToken(env.ADMIN_PASSWORD_HASH),now,now+SESSION_SECONDS,epoch).run();
  await env.DB.prepare('DELETE FROM admin_login_attempts WHERE attempt_key = ?').bind(attemptKey).run();
  await env.DB.prepare('DELETE FROM admin_sessions WHERE expires_at <= ?').bind(now).run();
  return authResponse({isAdmin:true},request,env,token,SESSION_SECONDS);
}
