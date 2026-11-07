import {useEffect,useState} from 'react';
import {useShopLanguage} from './language';
import {requestApi} from './ordersApi';
import {defaultPaymentSettings,type PaymentSettings} from './paymentTypes';
const banks=[['970422','MB Bank'],['970436','Vietcombank'],['970418','BIDV'],['970415','VietinBank'],['970407','Techcombank'],['970416','ACB']];
export default function PaymentSettingsAdmin(){
 const {tr}=useShopLanguage();const [settings,setSettings]=useState<PaymentSettings>(defaultPaymentSettings),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState(''),[saved,setSaved]=useState(false);
 const load=async()=>{setError('');setLoading(true);try{setSettings(await requestApi<PaymentSettings>('/api/admin/payment-settings'));}catch(e){setError(e instanceof Error?e.message:tr('Không tải được cài đặt.'));}finally{setLoading(false);}};
 useEffect(()=>{void load();},[]);
 const save=async(e:React.FormEvent)=>{e.preventDefault();if(busy||loading)return;setBusy(true);setError('');setSaved(false);try{setSettings(await requestApi<PaymentSettings>('/api/admin/payment-settings',{method:'PATCH',body:JSON.stringify(settings)}));setSaved(true);try{localStorage.setItem('hueart_payment_settings_updated',String(Date.now()));}catch{}}catch(e){setError(e instanceof Error?e.message:tr('Không lưu được cài đặt.'));}finally{setBusy(false);}};
 const bankField=(field:keyof PaymentSettings['bank'],value:string)=>setSettings(s=>({...s,bank:{...s.bank,[field]:value}}));
 return <section><div className="admin-heading"><div><h1>{tr('Cài đặt thanh toán')}</h1><p>{tr('Tài khoản nhận tiền, phương thức thanh toán và tỷ giá USD/VND.')}</p></div><button className="shop-secondary" disabled={loading||busy} onClick={()=>void load()}>{tr('Làm mới')}</button></div>
  {error&&<p className="shop-order-error" role="alert">{tr(error)}</p>}{saved&&<p className="admin-success" role="status">{tr('Đã lưu cài đặt thanh toán.')}</p>}
  {loading?<p>{tr('Đang tải…')}</p>:<form className="admin-payment-settings admin-editor" onSubmit={save}>
   <label>{tr('Tỷ giá: 1 USD bằng bao nhiêu VND?')}<input type="number" min={1000} max={1000000} step={1} required value={settings.exchangeRate} disabled={busy} onChange={e=>setSettings({...settings,exchangeRate:Number(e.target.value)})}/></label><p className="admin-note">{tr('Mặc định 26.000 VND/USD. Đơn mới dùng tỷ giá mới; đơn cũ giữ tỷ giá lúc đặt.')}</p>
   <label className="admin-visible-toggle"><input type="checkbox" checked={settings.transferEnabled} disabled={busy} onChange={e=>setSettings({...settings,transferEnabled:e.target.checked})}/>{tr('Bật chuyển khoản và VietQR')}</label>
   <label>{tr('Chọn ngân hàng')}<select aria-label={tr('Chọn ngân hàng')} disabled={busy} value={banks.some(([bin])=>bin===settings.bank.bankBin)?settings.bank.bankBin:'other'} onChange={e=>{const bank=banks.find(([bin])=>bin===e.target.value);if(bank)setSettings({...settings,bank:{...settings.bank,bankBin:bank[0],bankName:bank[1]}});else setSettings({...settings,bank:{...settings.bank,bankBin:'',bankName:''}});}}><option value="other">{tr('Ngân hàng khác / Nhập thông tin')}</option>{banks.map(([bin,name])=><option key={bin} value={bin}>{name}</option>)}</select></label>
   <label>{tr('Tên ngân hàng')}<input maxLength={100} required={settings.transferEnabled} value={settings.bank.bankName} disabled={busy} onChange={e=>bankField('bankName',e.target.value)}/></label>
   <label>{tr('Mã BIN ngân hàng (6 chữ số)')}<input inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required={settings.transferEnabled} value={settings.bank.bankBin} disabled={busy} onChange={e=>bankField('bankBin',e.target.value)}/></label>
   <label>{tr('Số tài khoản')}<input inputMode="numeric" pattern="[0-9]{6,34}" maxLength={34} required={settings.transferEnabled} value={settings.bank.accountNumber} disabled={busy} onChange={e=>bankField('accountNumber',e.target.value)}/></label>
   <label>{tr('Tên chủ tài khoản')}<input maxLength={100} required={settings.transferEnabled} value={settings.bank.accountName} disabled={busy} onChange={e=>bankField('accountName',e.target.value)}/></label>
   <p className="admin-note">{tr('VietQR được tạo trực tiếp từ tài khoản, số tiền và mã đơn. Hãy kiểm tra tên người nhận trong ứng dụng ngân hàng trước khi bật. Đổi tài khoản chỉ áp dụng cho đơn mới.')}</p>
   <label className="admin-visible-toggle"><input type="checkbox" checked={settings.codEnabled} disabled={busy} onChange={e=>setSettings({...settings,codEnabled:e.target.checked})}/>{tr('Cho phép COD với đơn có bản in')}</label>
   <button type="submit" className="shop-primary" disabled={busy}>{tr(busy?'Đang lưu…':'Lưu thay đổi')}</button>
  </form>}
 </section>;
}
