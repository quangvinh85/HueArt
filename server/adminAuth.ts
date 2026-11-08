import {getAdminSecurity,authenticateSecondFactor} from './twoFactor';
import { vercelBridge } from './vercelBridge';
import { ApiError } from './orders';
const COOKIE_NAME = '__Host-hueart_admin';
const SESSION_SECONDS = 8 * 60 * 60;
export interface AuthEnv { SUB_ADMIN_USERNAME?:string; SUB_ADMIN_PASSWORD_HASH?:string; ADMIN_EMAIL: string; ADMIN_USERNAME?: string; ADMIN_PASSWORD_HASH?: string; VERCEL_BRIDGE_TOKEN?: string; DB: any; }
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

export async function hashPassword(password:string){
  const salt=crypto.getRandomValues(new Uint8Array(24));
  const material=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
  const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt,iterations:100000,hash:'SHA-256'},material,256);
  const hex=(bytes:Uint8Array)=>Array.from(bytes).map(b=>b.toString(16).padStart(2,'0')).join('');
  return 'pbkdf2-sha256$100000$'+hex(salt)+'$'+hex(new Uint8Array(bits));
}
async function bootstrapSubAdmin(env:AuthEnv){
  if(!env.SUB_ADMIN_USERNAME||!env.SUB_ADMIN_PASSWORD_HASH)return;
  if(!/^[A-Za-z0-9._-]{3,64}$/.test(env.SUB_ADMIN_USERNAME)||env.SUB_ADMIN_USERNAME.toLowerCase()===env.ADMIN_USERNAME?.toLowerCase())throw new ApiError(503,'Cấu hình tài khoản phụ chưa hợp lệ.');
  const now=new Date().toISOString();
  // One-time provisioning: an existing row (including a changed password or disabled account) is never overwritten.
  await env.DB.prepare('INSERT OR IGNORE INTO staff_accounts (id,username,password_hash,must_change_password,disabled,created_at,updated_at) VALUES (?, ?, ?, 1, 0, ?, ?)').bind('sub-admin',env.SUB_ADMIN_USERNAME,env.SUB_ADMIN_PASSWORD_HASH,now,now).run();
}
export async function adminIdentity(request: Request, env: AuthEnv) {
  const bridge=vercelBridge(request,env);
  const userId=bridge?.userId || request.headers.get('oai-authenticated-user-id');
  const email=request.headers.get('oai-authenticated-user-email');
  const ownerAuthenticated=Boolean(bridge || (userId&&env.ADMIN_EMAIL&&email?.toLowerCase()===env.ADMIN_EMAIL.toLowerCase()));
  let isAdmin=false,role:'admin'|'sub-admin'|null=null,accountId:string|null=null,mustChangePassword=false,username:string|null=null;
  const token=cookieToken(request);
  if(ownerAuthenticated&&token&&env.ADMIN_USERNAME&&env.ADMIN_PASSWORD_HASH&&env.DB){
    const session=await env.DB.prepare('SELECT user_id, expires_at, password_version, security_epoch, account_id FROM admin_sessions WHERE token_hash = ?').bind(await hashToken(token)).first();
    const security=await getAdminSecurity(env);
    if(session&&Number(session.security_epoch||0)===security.epoch&&session.user_id===userId&&session.expires_at>Math.floor(Date.now()/1000)){
      if(session.account_id){
        const account=await env.DB.prepare('SELECT * FROM staff_accounts WHERE id = ?').bind(session.account_id).first();
        if(account&&!account.disabled&&session.password_version===await hashToken(account.password_hash)){
          isAdmin=true;role='sub-admin';accountId=account.id;mustChangePassword=Boolean(account.must_change_password);username=account.username;
        }
      }else if(session.password_version===await hashToken(env.ADMIN_PASSWORD_HASH)){isAdmin=true;role='admin';username=env.ADMIN_USERNAME;}
    }
  }
  return {authenticated:Boolean(userId),ownerAuthenticated,isAdmin,role,accountId,mustChangePassword,username,userId,rateKey:bridge?.rateKey || userId || request.headers.get('CF-Connecting-IP') || 'anonymous'};
}
async function createSession(request:Request,env:AuthEnv,actor:Awaited<ReturnType<typeof adminIdentity>>,passwordHash:string,epoch:number,account:any=null){
  const now=Math.floor(Date.now()/1000),token=Array.from(crypto.getRandomValues(new Uint8Array(32))).map(value=>value.toString(16).padStart(2,'0')).join('');
  await env.DB.prepare('INSERT INTO admin_sessions (token_hash, user_id, password_version, created_at, expires_at, security_epoch, account_id) VALUES (?, ?, ?, ?, ?, ?, ?)').bind(await hashToken(token),actor.userId,await hashToken(passwordHash),now,now+SESSION_SECONDS,epoch,account?.id||null).run();
  await env.DB.prepare('DELETE FROM admin_sessions WHERE expires_at <= ?').bind(now).run();
  return authResponse({isAdmin:true,role:account?'sub-admin':'admin',mustChangePassword:Boolean(account?.must_change_password)},request,env,token,SESSION_SECONDS);
}
export async function adminAuth(request: Request,env:AuthEnv,actor:Awaited<ReturnType<typeof adminIdentity>>,body:any) {
  const path=new URL(request.url).pathname;
  if(!actor.ownerAuthenticated)throw new ApiError(actor.authenticated?403:401,'Vui lòng đăng nhập bằng tài khoản chủ website trước.');
  if(path==='/api/admin-auth/logout'){
    const token=cookieToken(request);
    if(token)await env.DB.prepare('DELETE FROM admin_sessions WHERE token_hash = ?').bind(await hashToken(token)).run();
    return authResponse({isAdmin:false},request,env,'',0);
  }
  if(path==='/api/admin-auth/change-password'){
    if(!actor.isAdmin||actor.role!=='sub-admin'||!actor.accountId)throw new ApiError(403,'Chức năng này dành cho tài khoản sub-admin đã đăng nhập.');
    const password=typeof body?.password==='string'?body.password:'',next=typeof body?.newPassword==='string'?body.newPassword:'';
    if(password.length>256||next.length<12||next.length>128||next===password)throw new ApiError(400,'Mật khẩu mới phải khác mật khẩu cũ và có từ 12 đến 128 ký tự.');
    const attemptKey=await hashToken(actor.rateKey+':change-password');
    const now=Math.floor(Date.now()/1000);
    const attempts=await env.DB.prepare('INSERT INTO admin_login_attempts (attempt_key, failures, window_started) VALUES (?, 1, ?) ON CONFLICT(attempt_key) DO UPDATE SET failures = CASE WHEN window_started <= ? THEN 1 ELSE failures + 1 END, window_started = CASE WHEN window_started <= ? THEN ? ELSE window_started END RETURNING failures').bind(attemptKey,now,now-900,now-900,now).first();
    if(Number(attempts.failures)>5)throw new ApiError(429,'Vui lòng thử lại sau 15 phút.');
    const account=await env.DB.prepare('SELECT * FROM staff_accounts WHERE id = ?').bind(actor.accountId).first();
    if(!account||account.disabled||!await verifyPassword(password,account.password_hash))throw new ApiError(401,'Mật khẩu hiện tại không đúng.');
    const passwordHash=await hashPassword(next);
    const changed=await env.DB.prepare('UPDATE staff_accounts SET password_hash = ?, must_change_password = 0, updated_at = ? WHERE id = ? AND password_hash = ? AND disabled = 0').bind(passwordHash,new Date().toISOString(),account.id,account.password_hash).run();
    if(!changed.meta.changes)throw new ApiError(409,'Tài khoản đã thay đổi. Vui lòng đăng nhập lại.');
    await env.DB.prepare('DELETE FROM admin_sessions WHERE account_id = ?').bind(account.id).run();
    await env.DB.prepare('DELETE FROM admin_login_attempts WHERE attempt_key = ?').bind(attemptKey).run();
    return createSession(request,env,actor,passwordHash,(await getAdminSecurity(env)).epoch,{...account,must_change_password:0});
  }
  if(path!=='/api/admin-auth/login')throw new ApiError(404,'Không tìm thấy chức năng này.');
  if(!env.ADMIN_USERNAME||!env.ADMIN_PASSWORD_HASH)throw new ApiError(503,'Cấu hình đăng nhập chưa sẵn sàng.');
  const username=typeof body?.username==='string'?body.username.trim():'',password=typeof body?.password==='string'?body.password:'';
  if(username.length>100||password.length>256)throw new ApiError(400,'Tên đăng nhập hoặc mật khẩu không đúng.');
  const now=Math.floor(Date.now()/1000),attemptKey=await hashToken(actor.rateKey+':admin-login');
  const attempts=await env.DB.prepare('INSERT INTO admin_login_attempts (attempt_key, failures, window_started) VALUES (?, 1, ?) ON CONFLICT(attempt_key) DO UPDATE SET failures = CASE WHEN window_started <= ? THEN 1 ELSE failures + 1 END, window_started = CASE WHEN window_started <= ? THEN ? ELSE window_started END RETURNING failures').bind(attemptKey,now,now-900,now-900,now).first();
  if(Number(attempts.failures)>5)throw new ApiError(429,'Bạn đã nhập sai nhiều lần. Vui lòng thử lại sau 15 phút.');
  let account:any=null,passwordHash=env.ADMIN_PASSWORD_HASH,epoch:number|null=null;
  const owner=timingEqual(username,env.ADMIN_USERNAME);
  if(!owner){
    await bootstrapSubAdmin(env);
    account=await env.DB.prepare('SELECT * FROM staff_accounts WHERE username = ? COLLATE NOCASE').bind(username).first();
    if(account)passwordHash=account.password_hash;
  }
  const validPassword=await verifyPassword(password,passwordHash);
  if(!validPassword||(!owner&&(!account||account.disabled)))throw new ApiError(401,'Tên đăng nhập hoặc mật khẩu không đúng.');
  epoch=owner?await authenticateSecondFactor(env,body?.otp):(await getAdminSecurity(env)).epoch;
  if(epoch===null)throw new ApiError(401,'Mã xác thực không đúng hoặc đã dùng.');
  await env.DB.prepare('DELETE FROM admin_login_attempts WHERE attempt_key = ?').bind(attemptKey).run();
  return createSession(request,env,actor,passwordHash,epoch,account);
}
