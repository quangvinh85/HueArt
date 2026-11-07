import { ARTWORKS } from '../src/data/artworks';
import type { Artwork } from '../src/types';
import { PAYMENT_METHOD_LABELS, toVnd } from '../src/shop/paymentTypes';
import { SALE_OPTIONS, priceCents } from '../src/shop/catalog';

export const ORDER_STATUSES = ['new', 'confirmed', 'processing', 'completed', 'cancelled'] as const;
export const PAYMENT_STATUSES = ['unpaid', 'reported', 'partial', 'paid'] as const;
export type OrderStatus = typeof ORDER_STATUSES[number];
export type PaymentStatus = typeof PAYMENT_STATUSES[number];
export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
interface CheckedItem { artworkId: string; title: string; imageUrl: string; optionId: string; optionTitle: string; quantity: number; unitPriceCents: number; }
const text = (value: unknown, max: number) => typeof value === 'string' ? value.trim().slice(0, max) : '';
export function validateOrder(body: any, artworks: Artwork[] = ARTWORKS) {
  if (!body || typeof body !== 'object') throw new ApiError(400, 'Thông tin đặt hàng không hợp lệ.');
  const checkoutKey = text(body.checkoutKey, 80);
  if (!/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(checkoutKey)) throw new ApiError(400, 'Mã yêu cầu không hợp lệ. Vui lòng tải lại trang.');
  const name = text(body.customer?.name, 100);
  const phone = text(body.customer?.phone, 30);
  const email = text(body.customer?.email, 150);
  const address = text(body.customer?.address, 500);
  const note = text(body.customer?.note, 1000);
  if (name.length < 2) throw new ApiError(400, 'Vui lòng nhập họ tên.');
  if (!/^[+\d\s().-]{7,30}$/.test(phone) || phone.replace(/\D/g, '').length < 7) throw new ApiError(400, 'Vui lòng nhập số điện thoại hợp lệ.');
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ApiError(400, 'Email không hợp lệ.');
  if (!Array.isArray(body.items) || !body.items.length || body.items.length > 100) throw new ApiError(400, 'Giỏ hàng phải có từ 1 đến 100 lựa chọn.');
  const keys = new Set<string>();
  const items: CheckedItem[] = body.items.map((item: any) => {
    const artwork = artworks.find(art => art.id === item?.artworkId);
    const option = SALE_OPTIONS.find(option => option.id === item?.optionId);
    if (!artwork || !option) throw new ApiError(400, 'Ảnh hoặc loại mua không còn hợp lệ.');
    const key = `${artwork.id}:${option.id}`;
    if (keys.has(key)) throw new ApiError(400, 'Giỏ hàng có lựa chọn trùng lặp.');
    keys.add(key);
    const quantity = item.quantity;
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99 || (option.id !== 'framed-print' && quantity !== 1)) throw new ApiError(400, 'Số lượng không hợp lệ.');
    return { artworkId: artwork.id, title: artwork.titles.vi, imageUrl: artwork.imageUrl, optionId: option.id, optionTitle: option.title, quantity, unitPriceCents: priceCents(artwork,option.id) };
  });
  const hasPrint = items.some(item => item.optionId === 'framed-print');
  const hasCopyright = items.some(item => item.optionId === 'copyright');
  if (hasPrint && address.length < 5) throw new ApiError(400, 'Vui lòng nhập địa chỉ nhận bản in.');
  if (hasCopyright && body.rightsAccepted !== true) throw new ApiError(400, 'Vui lòng xác nhận thỏa thuận chuyển quyền tác giả.');
  const paymentMethod=body.paymentMethod??'contact';
  if(!Object.hasOwn(PAYMENT_METHOD_LABELS,paymentMethod)||paymentMethod==='cod'&&!hasPrint)throw new ApiError(400,'Phương thức thanh toán không hợp lệ.');
  const subtotalCents = items.reduce((total, item) => total + item.unitPriceCents * item.quantity, 0);
  return { checkoutKey, paymentMethod, name, phone, email, address: hasPrint ? address : '', note, items, hasPrint, hasCopyright, subtotalCents, rightsAccepted: hasCopyright };
}

export function validateUpdate(body: any, order: any) {
  if (!body || !Number.isInteger(body.version) || body.version !== order.version) throw new ApiError(409, 'Đơn đã thay đổi. Vui lòng tải lại chi tiết rồi thử lại.');
  const status = body.status;
  const paymentStatus = body.paymentStatus;
  if (!ORDER_STATUSES.includes(status) || !PAYMENT_STATUSES.includes(paymentStatus)) throw new ApiError(400, 'Trạng thái không hợp lệ.');
  const shippingCents = body.shippingCents;
  if (order.has_print ? shippingCents !== null && (!Number.isInteger(shippingCents) || shippingCents < 0 || shippingCents > 1000000) : shippingCents !== 0) throw new ApiError(400, 'Phí vận chuyển không hợp lệ.');
  if (paymentStatus === 'paid' && shippingCents === null) throw new ApiError(400, 'Cần chốt phí vận chuyển trước khi xác nhận đã thanh toán.');
  if (status === 'completed' && (paymentStatus !== 'paid' || shippingCents === null)) throw new ApiError(400, 'Cần xác nhận thanh toán và phí vận chuyển trước khi hoàn tất đơn.');
  const totalVnd=shippingCents===null?null:toVnd(order.subtotal_cents+shippingCents,order.exchange_rate||26000);
  const receivedAmountVnd=body.receivedAmountVnd??(paymentStatus==='paid'?totalVnd:order.received_amount_vnd||0);
  const rightsConfirmed=body.rightsConfirmed??Boolean(order.rights_confirmed);
  if(!Number.isSafeInteger(receivedAmountVnd)||receivedAmountVnd<0||receivedAmountVnd>10000000000000||typeof rightsConfirmed!=='boolean')throw new ApiError(400,'Số tiền đã nhận không hợp lệ.');
  if(paymentStatus==='paid'&&(totalVnd===null||receivedAmountVnd<totalVnd))throw new ApiError(400,'Số tiền đã nhận chưa đủ để xác nhận thanh toán toàn bộ.');
  if(paymentStatus==='partial'&&(receivedAmountVnd<=0||totalVnd!==null&&receivedAmountVnd>=totalVnd))throw new ApiError(400,'Vui lòng kiểm tra số tiền thanh toán một phần.');
  if(paymentStatus==='unpaid'&&receivedAmountVnd!==0)throw new ApiError(400,'Đơn đã nhận tiền cần chọn thanh toán một phần hoặc đã thanh toán.');
  return { status, paymentStatus, shippingCents, receivedAmountVnd,rightsConfirmed:order.has_copyright?rightsConfirmed:false,adminNote: text(body.adminNote, 2000) };
}

export function serializeOrder(row: any) {
  return { id: row.id, orderNumber: row.order_number, customer: { name: row.customer_name, phone: row.customer_phone, email: row.customer_email, address: row.customer_address, note: row.customer_note }, items: JSON.parse(row.items_json), subtotalCents: row.subtotal_cents, shippingCents: row.shipping_cents, totalCents: row.shipping_cents === null ? null : row.subtotal_cents + row.shipping_cents, hasPrint: Boolean(row.has_print), hasCopyright: Boolean(row.has_copyright), rightsAccepted: Boolean(row.rights_accepted), status: row.status, paymentStatus: row.payment_status, paymentMethod:row.payment_method||'contact',exchangeRate:row.exchange_rate||26000,receivedAmountVnd:row.received_amount_vnd||0,reportedAmountVnd:row.reported_amount_vnd||0,paymentClaimedAt:row.payment_claimed_at||null,paymentReference:row.payment_reference||'',rightsConfirmed:Boolean(row.rights_confirmed),paymentLink:'/#pay='+row.order_number+'&key='+row.checkout_key,adminNote: row.admin_note, version: row.version, createdAt: row.created_at, updatedAt: row.updated_at, history: JSON.parse(row.history_json) };
}
