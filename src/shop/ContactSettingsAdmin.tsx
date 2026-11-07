import ZaloNotificationsAdmin from './ZaloNotificationsAdmin';
import {useEffect,useState} from 'react';
import {ExternalLink} from 'lucide-react';
import {contactLinks,defaultContactSettings,type ContactSettings} from './contactSettings';
import {requestApi} from './ordersApi';
import {useShopLanguage} from './language';
export default function ContactSettingsAdmin(){
 const {tr}=useShopLanguage();const [settings,setSettings]=useState<ContactSettings>(defaultContactSettings),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState(''),[saved,setSaved]=useState(false);
 const load=async()=>{setError('');setLoading(true);try{setSettings(await requestApi<ContactSettings>('/api/admin/contact-settings'));}catch(e){setError(e instanceof Error?e.message:tr('Không tải được cài đặt.'));}finally{setLoading(false);}};
 useEffect(()=>{void load();},[]);
 const save=async(e:React.FormEvent)=>{e.preventDefault();if(busy||loading)return;setBusy(true);setError('');setSaved(false);try{setSettings(await requestApi<ContactSettings>('/api/admin/contact-settings',{method:'PATCH',body:JSON.stringify(settings)}));setSaved(true);try{localStorage.setItem('hueart_contact_settings_updated',String(Date.now()));}catch{}}catch(e){setError(e instanceof Error?e.message:tr('Không lưu được cài đặt.'));}finally{setBusy(false);}};
 const links=contactLinks({...settings,zaloEnabled:true,messengerEnabled:true});
 return <section><div className="admin-heading"><div><h1>{tr('Cài đặt chat')}</h1><p>{tr('Cấu hình Zalo và Facebook Messenger hiển thị ở góc phải cửa hàng.')}</p></div><button type="button" className="shop-secondary" disabled={loading||busy} onClick={()=>void load()}>{tr('Làm mới')}</button></div>
  {error&&<p className="shop-order-error" role="alert">{tr(error)}</p>}{saved&&<p className="admin-success" role="status">{tr('Đã lưu cài đặt chat.')}</p>}
  {loading?<p>{tr('Đang tải…')}</p>:<form className="admin-payment-settings admin-editor" onSubmit={save}>
   <h2>Zalo</h2><label className="admin-visible-toggle"><input type="checkbox" checked={settings.zaloEnabled} disabled={busy} onChange={e=>setSettings({...settings,zaloEnabled:e.target.checked})}/>{tr('Hiển thị nút chat Zalo')}</label>
   <label>{tr('Số điện thoại Zalo của admin')}<input type="tel" autoComplete="tel" maxLength={30} required={settings.zaloEnabled} placeholder="09xxxxxxxx / +84xxxxxxxxx" value={settings.zaloPhone} disabled={busy} onChange={e=>setSettings({...settings,zaloPhone:e.target.value})}/></label>
   {links.zalo&&<a className="shop-text-button" href={links.zalo} target="_blank" rel="noopener noreferrer">{tr('Mở thử Zalo')} <ExternalLink size={14}/></a>}
   <h2>Facebook Messenger</h2><label className="admin-visible-toggle"><input type="checkbox" checked={settings.messengerEnabled} disabled={busy} onChange={e=>setSettings({...settings,messengerEnabled:e.target.checked})}/>{tr('Hiển thị nút chat Messenger')}</label>
   <label>{tr('Liên kết Facebook / Messenger hoặc ID trang')}<input type="text" maxLength={500} required={settings.messengerEnabled} autoCapitalize="none" spellCheck={false} placeholder="https://m.me/ten.trang" value={settings.messengerUrl} disabled={busy} onChange={e=>setSettings({...settings,messengerUrl:e.target.value})}/></label>
   <p className="admin-note">{tr('Nhập link m.me, link trang Facebook hoặc ID/username trang. Website sẽ mở Messenger tới tài khoản này.')}</p>
   {links.messenger&&<a className="shop-text-button" href={links.messenger} target="_blank" rel="noopener noreferrer">{tr('Mở thử Messenger')} <ExternalLink size={14}/></a>}
   <p className="admin-note">{tr('Bật từng kênh rồi lưu. Khách bấm nút để mở ứng dụng hoặc trang chat tương ứng.')}</p>
   <button type="submit" className="shop-primary" disabled={busy}>{tr(busy?'Đang lưu…':'Lưu thay đổi')}</button>
  </form>}
 <ZaloNotificationsAdmin />
 </section>;
}
