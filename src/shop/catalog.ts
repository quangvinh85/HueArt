import type { Artwork } from '../types';

export const SALE_OPTIONS = [
  {
    id: 'copyright',
    title: 'File + bản quyền',
    priceUSD: 10,
    short: 'File ảnh và chuyển toàn bộ quyền tác giả',
    description: 'Nhận file ảnh kèm chuyển toàn bộ quyền tác giả theo thỏa thuận bằng văn bản. Nội dung chuyển quyền được hai bên xác nhận trước khi thanh toán.',
    delivery: 'Giao file qua email sau khi xác nhận thanh toán và thỏa thuận chuyển quyền.',
  },
  {
    id: 'high-resolution',
    title: 'File dung lượng lớn',
    priceUSD: 5,
    short: 'File độ phân giải cao để xem hoặc in',
    description: 'Nhận file ảnh độ phân giải cao để xem hoặc in cho nhu cầu cá nhân. Không bao gồm chuyển quyền tác giả hay quyền sử dụng quảng cáo.',
    delivery: 'Giao file qua email sau khi xác nhận thanh toán.',
  },
  {
    id: 'framed-print',
    title: 'Ảnh in 40 × 60 cm',
    priceUSD: 7,
    short: 'Một bản ảnh in kèm khung',
    description: 'Bản ảnh in kích thước 40 × 60 cm, đã bao gồm khung. Chưa bao gồm phí vận chuyển; phí sẽ được báo riêng theo địa chỉ nhận hàng.',
    delivery: 'Có thể trả trước tiền ảnh; thống nhất khung, cách cắt ảnh và phí vận chuyển riêng.',
  },
] as const;

export type SaleOptionId = typeof SALE_OPTIONS[number]['id'];
export type SaleOption = typeof SALE_OPTIONS[number];
export interface ShopItem {
  artworkId: string;
  optionId: SaleOptionId;
  quantity: number;
}

export const getOption = (id: SaleOptionId): SaleOption => SALE_OPTIONS.find(option => option.id === id)!;
export const usd = (value: number) => `${value} USD`;
export const itemKey = (item: ShopItem) => `${item.artworkId}:${item.optionId}`;
export const itemTotal = (item: ShopItem) => getOption(item.optionId).priceUSD * item.quantity;
export const cartTotal = (items: ShopItem[]) => items.reduce((total, item) => total + itemTotal(item), 0);

export function addItem(items: ShopItem[], item: ShopItem): ShopItem[] {
  const previous = items.find(existing => itemKey(existing) === itemKey(item));
  const quantity = item.optionId === 'framed-print' ? Math.min(99, (previous?.quantity || 0) + item.quantity) : 1;
  const next = { ...item, quantity };
  return previous ? items.map(existing => itemKey(existing) === itemKey(item) ? next : existing) : [...items, next];
}

export function restoreCart(raw: string | null, artworks: Artwork[], allowPendingPublished = false): ShopItem[] {
  try {
    const parsed: unknown = JSON.parse(raw || '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.reduce<ShopItem[]>((items, item) => {
      if (!item || (!artworks.some(art => art.id === item.artworkId) && !(allowPendingPublished && /^submission-[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(item.artworkId || ''))) || !SALE_OPTIONS.some(option => option.id === item.optionId) || !Number.isInteger(item.quantity) || item.quantity < 1) return items;
      return addItem(items, { artworkId: item.artworkId, optionId: item.optionId, quantity: item.quantity });
    }, []);
  } catch {
    return [];
  }
}

export interface Customer {
  name: string;
  email: string;
  phone: string;
  address: string;
  note: string;
}

export function orderText(items: ShopItem[], customer: Customer, artworks: Artwork[]): string {
  const hasPrint = items.some(item => item.optionId === 'framed-print');
  const hasCopyright = items.some(item => item.optionId === 'copyright');
  return [
    'YÊU CẦU ĐẶT ẢNH — NHIẾP ẢNH NGHỆ THUẬT HUẾ',
    '', `Họ tên: ${customer.name}`, `Email nhận file / liên hệ: ${customer.email}`,
    customer.phone ? `Điện thoại: ${customer.phone}` : '',
    hasPrint ? `Địa chỉ nhận bản in: ${customer.address}` : '', '',
    ...items.map(item => {
      const art = artworks.find(art => art.id === item.artworkId)!;
      return `${art.titles.vi} [${art.id}]\n${getOption(item.optionId).title} × ${item.quantity} — ${usd(itemTotal(item))}`;
    }), '', `Tiền ảnh: ${usd(cartTotal(items))}`,
    hasPrint ? 'Bản in 40 × 60 cm đã gồm khung. Phí vận chuyển chưa bao gồm, cần báo riêng để tôi xác nhận.' : 'Nhận file qua email, không có phí vận chuyển.',
    hasCopyright ? 'Tôi yêu cầu chuyển toàn bộ quyền tác giả đối với ảnh chọn gói File + bản quyền. Hai bên cần xác nhận khả năng chuyển quyền và thỏa thuận bằng văn bản trước khi thanh toán.' : '',
    customer.note ? `Ghi chú: ${customer.note}` : '', '',
    'Vui lòng xác nhận đơn, thông tin file / bản in, tổng tiền và hướng dẫn thanh toán. Đây là yêu cầu đặt hàng, chưa xác nhận thanh toán.',
  ].filter(line => line !== undefined).join('\n');
}
