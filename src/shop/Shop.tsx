import ChatDock from './ChatDock';
import Price,{RateContext} from './Price';
import PaymentOptions from './PaymentOptions';
import {defaultPaymentSettings,type PaymentSettings,type PaymentMethod,vnd} from './paymentTypes';
import LanguageSwitcher from './LanguageSwitcher';
import { useShopLanguage } from './language';
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowRight, FileImage, Frame, Mail, MapPin, Minus, Plus, Search, Sparkles, Camera, ShieldCheck, ShoppingBag, Trash2 } from 'lucide-react';
import { ARTWORKS } from '../data/artworks';
import type { Artwork } from '../types';
import { SALE_OPTIONS, addItem, cartTotal, getOption, itemKey, itemTotal, restoreCart, type Customer, type SaleOptionId, type ShopItem } from './catalog';
import { ProtectedImage, useImageProtection } from './ProtectedImage';
import { requestApi, submitOrder, type Receipt } from './ordersApi';
import Modal from './Modal';
import './shop.css';
const CuratorModal = lazy(() => import('../components/CuratorModal').then(module => ({
  default: module.CuratorModal
})));
const SubmissionModal = lazy(() => import('./SubmissionModal'));
const PaymentReceipt = lazy(()=>import('./PaymentReceipt'));
const CART_KEY = 'hueart_simple_cart_v1';
const CONTACT_EMAIL = 'vinhhuong119@gmail.com';
const categories = [['all', 'Tất cả ảnh'], ['imperial-echoes', 'Di sản Huế'], ['perfume-river', 'Sông nước'], ['living-traditions', 'Đời sống'], ['poetic-monochrome', 'Ảnh đen trắng']];
const icons = [ShieldCheck, FileImage, Frame];
const emptyCustomer: Customer = {
  name: '',
  email: '',
  phone: '',
  address: '',
  note: ''
};
export default function Shop() {
  const {
    language,
    tr
  } = useShopLanguage();
  const [artworks,setArtworks] = useState<Artwork[]>([]);
  const [catalogueLoading,setCatalogueLoading] = useState(true);
  const [catalogueError,setCatalogueError] = useState('');
  const [cart, setCart] = useState<ShopItem[]>(() => {
    try {
      return restoreCart(localStorage.getItem(CART_KEY), ARTWORKS, true);
    } catch {
      return [];
    }
  });
  const [curatorOpen, setCuratorOpen] = useState(false);
  const [submissionOpen, setSubmissionOpen] = useState(false);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [visibleCount,setVisibleCount]=useState(12);
  const [selected, setSelected] = useState<Artwork | null>(null);
  const [optionId, setOptionId] = useState<SaleOptionId>('high-resolution');
  const [quantity, setQuantity] = useState(1);
  const [panel, setPanel] = useState<'cart' | 'checkout' | null>(null);
  const [customer, setCustomer] = useState<Customer>(emptyCustomer);
  const [rightsAccepted, setRightsAccepted] = useState(false);
  const [paymentSettings,setPaymentSettings]=useState<PaymentSettings>(defaultPaymentSettings);
  const [paymentMethod,setPaymentMethod]=useState<PaymentMethod>('contact');
  const [receiptLoading,setReceiptLoading]=useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState('');
  const checkoutFormRef = useRef<HTMLFormElement>(null);
  const [notice, setNotice] = useState('');
  const onImageBlocked = useCallback(() => setNotice(tr("Ảnh xem trước được bảo vệ bản quyền. Vui lòng chọn mua để nhận file ảnh.")), [language]);
  useImageProtection(onImageBlocked);
  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {/* Cart remains available in memory. */}
  }, [cart]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 3500);
    return () => clearTimeout(timer);
  }, [notice]);
  const loadCatalogue = useCallback(async () => {
    setCatalogueLoading(true);
    try {
      const data = await requestApi<{artworks:Artwork[]}>('/api/catalog');
      if(!Array.isArray(data.artworks)) throw new Error('Không tải được bộ sưu tập. Vui lòng thử lại.');
      setArtworks(data.artworks);setCatalogueError('');
    } catch(error) { setCatalogueError(error instanceof Error?error.message:'Không tải được bộ sưu tập. Vui lòng thử lại.'); }
    finally {setCatalogueLoading(false);}
  },[]);
  useEffect(()=>{
    void loadCatalogue();
    const onFocus=()=>void loadCatalogue();
    const onStorage=(event:StorageEvent)=>{if(event.key==='hueart_catalog_updated')void loadCatalogue();};
    window.addEventListener('focus',onFocus);window.addEventListener('storage',onStorage);
    return ()=>{window.removeEventListener('focus',onFocus);window.removeEventListener('storage',onStorage);};
  },[loadCatalogue]);
  useEffect(()=>{setVisibleCount(12);},[category,search,language]);
  useEffect(()=>{
    if(!window.location.hash.startsWith('#artwork-'))return;
    const index=artworks.findIndex(art=>'#artwork-'+art.id===window.location.hash);
    if(index>=visibleCount)setVisibleCount(index+1);
    document.getElementById(window.location.hash.slice(1))?.scrollIntoView({block:'center'});
  },[artworks,visibleCount]);
  useEffect(()=>{setSelected(current=>current?artworks.find(art=>art.id===current.id)||null:null);},[artworks]);
  const heroArtwork=artworks.find(art=>art.id==='meridian-gate-twilight')||artworks[0];
  const hasUnavailableItem = cart.some(item=>!artworks.some(art=>art.id===item.artworkId));
  const hasPrint = cart.some(item => item.optionId === 'framed-print');
  const hasCopyright = cart.some(item => item.optionId === 'copyright');
  useEffect(()=>{
    if(paymentMethod==='cod'&&(!hasPrint||!paymentSettings.codEnabled)||(paymentMethod==='vietqr'||paymentMethod==='transfer')&&!paymentSettings.transferEnabled)setPaymentMethod('contact');
  },[paymentSettings,hasPrint,paymentMethod]);
  useEffect(()=>{
    const load=()=>{void requestApi<PaymentSettings>('/api/payment-settings').then(setPaymentSettings).catch(()=>{});};
    const changed=(e:StorageEvent)=>{if(e.key==='hueart_payment_settings_updated')load();};
    load();window.addEventListener('focus',load);window.addEventListener('storage',changed);
    return()=>{window.removeEventListener('focus',load);window.removeEventListener('storage',changed);};
  },[]);
  useEffect(()=>{
    const restore=()=>{
      const params=new URLSearchParams(window.location.hash.slice(1)),order=params.get('pay'),key=params.get('key');
      if(!/^DHT-[0-9]{8}-[A-F0-9]{8}$/.test(order||'')||!key||!/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(key))return;
      setPanel('checkout');setReceiptLoading(true);setOrderError('');
      void requestApi<Receipt>('/api/order-payment/'+order,{headers:{'X-HueArt-Checkout-Key':key}}).then(setReceipt).catch(e=>setOrderError(e instanceof Error?e.message:tr('Không tải được thông tin thanh toán.'))).finally(()=>setReceiptLoading(false));
    };
    restore();window.addEventListener('hashchange',restore);return()=>window.removeEventListener('hashchange',restore);
  },[]);

  const total = cartTotal(cart);
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const filtered = useMemo(() => {
    const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toLowerCase();
    const query = normalize(search.trim());
    return artworks.filter(art => (category === 'all' || category === art.collection) && normalize(`${art.titles[language]} ${art.locations[language]}`).includes(query));
  }, [category, search, language, artworks]);
  const openArtwork = (art: Artwork) => {
    const available=artworks.find(existing=>existing.id===art.id);
    if(!available){setNotice(tr('Tác phẩm chưa được xuất bản hoặc đã ngừng bán.'));void loadCatalogue();return;}
    setSelected(available);
    setOptionId('high-resolution');
    setQuantity(1);
  };
  const removeItem = (key: string) => setCart(items => items.filter(item => itemKey(item) !== key));
  const changeQuantity = (key: string, delta: number) => setCart(items => items.flatMap(item => {
    if (itemKey(item) !== key || item.optionId !== 'framed-print') return [item];
    const next = Math.min(99, item.quantity + delta);
    return next > 0 ? [{
      ...item,
      quantity: next
    }] : [];
  }));
  const closePanel = () => {
    if (!submitting) setPanel(null);
  };
  const sendOrder = async () => {
    if (hasUnavailableItem || submitting || !checkoutFormRef.current?.reportValidity() || !cart.length || hasCopyright && !rightsAccepted) return;
    setSubmitting(true);
    setOrderError('');
    try {
      const result = await submitOrder(cart, customer, rightsAccepted,paymentMethod);
      setReceipt(result);
      window.history.replaceState(null,'',`#pay=${result.orderNumber}&key=${result.paymentAccessKey}`);
      setCart([]);
    } catch (error) {
      setOrderError(error instanceof Error ? error.message : tr("Chưa gửi được đơn. Vui lòng thử lại."));
    } finally {
      setSubmitting(false);
    }
  };
  return <RateContext.Provider value={paymentSettings.exchangeRate}><div className="shop">
    <header className="shop-header">
      <a className="shop-brand" href="#home"><span>{tr("Nhiếp ảnh Nghệ thuật")}</span><strong>Đặng Huy Trứ</strong></a>
      <nav aria-label={tr("Điều hướng chính")}><a href="#gallery">{tr("Chọn ảnh")}</a><a href="#options">{tr("Bảng giá")}</a><a href="#contact">{tr("Liên hệ")}</a></nav><div className="shop-feature-actions"><button onClick={() => setSubmissionOpen(true)}><Camera size={15} /><span>{tr("Gửi tác phẩm")}</span></button><button onClick={() => setCuratorOpen(true)}><Sparkles size={15} /><span>{tr("Giám tuyển AI")}</span></button></div><LanguageSwitcher />
      <button className="shop-cart-button" onClick={() => setPanel('cart')} aria-label={tr("Giỏ hàng, {0} sản phẩm", count)}><ShoppingBag size={18} /><span>{tr("Giỏ hàng")}</span><b>{count}</b></button>
    </header>
    <main id="home">
      <section className="shop-hero">
        <>{heroArtwork&&<ProtectedImage className="shop-hero-image" src={heroArtwork.imageUrl} alt={heroArtwork.titles[language]} view="hero" loading="eager" fetchPriority="high" />}</>
        <div className="shop-hero-content shop-container">
          <span className="shop-eyebrow">{tr("Góc nhìn từ xứ Huế")}</span>
          <h1>Artistic photography<br /><em>ĐẶNG HUY TRỨ</em></h1>
          <p>{tr("Mang một góc Huế về với bạn.")}<br />{tr("Chọn ảnh yêu thích, nhận file hoặc đặt bản in có khung.")}</p>
          <a href="#gallery" className="shop-primary">{tr("Chọn ảnh ngay ")}<ArrowDown size={16} /></a>
          <span className="shop-hero-note">{tr("File từ 5 USD · Bản in có khung 7 USD")}</span>
        </div>
      </section>
      <section id="options" className="shop-container shop-pricing">
        <div className="shop-section-title"><div><span className="shop-eyebrow">{tr("Giá rõ ràng, lựa chọn dễ dàng")}</span><h2>{tr("Ba cách sở hữu một bức ảnh")}</h2></div><p>{tr("Cùng một bảng giá cho mọi ảnh.")}</p></div>
        <div className="shop-option-grid">{SALE_OPTIONS.map((option, index) => {
            const Icon = icons[index];
            return <article key={option.id} className="shop-price-card"><Icon size={23} /><div className="shop-price-heading"><h3>{tr(option.title)}</h3><strong>{<Price cents={(option.priceUSD)*100}/>}</strong></div><p>{tr(option.description)}</p><a href="#gallery" onClick={() => setNotice(tr("Chọn một bức ảnh rồi chọn “{0}”.", tr(option.title)))}>{tr("Chọn ảnh ")}<ArrowRight size={15} /></a></article>;
          })}</div>
      </section>
      <section id="gallery" className="shop-container shop-gallery">
        <div className="shop-section-title"><div><span className="shop-eyebrow">{tr("Bộ sưu tập")}</span><h2>{tr("Chọn một góc Huế của bạn")}</h2></div><label className="shop-search"><Search size={17} /><input aria-label={tr("Tìm ảnh theo tên hoặc địa điểm")} placeholder={tr("Tìm ảnh, địa điểm…")} value={search} onChange={event => setSearch(event.target.value)} /></label></div>
        {catalogueError&&<div className="shop-order-error" role="alert">{tr(catalogueError)}<button className="shop-text-button" onClick={()=>void loadCatalogue()}>{tr('Thử lại')}</button></div>}
        <div className="shop-filters" aria-label={tr("Lọc bộ sưu tập")}>{categories.map(([id, label]) => <button key={id} aria-pressed={category === id} className={category === id ? 'active' : ''} onClick={() => setCategory(id)}>{tr(label)}</button>)}<span>{filtered.length}{tr(" ảnh")}</span></div>
        {catalogueLoading&&!artworks.length?<div className="shop-empty" role="status">{tr("Đang tải ảnh…")}</div>:filtered.length ? <div className="shop-art-grid">{filtered.slice(0,visibleCount).map(art => <article key={art.id} id={`artwork-${art.id}`} className="shop-art-card">
          <button className="shop-art-image" onClick={() => openArtwork(art)} aria-label={tr("Chọn mua {0}", art.titles[language])}><ProtectedImage src={art.imageUrl} alt={art.titles[language]} loading="lazy" /><span className="shop-art-caption">{tr("Xem ảnh & chọn mua ")}<ArrowRight size={15} /></span></button>
          <div className="shop-art-info"><p className="shop-location"><MapPin size={12} />{art.locations[language]}</p>{art.photographer&&<p className="shop-photographer">{tr("Ảnh:")} {art.photographer}</p>}<h3><button onClick={() => openArtwork(art)}>{art.titles[language]}</button></h3><div className="shop-art-bottom"><span>{tr("Từ ")}<strong><Price cents={500}/></strong></span><button onClick={() => openArtwork(art)}>{tr("Chọn mua ")}<ArrowRight size={15} /></button></div></div>
        </article>)}</div> : <div className="shop-empty"><h3>{tr("Chưa tìm thấy ảnh phù hợp")}</h3><p>{tr("Thử tên địa điểm khác hoặc xem tất cả ảnh.")}</p><button className="shop-secondary" onClick={() => {
            setSearch('');
            setCategory('all');
          }}>{tr("Xem tất cả ảnh")}</button></div>}
        {filtered.length>visibleCount&&<div className="shop-load-more"><button className="shop-secondary" onClick={()=>setVisibleCount(count=>count+12)}>{tr('Xem thêm ảnh')}</button></div>}
      </section>
      <section className="shop-how shop-container"><div><span className="shop-eyebrow">{tr("Đặt ảnh thật đơn giản")}</span><h2>{tr("Chọn ảnh. Chọn loại. Liên hệ đặt hàng.")}</h2></div><ol><li><b>01</b><span>{tr("Chọn ảnh và một trong ba lựa chọn mua.")}</span></li><li><b>02</b><span>{tr("Kiểm tra giỏ hàng, điền thông tin liên hệ và gửi đơn trực tiếp.")}</span></li><li><b>03</b><span>{tr("Nhận xác nhận, thống nhất thanh toán và cách giao ảnh qua điện thoại.")}</span></li></ol></section>
    </main>
    <footer id="contact" className="shop-footer"><div className="shop-container shop-footer-grid"><div><span className="shop-eyebrow">{tr("Huế · Việt Nam")}</span><h2>{tr("Nhiếp ảnh Nghệ thuật")}<br />Đặng Huy Trứ</h2><p>{tr("Ảnh đẹp để ngắm, lưu giữ và mang về.")}</p><p>{tr("© Ảnh xem trước có bản quyền. Vui lòng không sao chép hoặc sử dụng khi chưa được phép.")}</p></div><div><h3>{tr("Liên hệ đặt ảnh")}</h3><a href={`mailto:${CONTACT_EMAIL}`} target="_blank" rel="noopener noreferrer"><Mail size={16} />{CONTACT_EMAIL}</a><a href="tel:+84778480911">{tr("Điện thoại: +84 778 480 911")}</a><p>{tr("273 Điện Biên Phủ, Thành phố Huế")}</p></div><div><h3>{tr("Thông tin mua hàng")}</h3><p>{tr("Gửi đơn trực tiếp, không cần tài khoản email. Người bán liên hệ xác nhận và thống nhất cách giao file.")}</p><p>{tr("Bản in 40 × 60 cm đã gồm khung; phí vận chuyển được báo riêng.")}</p><p>{tr("Chuyển quyền tác giả được xác nhận bằng thỏa thuận riêng.")}</p></div></div><div className="shop-container shop-copyright">© {new Date().getFullYear()}{tr(" Nhiếp ảnh Nghệ thuật Đặng Huy Trứ ")}<span>{tr('USD kèm giá VND tham khảo · 1 USD = {0}',vnd(paymentSettings.exchangeRate))}</span></div></footer>
    {selected && <Modal title={tr("Chọn cách mua ảnh")} onClose={() => setSelected(null)} wide>
      <div className="shop-product"><div className="shop-product-photo"><ProtectedImage src={selected.imageUrl} alt={selected.titles[language]} view="detail" loading="eager" /><p><MapPin size={13} />{selected.locations[language]}</p></div><div className="shop-product-details"><h3>{selected.titles[language]}</h3><p className="shop-story">{selected.stories[language]}</p>{selected.photographer&&<p className="shop-photographer">{tr("Ảnh:")} {selected.photographer}</p>}<fieldset className="shop-purchase-options"><legend>{tr("Chọn loại mua")}</legend>{SALE_OPTIONS.map(option => <label key={option.id} className={`shop-radio-card ${optionId === option.id ? 'selected' : ''}`}><input type="radio" name="purchase-option" value={option.id} checked={optionId === option.id} onChange={() => {
                setOptionId(option.id);
                setQuantity(1);
              }} /><span><strong>{tr(option.title)}</strong><small>{tr(option.short)}</small></span><b>{<Price cents={(option.priceUSD)*100}/>}</b></label>)}</fieldset><p className="shop-option-description">{tr(getOption(optionId).description)}</p>
        {optionId === 'framed-print' && <div className="shop-quantity-row"><span>{tr("Số lượng bản in")}</span><div className="shop-quantity"><button aria-label={tr("Giảm số lượng")} onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity === 1}><Minus size={14} /></button><output>{quantity}</output><button aria-label={tr("Tăng số lượng")} onClick={() => setQuantity(Math.min(99, quantity + 1))} disabled={quantity === 99}><Plus size={14} /></button></div></div>}
        <div className="shop-product-total"><span>{tr("Tiền ảnh")}{optionId === 'framed-print' ? tr(" · chưa gồm vận chuyển") : ''}</span><strong>{<Price cents={(getOption(optionId).priceUSD * quantity)*100}/>}</strong></div><button className="shop-primary shop-full" onClick={() => {
            setCart(items => addItem(items, {
              artworkId: selected.id,
              optionId,
              quantity
            }));
            setSelected(null);
            setPanel('cart');
          }}><ShoppingBag size={17} />{tr("Thêm vào giỏ hàng")}</button><p className="shop-fine-print">{tr(getOption(optionId).delivery)}</p></div></div>
    </Modal>}
    {panel === 'cart' && <Modal title={tr("Giỏ hàng ({0})", count)} onClose={closePanel}>
      {cart.length ? <><div className="shop-cart-items">{cart.map(item => {
            const art = artworks.find(art => art.id === item.artworkId);
        if(!art) return <div className="shop-cart-item" key={itemKey(item)}><div><p>{tr(catalogueLoading?'Đang tải thông tin ảnh…':catalogueError?'Không tải được bộ sưu tập. Vui lòng thử lại.':'Tác phẩm không còn trong danh sách bán.')}</p><small>{tr(getOption(item.optionId).title)}</small></div><button className="shop-icon" onClick={()=>removeItem(itemKey(item))} aria-label={tr('Xóa khỏi giỏ hàng')}><Trash2 size={16}/></button></div>;
            return <div className="shop-cart-item" key={itemKey(item)}><ProtectedImage src={art.imageUrl} alt={art.titles[language]} view="thumb" /><div><h3>{art.titles[language]}</h3><p>{tr(getOption(item.optionId).title)}</p>{item.optionId === 'framed-print' ? <><small>{tr("Đã gồm khung · Chưa gồm vận chuyển")}</small><div className="shop-quantity"><button aria-label={tr("Giảm số lượng {0}", art.titles[language])} onClick={() => changeQuantity(itemKey(item), -1)}><Minus size={13} /></button><output>{item.quantity}</output><button aria-label={tr("Tăng số lượng {0}", art.titles[language])} onClick={() => changeQuantity(itemKey(item), 1)} disabled={item.quantity === 99}><Plus size={13} /></button></div></> : <small>{tr("1 file · Giao qua email")}</small>}</div><div className="shop-cart-price"><strong>{<Price cents={(itemTotal(item))*100}/>}</strong><button className="shop-icon" onClick={() => removeItem(itemKey(item))} aria-label={tr("Xóa {0}, {1}", art.titles[language], tr(getOption(item.optionId).title))}><Trash2 size={16} /></button></div></div>;
          })}</div><div className="shop-summary">{catalogueError&&<button className="shop-secondary shop-full" onClick={()=>void loadCatalogue()}>{tr("Thử lại")}</button>}{hasUnavailableItem&&<p role="status">{tr(catalogueLoading?'Đang tải thông tin ảnh…':catalogueError?'Không tải được bộ sưu tập. Vui lòng thử lại.':'Vui lòng xóa tác phẩm không còn bán khỏi giỏ hàng để tiếp tục.')}</p>}<div><span>{tr("Tiền ảnh")}</span><strong>{<Price cents={(total)*100}/>}</strong></div><p>{hasPrint ? tr("Phí vận chuyển được báo riêng. Bạn có thể trả trước tiền ảnh sau khi gửi đơn.") : tr("Giao file qua email. Không có phí vận chuyển.")}</p><button className="shop-primary shop-full" disabled={hasUnavailableItem} onClick={() => {
            setReceipt(null);
            setOrderError('');
            setRightsAccepted(false);
            setPanel('checkout');
          }}>{tr("Tiếp tục đặt hàng ")}<ArrowRight size={16} /></button><button className="shop-text-button" onClick={closePanel}>{tr("Chọn thêm ảnh")}</button></div></> : <div className="shop-empty"><ShoppingBag size={36} /><h3>{tr("Giỏ hàng đang trống")}</h3><p>{tr("Chọn một bức ảnh để bắt đầu.")}</p><button className="shop-primary" onClick={closePanel}>{tr("Tiếp tục chọn ảnh")}</button></div>}
    </Modal>}
    {panel === 'checkout' && <Modal title={receipt ? tr("Đặt hàng thành công") : tr("Thông tin đặt hàng")} onClose={closePanel}>
      {receiptLoading?<div className="shop-checkout" role="status">{tr('Đang tải thông tin thanh toán…')}</div>:receipt ? <Suspense fallback={<p>{tr('Đang tải…')}</p>}><PaymentReceipt initial={receipt} onClose={closePanel}/></Suspense> : <form ref={checkoutFormRef} className="shop-checkout" onSubmit={event => {
        event.preventDefault();
        void sendOrder();
      }} aria-busy={submitting}>
        <p>{tr("Đặt trực tiếp trên website, không cần Gmail. Người bán sẽ gọi điện hoặc liên hệ để xác nhận đơn và hướng dẫn thanh toán.")}</p><div className="shop-mini-summary">{cart.map(item => <div key={itemKey(item)}><span>{(artworks.find(art => art.id === item.artworkId)?.titles[language] || tr('Đang tải thông tin ảnh…'))}<small>{tr(getOption(item.optionId).title)}{tr(" × ")}{item.quantity}</small></span><b>{<Price cents={(itemTotal(item))*100}/>}</b></div>)}<div className="shop-mini-total"><strong>{tr("Tiền ảnh")}</strong><strong>{<Price cents={(total)*100}/>}</strong></div></div>
        <label>{tr("Họ và tên ")}<span>*</span><input required disabled={submitting} minLength={2} autoComplete="name" maxLength={100} value={customer.name} onChange={event => setCustomer({
            ...customer,
            name: event.target.value
          })} /></label>
        <label>{tr("Số điện thoại liên hệ ")}<span>*</span><input required disabled={submitting} type="tel" minLength={7} autoComplete="tel" maxLength={30} value={customer.phone} onChange={event => setCustomer({
            ...customer,
            phone: event.target.value
          })} /></label>
        <label>{tr("Email liên hệ / nhận file (không bắt buộc)")}<input disabled={submitting} type="email" autoComplete="email" maxLength={150} value={customer.email} onChange={event => setCustomer({
            ...customer,
            email: event.target.value
          })} /></label>
        {hasPrint && <><label>{tr("Địa chỉ nhận bản in ")}<span>*</span><textarea required disabled={submitting} autoComplete="street-address" minLength={5} maxLength={500} rows={2} value={customer.address} onChange={event => setCustomer({
              ...customer,
              address: event.target.value
            })} /></label><p className="shop-delivery-note"><Frame size={19} />{tr("Bản in 40 × 60 cm đã gồm khung. Phí vận chuyển chưa bao gồm; sẽ được báo riêng để bạn xác nhận trước khi thanh toán.")}</p></>}
        <label>{tr("Ghi chú (không bắt buộc)")}<textarea disabled={submitting} rows={2} maxLength={1000} placeholder={tr("Yêu cầu về file, khung hoặc cách giao ảnh…")} value={customer.note} onChange={event => setCustomer({
            ...customer,
            note: event.target.value
          })} /></label>
        <PaymentOptions settings={paymentSettings} method={paymentMethod} onChange={setPaymentMethod} hasPrint={hasPrint} disabled={submitting}/>
        {hasCopyright && <label className="shop-consent"><input type="checkbox" required disabled={submitting} checked={rightsAccepted} onChange={event => setRightsAccepted(event.target.checked)} /><span>{tr("Tôi chọn mua file kèm chuyển toàn bộ quyền tác giả. Hai bên sẽ xác nhận nội dung chuyển quyền bằng văn bản trước khi thanh toán.")}</span></label>}
        {orderError && <p className="shop-order-error" role="alert">{tr(orderError)}{tr(" Giỏ hàng được giữ lại để bạn thử lại.")}</p>}
        <button className="shop-primary shop-full" type="button" onClick={() => void sendOrder()} disabled={submitting || !cart.length || hasUnavailableItem}><ShoppingBag size={17} />{submitting ? tr("Đang gửi đơn…") : tr(paymentMethod==='vietqr'||paymentMethod==='transfer'?'Gửi đơn & xem thanh toán':'Gửi đơn hàng')}</button><p className="shop-fine-print">{tr('Đơn được lưu trước khi hiển thị thanh toán. Website không tự trừ tiền khi bạn gửi đơn.')}</p><button type="button" disabled={submitting} className="shop-text-button" onClick={() => setPanel('cart')}>{tr("Quay lại giỏ hàng")}</button>
      </form>}
    </Modal>}
    <Suspense fallback={null}>{curatorOpen && <CuratorModal isOpen onClose={() => setCuratorOpen(false)} onSelectArtwork={openArtwork} />} {submissionOpen && <SubmissionModal onClose={() => setSubmissionOpen(false)} />}</Suspense>
    <ChatDock hidden={Boolean(selected||panel||curatorOpen||submissionOpen)}/>
    {notice && <div className="shop-toast" role="status">{notice}</div>}
  </div></RateContext.Provider>;
}
