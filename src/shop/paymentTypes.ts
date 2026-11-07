export const DEFAULT_EXCHANGE_RATE=26000;
export const PAYMENT_METHOD_LABELS={contact:'Liên hệ thanh toán sau',vietqr:'Thanh toán qua VietQR',transfer:'Chuyển khoản',cod:'Thu hộ (COD)'} as const;
export type PaymentMethod=keyof typeof PAYMENT_METHOD_LABELS;
export interface BankAccount {bankName:string;bankBin:string;accountNumber:string;accountName:string}
export interface PaymentSettings {exchangeRate:number;transferEnabled:boolean;codEnabled:boolean;bank:BankAccount;version:number}
export const defaultPaymentSettings:PaymentSettings={exchangeRate:DEFAULT_EXCHANGE_RATE,transferEnabled:false,codEnabled:true,bank:{bankName:'',bankBin:'',accountNumber:'',accountName:''},version:0};
export const toVnd=(cents:number,rate=DEFAULT_EXCHANGE_RATE)=>Math.round(cents*rate/100);
export const vnd=(amount:number)=>`${Math.round(amount).toLocaleString('vi-VN')} VND`;
export interface PaymentReceipt {
 orderNumber:string;subtotalCents:number;shippingCents:number|null;status:string;createdAt:string;paymentStatus:'unpaid'|'reported'|'partial'|'paid';paymentMethod:PaymentMethod;
 exchangeRate:number;paymentAccessKey:string;expectedAmountVnd:number;receivedAmountVnd:number;reportedAmountVnd:number;paymentReference:string;paymentClaimedAt:string|null;
 canPay:boolean;awaitingRights:boolean;bank:BankAccount|null;qrPayload:string|null;
}
