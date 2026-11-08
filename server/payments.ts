import {ApiError} from './orders';
import {defaultPaymentSettings,toVnd,type BankAccount,type PaymentSettings} from '../src/shop/paymentTypes';
const clean=(value:unknown,max:number)=>typeof value==='string'?value.trim().slice(0,max):'';
const validBank=(bank:BankAccount)=>/^\d{6}$/.test(bank.bankBin)&&/^[0-9]{6,34}$/.test(bank.accountNumber)&&bank.bankName.length>=2&&bank.accountName.length>=2;
export async function getPaymentSettings(env:{DB:any}):Promise<PaymentSettings>{
 const row=await env.DB.prepare("SELECT value_json, version FROM shop_settings WHERE key = 'payments'").first();
 if(!row)return {...defaultPaymentSettings,bank:{...defaultPaymentSettings.bank}};
 return {...JSON.parse(row.value_json),version:row.version};
}
export async function savePaymentSettings(env:{DB:any},data:any){
 const current=await getPaymentSettings(env);
 if(data?.version!==current.version)throw new ApiError(409,'Cài đặt đã thay đổi. Vui lòng tải lại.');
 if(!Number.isInteger(data.exchangeRate)||data.exchangeRate<1000||data.exchangeRate>1000000||typeof data.transferEnabled!=='boolean'||typeof data.codEnabled!=='boolean')throw new ApiError(400,'Cài đặt thanh toán không hợp lệ.');
 const bank={bankName:clean(data.bank?.bankName,100),bankBin:clean(data.bank?.bankBin,6),accountNumber:clean(data.bank?.accountNumber,34),accountName:clean(data.bank?.accountName,100)};
 if(data.transferEnabled&&!validBank(bank))throw new ApiError(400,'Vui lòng nhập đầy đủ ngân hàng, mã BIN 6 chữ số, số tài khoản và tên chủ tài khoản.');
 const settings={exchangeRate:data.exchangeRate,transferEnabled:data.transferEnabled,codEnabled:data.codEnabled,bank};
 const result=await env.DB.prepare("INSERT INTO shop_settings (key, value_json, version, updated_at) VALUES ('payments', ?, 1, ?) ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json, version = shop_settings.version + 1, updated_at = excluded.updated_at WHERE shop_settings.version = ?").bind(JSON.stringify(settings),new Date().toISOString(),current.version).run();
 if(!result.meta.changes)throw new ApiError(409,'Cài đặt đã thay đổi. Vui lòng tải lại.');
 return {...settings,version:current.version+1};
}
const tlv=(tag:string,value:string)=>tag+String(value.length).padStart(2,'0')+value;
export function vietQr(bank:BankAccount,amount:number,reference:string){
 if(!validBank(bank)||!Number.isSafeInteger(amount)||amount<=0)throw new ApiError(400,'Thông tin tạo mã QR không hợp lệ.');
 const account=tlv('00','A000000727')+tlv('01',tlv('00',bank.bankBin)+tlv('01',bank.accountNumber))+tlv('02','QRIBFTTA');
 const payload=tlv('00','01')+tlv('01','12')+tlv('38',account)+tlv('53','704')+tlv('54',String(amount))+tlv('58','VN')+tlv('62',tlv('08',reference))+'6304';
 let crc=0xffff;
 for(const character of payload){crc^=character.charCodeAt(0)<<8;for(let bit=0;bit<8;bit++)crc=crc&0x8000?((crc<<1)^0x1021)&0xffff:(crc<<1)&0xffff;}
 return payload+crc.toString(16).toUpperCase().padStart(4,'0');
}
export function paymentReceipt(row:any,settings:PaymentSettings){
 const bankSnapshot=JSON.parse(row.bank_snapshot_json||'{}');
 const bank:BankAccount=validBank(bankSnapshot)?bankSnapshot:settings.bank;
 const rate=row.exchange_rate||26000;
 const expected=Math.max(0,toVnd(row.subtotal_cents+(row.shipping_cents||0),rate)-(row.received_amount_vnd||0));
 const awaitingRights=Boolean(row.has_copyright&&!row.rights_confirmed);
 const canPay=settings.transferEnabled&&validBank(bank)&&row.status!=='cancelled'&&!['paid','reported'].includes(row.payment_status)&&expected>0;
 return {orderNumber:row.order_number,subtotalCents:row.subtotal_cents,shippingCents:row.shipping_cents,status:row.status,createdAt:row.created_at,paymentStatus:row.payment_status,paymentMethod:row.payment_method||'contact',exchangeRate:rate,paymentAccessKey:row.checkout_key,expectedAmountVnd:expected,receivedAmountVnd:row.received_amount_vnd||0,reportedAmountVnd:row.reported_amount_vnd||0,paymentReference:row.payment_reference||'',paymentClaimedAt:row.payment_claimed_at||null,canPay,awaitingRights,bank:settings.transferEnabled&&validBank(bank)&&row.status!=='cancelled'?bank:null,qrPayload:canPay?vietQr(bank,expected,row.order_number):null};
}
export async function customerPayment(request:Request,env:any,readJson:(request:Request)=>Promise<any>){
 const match=/^\/api\/order-payment\/(DHT-[0-9]{8}-[A-F0-9]{8})(\/report)?$/.exec(new URL(request.url).pathname);
 const key=request.headers.get('X-HueArt-Checkout-Key')||'';
 if(!match||!/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(key))throw new ApiError(404,'Không tìm thấy thông tin thanh toán.');
 const row=await env.DB.prepare('SELECT * FROM orders WHERE order_number = ? AND checkout_key = ?').bind(match[1],key).first();
 if(!row)throw new ApiError(404,'Không tìm thấy thông tin thanh toán.');
 const settings=await getPaymentSettings(env),receipt=paymentReceipt(row,settings);
 if(!match[2]&&request.method==='GET')return receipt;
 if(match[2]&&request.method==='POST'){
  if(row.payment_status==='reported')return receipt;
  if(!receipt.canPay)throw new ApiError(400,'Đơn này chưa thể tiếp nhận thông báo thanh toán.');
  const data=await readJson(request);
  if(!['vietqr','transfer'].includes(data?.method))throw new ApiError(400,'Phương thức thanh toán không hợp lệ.');
  const reference=clean(data.reference,100),now=new Date().toISOString();
  const history=JSON.parse(row.history_json);
  if(history.filter((entry:any)=>entry.action==='payment_reported'&&Date.now()-new Date(entry.at).getTime()<900000).length>=5)throw new ApiError(429,'Bạn đã gửi nhiều thông báo. Vui lòng chờ quản trị viên kiểm tra.');
  history.push({at:now,action:'payment_reported',status:row.status,paymentStatus:'reported',reportedAmountVnd:receipt.expectedAmountVnd,paymentReference:reference});
  const updated=await env.DB.prepare("UPDATE orders SET payment_method = ?, payment_status = 'reported', payment_claimed_at = ?, payment_reference = ?, reported_amount_vnd = ?, bank_snapshot_json = ?, history_json = ?, version = version + 1, updated_at = ? WHERE id = ? AND version = ?").bind(data.method,now,reference,receipt.expectedAmountVnd,JSON.stringify(receipt.bank),JSON.stringify(history),now,row.id,row.version).run();
  if(!updated.meta.changes)throw new ApiError(409,'Đơn đã thay đổi. Vui lòng tải lại thông tin thanh toán.');
  return paymentReceipt(await env.DB.prepare('SELECT * FROM orders WHERE id = ?').bind(row.id).first(),settings);
 }
 throw new ApiError(405,'Phương thức không được hỗ trợ.');
}
