import { translateText } from './language';
import type { Language } from '../i18n/translations';
import type { Customer, ShopItem } from './catalog';
export const STATUS_LABELS = { new: 'Đơn mới', confirmed: 'Đã xác nhận', processing: 'Đang xử lý', completed: 'Hoàn tất', cancelled: 'Đã hủy' } as const;
export const PAYMENT_LABELS = { unpaid: 'Chưa thanh toán', paid: 'Đã thanh toán' } as const;
export type OrderStatus = keyof typeof STATUS_LABELS;
export type PaymentStatus = keyof typeof PAYMENT_LABELS;
export interface Receipt { orderNumber: string; subtotalCents: number; shippingCents: number | null; status: OrderStatus; createdAt: string; }
export interface OrderItem { artworkId: string; title: string; imageUrl: string; optionId: string; optionTitle: string; quantity: number; unitPriceCents: number; }
export interface Order {
  id: string; orderNumber: string; customer: Customer; items: OrderItem[]; subtotalCents: number; shippingCents: number | null; totalCents: number | null;
  hasPrint: boolean; hasCopyright: boolean; rightsAccepted: boolean; status: OrderStatus; paymentStatus: PaymentStatus; adminNote: string; version: number;
  createdAt: string; updatedAt: string; history: { at: string; action: string; status: OrderStatus; paymentStatus: PaymentStatus; shippingCents?: number | null }[];
}
export interface OrdersResult { orders: Order[]; total: number; page: number; pageSize: number; stats: { total: number; newOrders: number; processing: number; paidCents: number }; }
export const money = (cents: number, language: Language = 'vi') => `${(cents / 100).toLocaleString(language === 'vi' ? 'vi-VN' : language === 'fr' ? 'fr-FR' : 'en-US', { maximumFractionDigits: 2 })} USD`;
export const dateTime = (date: string, language: Language = 'vi') => new Intl.DateTimeFormat(language === 'vi' ? 'vi-VN' : language === 'fr' ? 'fr-FR' : 'en-GB', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date(date));

export async function requestApi<T>(path: string, init: RequestInit = {}): Promise<T> {
  let language: Language = 'vi';
  try { const saved = localStorage.getItem('hueart_language'); if(saved === 'en' || saved === 'fr') language = saved; } catch {}
  const response = await fetch(path, { ...init, credentials: 'same-origin', cache: 'no-store', headers: { ...init.headers, ...(init.body ? { 'Content-Type': 'application/json' } : {}) } });
  if (!response.headers.get('Content-Type')?.includes('application/json')) throw new Error(translateText('Chưa kết nối được hệ thống đơn hàng. Vui lòng tải lại trang hoặc thử lại sau.', language));
  const result = await response.json();
  if (!response.ok) throw new Error(translateText(result.error || 'Không xử lý được yêu cầu. Vui lòng thử lại.', language));
  return result as T;
}

let pendingCheckout: { fingerprint: string; checkoutKey: string } | null = null;

export async function submitOrder(items: ShopItem[], customer: Customer, rightsAccepted: boolean): Promise<Receipt> {
  const payload = { items, customer, rightsAccepted };
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(payload)));
  const fingerprint = Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2, '0')).join('');
  let checkoutKey = pendingCheckout?.fingerprint === fingerprint ? pendingCheckout.checkoutKey : crypto.randomUUID();
  try {
    const previous = JSON.parse(sessionStorage.getItem('hueart_pending_order') || 'null');
    if (previous?.fingerprint === fingerprint && typeof previous.checkoutKey === 'string') checkoutKey = previous.checkoutKey;
    else sessionStorage.setItem('hueart_pending_order', JSON.stringify({ fingerprint, checkoutKey }));
  } catch { /* The current attempt remains valid if browser storage is unavailable. */ }
  pendingCheckout = { fingerprint, checkoutKey };
  const receipt = await requestApi<Receipt>('/api/orders', { method: 'POST', body: JSON.stringify({ ...payload, checkoutKey }) });
  pendingCheckout = null;
  try { sessionStorage.removeItem('hueart_pending_order'); } catch { /* No browser storage to clear. */ }
  return receipt;
}
