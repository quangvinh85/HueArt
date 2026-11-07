import {useEffect,useState} from 'react';
import {requestApi} from './ordersApi';
import {useShopLanguage} from './language';
interface State {enabled:boolean;tokenConfigured:boolean;chatId:string;deliveries:{status:string}[]}
export default function ZaloOrderNotice({onConfigure}:{onConfigure:()=>void}){
 const {tr}=useShopLanguage();
 const [state,setState]=useState<State|null>(null),[error,setError]=useState(false);
 useEffect(()=>{
  let active=true;
  const load=()=>{void requestApi<State>('/api/admin/zalo-notifications').then(value=>{if(active){setState(value);setError(false);}}).catch(()=>{if(active)setError(true);});};
  load();window.addEventListener('focus',load);return()=>{active=false;window.removeEventListener('focus',load);};
 },[]);
 if(!state&&!error)return null;
 const configured=Boolean(state?.tokenConfigured&&state.chatId),enabled=configured&&state?.enabled;
 const missed=state?.deliveries.filter(item=>['disabled','failed'].includes(item.status)).length||0;
 return <aside className={`admin-zalo-notice ${enabled&&!missed&&!error?'is-enabled':''}`} role="status"><div><strong>{tr(error?'Không kiểm tra được trạng thái Zalo.':!configured?'Chưa kết nối Zalo nhận đơn hàng':!enabled?'Thông báo đơn hàng qua Zalo đang tắt':'Zalo: Đã bật tự gửi thông báo đơn hàng')}</strong>{!enabled&&<p>{tr('Số điện thoại ở nút chat chưa đủ để nhận thông báo tự động. Kết nối Zalo Bot, nhận tài khoản admin, gửi thử rồi bật thông báo.')}</p>}{missed>0&&<p>{tr('Có {0} thông báo chưa gửi trong các đơn gần đây. Sau khi kết nối, mở cài đặt thông báo để gửi lại.',missed)}</p>}</div><button type="button" className="shop-secondary" onClick={onConfigure}>{tr('Cài đặt thông báo Zalo')}</button></aside>;
}
