import LanguageSwitcher from './LanguageSwitcher';
import { useShopLanguage } from './language';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Check, ClipboardList, ExternalLink, RefreshCw, Search, ShieldCheck, ShoppingBag } from 'lucide-react';
import { dateTime, money, PAYMENT_LABELS, requestApi, STATUS_LABELS, type Order, type OrdersResult, type OrderStatus, type PaymentStatus } from './ordersApi';
import Modal from './Modal';
import SubmissionsAdmin from './SubmissionsAdmin';
import './shop.css';
import './admin.css';
function OrderEditor({
  order,
  onClose,
  onSaved
}: {
  order: Order;
  onClose: () => void;
  onSaved: (order: Order) => void;
}) {
  const {
    language,
    tr
  } = useShopLanguage();
  const [status, setStatus] = useState(order.status);
  const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus);
  const [shipping, setShipping] = useState(order.shippingCents === null ? '' : String(order.shippingCents / 100));
  const [note, setNote] = useState(order.adminNote);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    const shippingCents = order.hasPrint ? shipping.trim() === '' ? null : Math.round(Number(shipping) * 100) : 0;
    if (shippingCents !== null && (!Number.isFinite(shippingCents) || shippingCents < 0)) {
      setError(tr("Phí vận chuyển phải là số không âm hoặc để trống khi chưa báo phí."));
      return;
    }
    setSaving(true);
    setError('');
    try {
      onSaved(await requestApi<Order>(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          version: order.version,
          status,
          paymentStatus,
          shippingCents,
          adminNote: note
        })
      }));
    } catch (error) {
      setError(error instanceof Error ? error.message : tr("Không lưu được đơn."));
    } finally {
      setSaving(false);
    }
  };
  const shippingCents = shipping.trim() === '' ? null : Math.round(Number(shipping) * 100);
  return <Modal title={order.orderNumber} onClose={() => {
    if (!saving) onClose();
  }} wide>
    <div className="admin-detail"><section><div className="admin-detail-heading"><h3>{tr("Thông tin khách hàng")}</h3><span>{dateTime(order.createdAt, language)}</span></div><dl className="admin-customer"><dt>{tr("Họ tên")}</dt><dd>{order.customer.name}</dd><dt>{tr("Điện thoại")}</dt><dd><a href={`tel:${order.customer.phone}`}>{order.customer.phone}</a></dd><dt>Email</dt><dd>{order.customer.email || tr("Không cung cấp")}</dd>{order.hasPrint && <><dt>{tr("Địa chỉ")}</dt><dd>{order.customer.address}</dd></>}{order.customer.note && <><dt>{tr("Khách ghi chú")}</dt><dd>{order.customer.note}</dd></>}</dl>
      <h3>{tr("Ảnh đã đặt")}</h3><div className="admin-order-items">{order.items.map(item => <div key={`${item.artworkId}:${item.optionId}`}><div><strong>{item.title}</strong><span>{tr(item.optionTitle)}{tr(" × ")}{item.quantity}</span></div><b>{money(item.unitPriceCents * item.quantity, language)}</b></div>)}</div><div className="admin-totals"><div><span>{tr("Tiền ảnh")}</span><strong>{money(order.subtotalCents, language)}</strong></div><div><span>{tr("Phí vận chuyển")}</span><strong>{order.shippingCents === null ? tr("Chờ báo phí") : money(order.shippingCents, language)}</strong></div><div><span>{tr("Tổng hiện tại")}</span><strong>{order.totalCents === null ? tr("Chưa chốt") : money(order.totalCents, language)}</strong></div></div>
      {order.hasPrint && <p className="admin-note">{tr("Ảnh in 40 × 60 cm đã gồm khung. Cần báo phí vận chuyển cho khách trước khi thu tiền.")}</p>}{order.hasCopyright && <p className="admin-note">{tr("Khách đã xác nhận yêu cầu chuyển toàn bộ quyền tác giả. Cần thống nhất và ký thỏa thuận riêng trước khi thanh toán, giao file.")}</p>}
      <h3>{tr("Lịch sử xử lý")}</h3><ul className="admin-history">{[...order.history].reverse().map((event, index) => <li key={`${event.at}:${index}`}><span>{event.action === 'created' ? tr("Tiếp nhận đơn") : tr(STATUS_LABELS[event.status])} · {tr(PAYMENT_LABELS[event.paymentStatus])}</span><time>{dateTime(event.at, language)}</time></li>)}</ul>
    </section><form onSubmit={save} className="admin-editor"><h3>{tr("Cập nhật đơn hàng")}</h3><label>{tr("Trạng thái đơn")}<select value={status} disabled={saving} onChange={event => setStatus(event.target.value as OrderStatus)}>{Object.entries(STATUS_LABELS).map(([id, label]) => <option key={id} value={id}>{tr(label)}</option>)}</select></label><label>{tr("Thanh toán")}<select value={paymentStatus} disabled={saving} onChange={event => setPaymentStatus(event.target.value as PaymentStatus)}>{Object.entries(PAYMENT_LABELS).map(([id, label]) => <option key={id} value={id}>{tr(label)}</option>)}</select></label>
      {order.hasPrint && <label>{tr("Phí vận chuyển (USD)")}<input type="number" min="0" max="10000" step="0.01" placeholder={tr("Chưa báo phí")} value={shipping} disabled={saving} onChange={event => setShipping(event.target.value)} /><small>{tr("Để trống nếu chưa báo phí. Nhập 0 nếu miễn phí.")}</small></label>}
      <label>{tr("Ghi chú nội bộ")}<textarea rows={5} maxLength={2000} value={note} disabled={saving} placeholder={tr("Đã gọi khách, hẹn giao ảnh, thông tin chuyển quyền…")} onChange={event => setNote(event.target.value)} /></label>
      {order.hasPrint && <p className="admin-note">{tr("Tổng sau cập nhật: ")}<strong>{shippingCents === null ? tr("Chưa chốt phí vận chuyển") : money(order.subtotalCents + shippingCents, language)}</strong></p>}
      <p className="admin-note">{tr("Chỉ đánh dấu “Đã thanh toán” sau khi kiểm tra khoản tiền thực nhận. Cập nhật trạng thái không tự thu tiền hay gửi thông báo cho khách.")}</p>
      {error && <p className="shop-order-error" role="alert">{tr(error)}</p>}<button className="shop-primary shop-full" disabled={saving} type="submit"><Check size={16} />{saving ? tr("Đang lưu…") : tr("Lưu thay đổi")}</button><button className="shop-secondary shop-full" disabled={saving} type="button" onClick={onClose}>{tr("Đóng chi tiết")}</button>
    </form></div>
  </Modal>;
}
export default function Admin() {
  const {
    language,
    tr
  } = useShopLanguage();
  const [tab, setTab] = useState<'orders' | 'submissions'>('orders');
  const [session, setSession] = useState<{
    authenticated: boolean;
    ownerAuthenticated: boolean;
    isAdmin: boolean;
  } | null>(null);
  const [username,setUsername] = useState('');
  const [password,setPassword] = useState('');
  const [loginBusy,setLoginBusy] = useState(false);
  const [loginError,setLoginError] = useState('');
  const loginFormRef = useRef<HTMLFormElement>(null);
  const [sessionError, setSessionError] = useState('');
  const [result, setResult] = useState<OrdersResult | null>(null);
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [payment, setPayment] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const requestVersion = useRef(0);
  const loadSession = useCallback(async () => {
    setSessionError('');
    try {
      const data = await requestApi<{authenticated:boolean;ownerAuthenticated:boolean;isAdmin:boolean}>('/api/session');
      setSession(data);
      return data;
    } catch (error) {
      setSessionError(error instanceof Error ? error.message : tr("Không xác minh được đăng nhập."));
    }
  }, []);
  useEffect(() => {
    void loadSession();
  }, [loadSession]);
  const login = async () => {
    if(loginBusy || !loginFormRef.current?.reportValidity()) return;
    setLoginBusy(true);setLoginError('');
    try {
      await requestApi('/api/admin-auth/login',{method:'POST',body:JSON.stringify({username,password})});
      setPassword('');
      const verified=await loadSession();
      if(!verified?.isAdmin) setLoginError(tr('Trình duyệt chưa lưu được phiên đăng nhập. Vui lòng mở trang quản lý trong tab riêng rồi thử lại.'));
    } catch(error) { setLoginError(error instanceof Error?error.message:tr('Không đăng nhập được. Vui lòng thử lại.')); }
    finally { setLoginBusy(false); }
  };
  const logout = async () => {
    setLoginBusy(true);
    try {
      await requestApi('/api/admin-auth/logout',{method:'POST'});
      requestVersion.current++;setResult(null);setSelected(null);setNotice('');setPassword('');
      await loadSession();
    } catch(error) {setError(error instanceof Error?error.message:tr('Không đăng xuất được. Vui lòng thử lại.'));}
    finally {setLoginBusy(false);}
  };
  useEffect(()=>{
    if(session && !session.isAdmin){requestVersion.current++;setResult(null);setSelected(null);}
  },[session?.isAdmin]);
  useEffect(()=>{const refresh=()=>void loadSession();window.addEventListener('focus',refresh);return()=>window.removeEventListener('focus',refresh);},[loadSession]);
  const loadOrders = useCallback(async () => {
    const version = ++requestVersion.current;
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        q: search,
        status,
        payment,
        page: String(page)
      });
      const data = await requestApi<OrdersResult>('/api/admin/orders?' + params);
      if (version === requestVersion.current) setResult(data);
    } catch (error) {
      if (version === requestVersion.current) setError(error instanceof Error ? error.message : tr("Không tải được danh sách đơn."));
    } finally {
      if (version === requestVersion.current) setLoading(false);
    }
  }, [search, status, payment, page]);
  useEffect(() => {
    if (session?.isAdmin) void loadOrders();
  }, [session?.isAdmin, loadOrders]);
  const stats = result?.stats;
  return <div className="shop admin-app"><header className="shop-header"><a className="shop-brand" href="/"><span>{tr("Nhiếp ảnh Nghệ thuật")}</span><strong>Đặng Huy Trứ</strong></a><LanguageSwitcher />{session?.isAdmin&&<button className="shop-secondary" disabled={loginBusy} onClick={()=>void logout()}>{tr("Đăng xuất")}</button>}<span className="admin-header-label"><ShieldCheck size={17} />{tr("Quản lý đơn hàng")}</span><a className="shop-secondary" href="/"><ArrowLeft size={15} />{tr("Về cửa hàng")}</a></header>
    {!session?.isAdmin ? <main className="shop-container admin-access"><ShieldCheck size={38} /><h1>{tr("Trang quản lý đơn hàng")}</h1>{sessionError ? <><p role="alert">{sessionError}</p><button className="shop-primary" onClick={() => void loadSession()}>{tr("Thử lại")}</button></> : session?.ownerAuthenticated ? <form className="admin-login-form" ref={loginFormRef} onSubmit={event=>{event.preventDefault();void login();}}><p>{tr('Đăng nhập quản trị bằng tên đăng nhập và mật khẩu của bạn.')}</p><label htmlFor="admin-username">{tr('Tên đăng nhập')}<input id="admin-username" type="text" name="username" autoComplete="username" autoCapitalize="none" spellCheck={false} required maxLength={100} value={username} disabled={loginBusy} onChange={event=>setUsername(event.target.value)}/></label><label htmlFor="admin-password">{tr('Mật khẩu')}<input id="admin-password" type="password" name="password" autoComplete="current-password" required maxLength={256} value={password} disabled={loginBusy} onChange={event=>setPassword(event.target.value)}/></label>{loginError&&<p className="shop-order-error" role="alert">{tr(loginError)}</p>}<button className="shop-primary shop-full" type="button" disabled={loginBusy} onClick={()=>void login()}>{loginBusy?tr('Đang đăng nhập…'):tr('Đăng nhập quản trị')}</button><a className="shop-text-button" href="/admin" target="_blank" rel="noopener noreferrer">{tr('Mở trang quản lý trong tab riêng')}</a></form> : session ? <><p>{session.authenticated ? tr("Tài khoản hiện tại không có quyền quản lý. Vui lòng dùng tài khoản chủ website.") : tr("Đăng nhập bằng tài khoản chủ website để xem và xử lý đơn hàng.")}</p><a className="shop-primary" target="_top" href={session.authenticated ? '/signout-with-chatgpt?return_to=/admin' : '/signin-with-chatgpt?return_to=/admin'}>{session.authenticated ? tr("Đổi tài khoản") : tr("Đăng nhập với ChatGPT")}<ExternalLink size={15} /></a></> : <p>{tr("Đang xác minh quyền truy cập…")}</p>}</main> : <main className="shop-container admin-main"><div className="shop-filters"><button className={tab === 'orders' ? 'active' : ''} onClick={() => setTab('orders')}>{tr("Đơn hàng")}</button><button className={tab === 'submissions' ? 'active' : ''} onClick={() => setTab('submissions')}>{tr("Tác phẩm gửi đến")}</button></div>{tab === 'submissions' ? <SubmissionsAdmin /> : <><div className="admin-heading"><div><span className="shop-eyebrow">{tr("Dành cho chủ cửa hàng")}</span><h1>{tr("Đơn hàng")}</h1><p>{tr("Theo dõi khách đặt ảnh và cập nhật tiến độ xử lý.")}</p></div><button className="shop-secondary" onClick={() => void loadOrders()} disabled={loading}><RefreshCw size={15} />{loading ? tr("Đang tải…") : tr("Làm mới")}</button></div>
      <div className="admin-stats"><article><span>{tr("Tổng đơn hàng")}</span><strong>{stats?.total ?? '—'}</strong><ClipboardList size={22} /></article><article><span>{tr("Đơn mới")}</span><strong>{stats?.newOrders ?? '—'}</strong><ShoppingBag size={22} /></article><article><span>{tr("Đang xử lý")}</span><strong>{stats?.processing ?? '—'}</strong><RefreshCw size={22} /></article><article><span>{tr("Đã thu (trừ đơn hủy)")}</span><strong>{stats ? money(stats.paidCents, language) : '—'}</strong><Check size={22} /></article></div>
      <div className="admin-toolbar"><form onSubmit={event => {
            event.preventDefault();
            setSearch(query.trim());
            setPage(1);
          }}><label className="shop-search"><Search size={17} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder={tr("Mã đơn, tên, số điện thoại…")} aria-label={tr("Tìm đơn hàng")} /></label><button className="shop-secondary" type="submit">{tr("Tìm")}</button></form><label><span>{tr("Trạng thái")}</span><select value={status} onChange={event => {
              setStatus(event.target.value);
              setPage(1);
            }}><option value="">{tr("Tất cả đơn")}</option>{Object.entries(STATUS_LABELS).map(([id, label]) => <option key={id} value={id}>{tr(label)}</option>)}</select></label><label><span>{tr("Thanh toán")}</span><select value={payment} onChange={event => {
              setPayment(event.target.value);
              setPage(1);
            }}><option value="">{tr("Tất cả")}</option>{Object.entries(PAYMENT_LABELS).map(([id, label]) => <option key={id} value={id}>{tr(label)}</option>)}</select></label></div>
      {notice && <p className="admin-success" role="status">{notice}</p>}{error && <p className="shop-order-error" role="alert">{error}<button className="shop-text-button" onClick={() => void loadOrders()}>{tr("Tải lại danh sách")}</button></p>}
      <div className="admin-table-wrap" aria-busy={loading}><table className="admin-table"><thead><tr><th>{tr("Đơn hàng")}</th><th>{tr("Khách hàng")}</th><th>{tr("Ảnh đã đặt")}</th><th>{tr("Tiền ảnh / tổng")}</th><th>{tr("Trạng thái")}</th><th>{tr("Thanh toán")}</th><th><span className="sr-only">{tr("Thao tác")}</span></th></tr></thead><tbody>{result?.orders.map(order => <tr key={order.id}><td><button className="admin-order-link" onClick={() => setSelected(order)}>{order.orderNumber}</button><small>{dateTime(order.createdAt, language)}</small></td><td><strong>{order.customer.name}</strong><small>{order.customer.phone}</small></td><td>{order.items.reduce((sum, item) => sum + item.quantity, 0)}{tr(" lựa chọn")}<small>{order.hasPrint ? tr("Có bản in") : tr("File ảnh")}</small></td><td><strong>{money(order.subtotalCents, language)}</strong><small>{order.totalCents === null ? tr("Chờ báo vận chuyển") : tr("Tổng {0}", money(order.totalCents, language))}</small></td><td><span className={`admin-badge admin-badge-${order.status}`}>{tr(STATUS_LABELS[order.status])}</span></td><td><span className={`admin-badge admin-badge-${order.paymentStatus}`}>{tr(PAYMENT_LABELS[order.paymentStatus])}</span></td><td><button className="shop-secondary" onClick={() => setSelected(order)}>{tr("Chi tiết")}</button></td></tr>)}</tbody></table>{!result?.orders.length && <div className="shop-empty"><ClipboardList size={34} /><h3>{loading ? tr("Đang tải đơn hàng…") : result?.stats.total ? tr("Không có đơn phù hợp") : tr("Chưa có đơn hàng")}</h3><p>{result?.stats.total ? tr("Thử đổi từ khóa hoặc bộ lọc.") : tr("Đơn khách gửi từ cửa hàng sẽ xuất hiện tại đây.")}</p></div>}</div>
      <div className="admin-pagination"><span>{result?.total ?? 0}{tr(" đơn · Trang ")}{page}</span><div><button className="shop-secondary" disabled={page <= 1 || loading} onClick={() => setPage(page - 1)}>{tr("Trước")}</button><button className="shop-secondary" disabled={loading || !result || page * result.pageSize >= result.total} onClick={() => setPage(page + 1)}>{tr("Sau")}</button></div></div>
      <p className="admin-footer-note">{tr("Dữ liệu được lưu trên máy chủ. Chỉ tài khoản quản lý được xem thông tin khách hàng. Đánh dấu thanh toán và tiến độ sau khi bạn xác nhận thực tế.")}</p></>}
    </main>}
    {session?.isAdmin && selected && <OrderEditor key={`${selected.id}:${selected.version}`} order={selected} onClose={() => setSelected(null)} onSaved={order => {
      setSelected(order);
      setNotice(tr("Đã cập nhật {0}.", order.orderNumber));
      void loadOrders();
    }} />}
  </div>;
}
