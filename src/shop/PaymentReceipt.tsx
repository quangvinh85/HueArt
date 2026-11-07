import {useEffect,useState} from 'react';
import {Check,RefreshCw,ShieldCheck} from 'lucide-react';
import {dateTime,PAYMENT_LABELS,requestApi} from './ordersApi';
import {PAYMENT_METHOD_LABELS,vnd,type PaymentReceipt as Receipt} from './paymentTypes';
import {useShopLanguage} from './language';
import Price from './Price';
function QrImage({payload}:{payload:string}){
 const {tr}=useShopLanguage();const [url,setUrl]=useState(''),[failed,setFailed]=useState(false);
 useEffect(()=>{let active=true;setFailed(false);setUrl('');void import('qrcode').then(qr=>qr.toDataURL(payload,{width:256,margin:2,errorCorrectionLevel:'M'})).then(value=>{if(active)setUrl(value)}).catch(()=>{if(active)setFailed(true)});return()=>{active=false;};},[payload]);
 return url?<div className="shop-vietqr"><img src={url} alt={tr('Mã VietQR thanh toán đơn hàng')} width={256} height={256}/><a href={url} download="HueArt-VietQR.png" className="shop-text-button">{tr('Lưu mã QR')}</a></div>:<p role="status">{tr(failed?'Không tạo được QR. Bạn có thể chuyển khoản bằng thông tin bên dưới.':'Đang tạo mã QR…')}</p>;
}
export default function PaymentReceipt({initial,onClose}:{initial:Receipt;onClose:()=>void}){
 const {language,tr}=useShopLanguage();const [receipt,setReceipt]=useState(initial),[busy,setBusy]=useState(false),[error,setError]=useState(''),[reference,setReference]=useState(''),[confirmed,setConfirmed]=useState(false);
 const [bankMode,setBankMode]=useState(initial.paymentMethod==='vietqr'||initial.paymentMethod==='transfer');
 const endpoint='/api/order-payment/'+receipt.orderNumber;
 const headers={'X-HueArt-Checkout-Key':receipt.paymentAccessKey};
 const refresh=async()=>{setError('');try{setReceipt(await requestApi<Receipt>(endpoint,{headers}));}catch(e){setError(e instanceof Error?e.message:tr('Không tải được thông tin thanh toán.'));}};
 useEffect(()=>{
  const onFocus=()=>{if(!document.hidden)void refresh();};
  window.addEventListener('focus',onFocus);const timer=setInterval(onFocus,30000);
  return()=>{window.removeEventListener('focus',onFocus);clearInterval(timer);};
 },[receipt.orderNumber,receipt.paymentAccessKey]);
 const report=async(e:React.FormEvent)=>{
  e.preventDefault();if(busy||!confirmed)return;setBusy(true);setError('');
  try{setReceipt(await requestApi<Receipt>(endpoint+'/report',{method:'POST',headers,body:JSON.stringify({reference,method:receipt.paymentMethod==='transfer'?'transfer':'vietqr'})}));setConfirmed(false);}
  catch(e){setError(e instanceof Error?e.message:tr('Không gửi được thông báo thanh toán.'));}finally{setBusy(false);}
 };
 return <div className="shop-checkout"><div className="shop-draft-status"><Check size={24}/><div><h3>{tr('Đã tiếp nhận đơn hàng')}</h3><p>{tr('Đơn đã được lưu. Bạn có thể thanh toán trước hoặc chờ người bán liên hệ.')}</p></div></div>
  <div className="shop-order-recipient"><span>{tr('Mã đơn hàng — vui lòng lưu lại để liên hệ')}</span><strong>{receipt.orderNumber}</strong><span>{tr('Ngày đặt: ')}{dateTime(receipt.createdAt,language)}</span></div>
  <div className="shop-mini-summary"><div><span>{tr('Tiền ảnh')}</span><strong><Price cents={receipt.subtotalCents} rate={receipt.exchangeRate}/></strong></div><div><span>{tr('Vận chuyển')}</span><strong>{receipt.shippingCents===null?tr('Chờ báo phí'):<Price cents={receipt.shippingCents} rate={receipt.exchangeRate}/>}</strong></div><div><span>{tr('Đã nhận và xác nhận')}</span><strong>{vnd(receipt.receivedAmountVnd)}</strong></div></div>
  <div className={`shop-payment-status payment-${receipt.paymentStatus}`}><ShieldCheck size={20}/><div><strong>{tr(PAYMENT_LABELS[receipt.paymentStatus])}</strong><p>{tr(PAYMENT_METHOD_LABELS[receipt.paymentMethod])}</p>{receipt.paymentStatus==='reported'&&<p>{tr('Người bán đang đối chiếu khoản chuyển. Thông báo của bạn chưa phải xác nhận đã nhận tiền.')}</p>}</div><button className="shop-icon" type="button" onClick={()=>void refresh()} aria-label={tr('Cập nhật thanh toán')}><RefreshCw size={16}/></button></div>
  {receipt.awaitingRights&&<p className="shop-delivery-note">{tr('Đơn có chuyển quyền tác giả: vui lòng chờ người bán xác nhận thỏa thuận bằng văn bản trước khi thanh toán.')}</p>}
  {receipt.status==='cancelled'&&<p className="shop-order-error">{tr('Đơn đã hủy. Vui lòng không chuyển tiền cho đơn này.')}</p>}
  {receipt.canPay&&!bankMode&&<button className="shop-secondary shop-full" onClick={()=>setBankMode(true)}>{tr('Xem thông tin chuyển khoản để trả trước')}</button>}
  {receipt.canPay&&bankMode&&receipt.bank&&<section className="shop-bank-panel"><h3>{tr(receipt.shippingCents===null?'Thanh toán trước tiền ảnh':'Thông tin thanh toán')}</h3><strong className="shop-bank-amount">{vnd(receipt.expectedAmountVnd)}</strong>{receipt.shippingCents===null&&<p className="shop-fine-print">{tr('Khoản này chỉ gồm tiền ảnh. Phí vận chuyển sẽ được báo và thanh toán riêng.')}</p>}
   {receipt.qrPayload&&<QrImage payload={receipt.qrPayload}/>}
   <dl><dt>{tr('Ngân hàng')}</dt><dd>{receipt.bank.bankName}</dd><dt>{tr('Số tài khoản')}</dt><dd>{receipt.bank.accountNumber}</dd><dt>{tr('Chủ tài khoản')}</dt><dd>{receipt.bank.accountName}</dd><dt>{tr('Nội dung chuyển khoản')}</dt><dd><code>{receipt.orderNumber}</code></dd></dl>
   <p className="shop-fine-print">{tr('Quét QR bằng ứng dụng ngân hàng hoặc chuyển khoản với đúng số tiền và mã đơn ở trên.')}</p>
   {receipt.paymentStatus!=='reported'&&<form className="shop-payment-report" onSubmit={report}><label>{tr('Mã giao dịch (nếu có)')}<input maxLength={100} value={reference} disabled={busy} onChange={e=>setReference(e.target.value)}/></label><label className="shop-consent"><input type="checkbox" required disabled={busy} checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/><span>{tr('Tôi đã hoàn tất chuyển khoản số tiền ở trên.')}</span></label><button className="shop-primary shop-full" type="submit" disabled={busy||!confirmed}>{tr(busy?'Đang gửi…':'Thông báo tôi đã chuyển khoản')}</button></form>}
  </section>}
  {receipt.receivedAmountVnd>0&&receipt.shippingCents===null&&<p>{tr('Đã ghi nhận khoản trả trước. Người bán sẽ liên hệ để chốt phí vận chuyển còn lại.')}</p>}
  {error&&<p className="shop-order-error" role="alert">{tr(error)}</p>}
  <a className="shop-text-button" href={`/#pay=${receipt.orderNumber}&key=${receipt.paymentAccessKey}`} target="_blank" rel="noopener noreferrer">{tr('Mở biên nhận trong tab riêng')}</a><button className="shop-primary shop-full" type="button" onClick={onClose}>{tr('Tiếp tục xem ảnh')}</button>
 </div>;
}
