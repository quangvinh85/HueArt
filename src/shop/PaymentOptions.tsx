import {QrCode,Landmark,Truck,Phone} from 'lucide-react';
import {PAYMENT_METHOD_LABELS,type PaymentMethod,type PaymentSettings} from './paymentTypes';
import {useShopLanguage} from './language';
export default function PaymentOptions({settings,method,onChange,hasPrint,disabled}:{settings:PaymentSettings;method:PaymentMethod;onChange:(method:PaymentMethod)=>void;hasPrint:boolean;disabled:boolean}){
 const {tr}=useShopLanguage();
 const options=[['vietqr',QrCode],['transfer',Landmark],['cod',Truck],['contact',Phone]] as const;
 return <fieldset className="shop-payment-options"><legend>{tr('Thanh toán')}</legend>{options.map(([value,Icon])=>{
  const unavailable=value==='cod'?(!hasPrint||!settings.codEnabled):(value==='vietqr'||value==='transfer')&&!settings.transferEnabled;
  return <label key={value} className={`shop-payment-option ${unavailable?'unavailable':''} ${method===value?'selected':''}`}><input type="radio" name="payment-method" value={value} checked={method===value} disabled={disabled||unavailable} onChange={()=>onChange(value)}/><span>{value==='vietqr'&&settings.transferEnabled?tr('Thanh toán qua {0} VietQR',settings.bank.bankName):tr(PAYMENT_METHOD_LABELS[value])}{value==='cod'&&!hasPrint&&<small>{tr('Chỉ áp dụng cho đơn có bản in.')}</small>}</span><Icon size={20}/></label>;
 })}{!settings.transferEnabled&&<p className="shop-fine-print">{tr('Chuyển khoản hiện chưa khả dụng. Bạn có thể chọn COD cho bản in hoặc liên hệ người bán.')}</p>}<p className="shop-fine-print">{tr('Chọn VietQR hoặc chuyển khoản để xem mã QR và nội dung thanh toán sau khi gửi đơn.')}</p></fieldset>;
}
