import {useEffect,useState} from 'react';
import {requestApi} from './ordersApi';
import {useShopLanguage} from './language';
export default function AdminSecurity(){
 const {tr}=useShopLanguage();
 const [state,setState]=useState<{enabled:boolean;recoveryRemaining:number}|null>(null);
 const [password,setPassword]=useState(''),[code,setCode]=useState(''),[secret,setSecret]=useState(''),[recovery,setRecovery]=useState<string[]>([]),[busy,setBusy]=useState(false),[error,setError]=useState('');
 useEffect(()=>{void requestApi<{enabled:boolean;recoveryRemaining:number}>('/api/admin/security').then(setState).catch(e=>setError(e.message));},[]);
 async function act(action:'setup'|'enable'|'disable'){
  setBusy(true);setError('');try{
   const result=await requestApi<{secret?:string;enabled?:boolean;recoveryCodes?:string[]}>('/api/admin/security/'+action,{method:'POST',body:JSON.stringify({password,code})});
   if(result.secret)setSecret(result.secret);
   else {setState({enabled:!!result.enabled,recoveryRemaining:result.recoveryCodes?.length||0});setSecret('');setRecovery(result.recoveryCodes||[]);setPassword('');setCode('');}
  }catch(e){setError(e instanceof Error?e.message:tr('Không lưu được cấu hình.'));}finally{setBusy(false);}
 }
 return <section className="admin-editor"><h1>{tr('Bảo mật quản trị')}</h1><p>{tr('Xác thực hai bước (2FA)')}: <strong>{state?tr(state.enabled?'Đang bật':'Chưa bật'):tr('Đang tải…')}</strong></p><p>{tr('Dùng ứng dụng xác thực như Google Authenticator, Microsoft Authenticator hoặc 1Password. Khi bật, đăng nhập cần mật khẩu và mã xác thực.')}</p>
 {state?.enabled&&<p>{tr('Mã dự phòng còn lại')}: {state.recoveryRemaining}</p>}
 {recovery.length>0&&<div role="status"><h3>{tr('Lưu mã dự phòng ngay')}</h3><p>{tr('Chỉ hiển thị một lần. Mỗi mã dùng một lần để đăng nhập khi mất ứng dụng xác thực. Cất giữ ở nơi riêng tư.')}</p><pre style={{userSelect:'text',whiteSpace:'pre-wrap'}}>{recovery.join('\n')}</pre><button className="shop-secondary" onClick={()=>setRecovery([])}>{tr('Tôi đã lưu mã')}</button></div>}
 <form onSubmit={e=>{e.preventDefault();void act(state?.enabled?'disable':secret?'enable':'setup');}}>
 <label>{tr('Mật khẩu hiện tại')}<input type="password" autoComplete="current-password" required maxLength={256} value={password} disabled={busy||!state} onChange={e=>setPassword(e.target.value)}/></label>
 {secret&&<div><p>{tr('Trong ứng dụng xác thực, thêm tài khoản bằng khóa thiết lập này. Không chia sẻ khóa.')}</p><code style={{userSelect:'text',overflowWrap:'anywhere'}}>{secret}</code></div>}
 {(secret||state?.enabled)&&<label>{tr(state?.enabled?'Mã xác thực hoặc mã dự phòng':'Mã 6 số từ ứng dụng xác thực')}<input autoComplete="one-time-code" required maxLength={19} value={code} disabled={busy} onChange={e=>setCode(e.target.value)}/></label>}
 {error&&<p role="alert" className="shop-order-error">{error}</p>}<button className="shop-primary" disabled={busy||!state}>{tr(busy?'Đang xử lý…':state?.enabled?'Tắt 2FA':secret?'Xác nhận bật 2FA':'Thiết lập 2FA')}</button>
 </form></section>;
}
