import {useEffect,useState} from 'react';
import {requestApi} from './ordersApi';
import {useShopLanguage} from './language';
interface Delivery {order_id:string;order_number:string;status:string;last_error:string;sent_at:string|null;last_attempt_at:string|null;attempts:number}
interface Settings {enabled:boolean;chatId:string;tokenConfigured:boolean;version:number;deliveries?:Delivery[]}
const statusLabels:Record<string,string>={pending:'Chờ gửi',sending:'Đang gửi',sent:'Đã gửi',failed:'Gửi lỗi',disabled:'Thông báo đang tắt'};
export default function ZaloNotificationsAdmin(){
 const {tr}=useShopLanguage();
 const [settings,setSettings]=useState<Settings|null>(null),[token,setToken]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const load=async()=>setSettings(await requestApi<Settings>('/api/admin/zalo-notifications'));
 useEffect(()=>{let active=true;requestApi<Settings>('/api/admin/zalo-notifications').then(data=>{if(active)setSettings(data);}).catch(()=>{if(active)setError('Không tải được cài đặt thông báo.');});return ()=>{active=false;};},[]);
 const action=async(task:()=>Promise<void>)=>{if(busy)return;setBusy(true);setError('');setNotice('');try{await task();}catch(e){setError(e instanceof Error?e.message:'Không xử lý được yêu cầu.');}finally{setBusy(false);}};
 return <section className="admin-editor admin-payment-settings"><h2>{tr('Thông báo đơn hàng qua Zalo')}</h2>
  <p className="admin-note">{tr('Nhận chi tiết đơn hàng trên Zalo cá nhân qua Zalo Bot. Số điện thoại chat không đủ để tự gửi tin.')}</p>
  <ol className="admin-note"><li>{tr('Trong Zalo, tìm Zalo Bot Manager → Tạo bot. Zalo sẽ gửi Bot Token cho bạn.')} <a href="https://bot.zapps.me/docs/create-bot/" target="_blank" rel="noopener noreferrer">{tr('Hướng dẫn tạo bot')}</a></li><li>{tr('Nhập Bot Token bên dưới và lưu. Mở bot bằng tài khoản Zalo của admin, gửi một tin nhắn riêng, rồi bấm Nhận tài khoản Zalo.')}</li><li>{tr('Lưu người nhận, gửi thử để kiểm tra đúng tài khoản, sau đó bật thông báo và lưu lại.')}</li></ol>
  {error&&<p className="shop-order-error" role="alert">{tr(error)}</p>}{notice&&<p className="admin-success" role="status">{tr(notice)}</p>}
  {!settings?<button className="shop-secondary" disabled={busy} onClick={()=>void action(load)}>{tr('Tải lại')}</button>:<>
   <form onSubmit={e=>{e.preventDefault();void action(async()=>{const saved=await requestApi<Settings>('/api/admin/zalo-notifications',{method:'PATCH',body:JSON.stringify({...settings,token:token.trim()||undefined})});setSettings({...saved,deliveries:settings.deliveries});setToken('');setNotice('Đã lưu cài đặt thông báo.');});}}>
    <label>{tr('Bot Token')}<input type="password" autoComplete="new-password" spellCheck={false} maxLength={300} value={token} disabled={busy} placeholder={tr(settings.tokenConfigured?'Đã lưu token bảo mật. Để trống để giữ nguyên.':'Nhập Bot Token do Zalo cung cấp')} onChange={e=>setToken(e.target.value)}/></label>
    <label>{tr('ID tài khoản nhận thông báo')}<input value={settings.chatId} maxLength={150} disabled={busy} autoComplete="off" onChange={e=>setSettings({...settings,chatId:e.target.value.trim()})}/></label>
    <button className="shop-secondary" type="button" disabled={busy||!settings.tokenConfigured} onClick={()=>void action(async()=>{const recipient=await requestApi<{chatId:string;name:string}>('/api/admin/zalo-notifications/recipient',{method:'POST'});setSettings({...settings,chatId:recipient.chatId});setNotice(tr('Đã nhận tài khoản: {0}. Vui lòng lưu và gửi thử.',recipient.name));})}>{tr('Nhận tài khoản Zalo')}</button>
    <label className="admin-visible-toggle"><input type="checkbox" checked={settings.enabled} disabled={busy} onChange={e=>setSettings({...settings,enabled:e.target.checked})}/>{tr('Tự gửi chi tiết khi khách đặt hàng thành công')}</label>
    <div className="admin-toolbar"><button className="shop-primary" disabled={busy}>{tr(busy?'Đang lưu…':'Lưu cài đặt thông báo')}</button><button className="shop-secondary" type="button" disabled={busy||!settings.tokenConfigured||!settings.chatId} onClick={()=>void action(async()=>{await requestApi('/api/admin/zalo-notifications/test',{method:'POST'});setNotice('Đã gửi tin thử. Kiểm tra Zalo của admin.');})}>{tr('Gửi tin thử')}</button></div>
   </form>
   <h3>{tr('Thông báo gần đây')}</h3><p className="admin-note">{tr('Tin lỗi không làm mất đơn hàng. Kiểm tra Zalo trước khi gửi lại vì lỗi mạng có thể xảy ra sau khi tin đã được nhận.')}</p>
   <button className="shop-secondary" disabled={busy} onClick={()=>void action(load)}>{tr('Làm mới')}</button>
   {!settings.deliveries?.length?<p className="admin-note">{tr('Chưa có thông báo đơn hàng.')}</p>:<ul className="admin-zalo-deliveries">{settings.deliveries.map(item=><li key={item.order_id}><div><strong>{item.order_number}</strong><p>{tr(statusLabels[item.status]||item.status)}</p>{item.last_error&&<p className="shop-order-error">{tr(item.last_error)}</p>}</div>{(['failed','disabled','pending'].includes(item.status)||(item.status==='sending'&&item.last_attempt_at&&Date.parse(item.last_attempt_at)<Date.now()-10*60000))&&<button className="shop-secondary" disabled={busy||!settings.enabled} onClick={()=>void action(async()=>{await requestApi(`/api/admin/zalo-notifications/${item.order_id}/retry`,{method:'POST'});await load();})}>{tr('Gửi lại')}</button>}</li>)}</ul>}
  </>}
 </section>;
}
