import Price from './Price';
import {SALE_OPTIONS,type SaleOptionId} from './catalog';
import {requestApi} from './ordersApi';
import type {PaymentSettings} from './paymentTypes';
import {REVENUE_POLICY} from './revenueTerms';
import { MAX_UPLOAD_MB } from './platform';
import { useShopLanguage } from './language';
import { useEffect, useRef, useState } from 'react';
import { Camera, Check, Upload } from 'lucide-react';
import Modal from './Modal';
import { ProtectedImage } from './ProtectedImage';
export default function SubmissionModal({
  onClose
}: {
  onClose: () => void;
}) {
  const {
    language,
    tr
  } = useShopLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [fields, setFields] = useState({
    title: '',
    titleEn: '',
    titleFr: '',
    authorName: '',
    authorEmail: '',
    authorPhone: '',
    location: '',
    story: '',
    collection: 'imperial-echoes'
  });
  const [priceUSD,setPriceUSD]=useState<Record<SaleOptionId,string>>({'copyright':'10','high-resolution':'5','framed-print':'7'});
  const [exchangeRate,setExchangeRate]=useState<number|null>(null);
  const [rateError,setRateError]=useState(false);
  const [rateReload,setRateReload]=useState(0);
  useEffect(()=>{
    let active=true;const load=()=>{void requestApi<PaymentSettings>('/api/payment-settings').then(settings=>{if(active){setExchangeRate(settings.exchangeRate);setRateError(false);}}).catch(()=>{if(active)setRateError(true);});};
    load();window.addEventListener('focus',load);return()=>{active=false;window.removeEventListener('focus',load);};
  },[rateReload]);
  const [revenueTermsAccepted,setRevenueTermsAccepted]=useState(false);
  const [rightsConfirmed, setRightsConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [reference, setReference] = useState('');
  const [submissionKey, setSubmissionKey] = useState(() => crypto.randomUUID());
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    setSubmissionKey(crypto.randomUUID());
  }, [file, fields, rightsConfirmed,revenueTermsAccepted,priceUSD]);
  useEffect(() => {
    if (!file) {
      setPreview('');
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  const change = (name: keyof typeof fields, value: string) => setFields(previous => ({
    ...previous,
    [name]: value
  }));
  const selectFile = (selected: File | undefined) => {
    if (!selected) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(selected.type) || selected.size > MAX_UPLOAD_MB * 1024 * 1024) {
      setError(tr("Chọn ảnh JPG, PNG hoặc WebP, tối đa {0} MB.",MAX_UPLOAD_MB));
      return;
    }
    setError('');
    setFile(selected);
  };
  const submit = async () => {
    if (busy || !formRef.current?.reportValidity()) return;
    if (!file) {
      setError(tr("Vui lòng chọn ảnh tác phẩm."));
      return;
    }
    if(!revenueTermsAccepted){setError(tr('Vui lòng đọc và đồng ý mức phí cộng tác 20% trước khi gửi tác phẩm.'));return;}
    if(exchangeRate===null||rateError){setError(tr('Chưa tải được tỷ giá. Vui lòng bấm Thử lại trong phần giá bán.'));return;}
    const pricesCents=Object.fromEntries(SALE_OPTIONS.map(option=>[option.id,Math.round(Number(priceUSD[option.id])*100)]));
    if(Object.values(pricesCents).some(cents=>!Number.isFinite(cents)||cents<1||cents>1000000)){setError(tr('Giá USD phải từ 0,01 đến 10.000, tối đa 2 chữ số thập phân.'));return;}
    setBusy(true);
    setError('');
    try {
      const data = new FormData();
      data.append('image', file);
      data.append('metadata', JSON.stringify({
        ...fields,
        submissionKey,
        pricesCents,
        rightsConfirmed,revenueTermsAccepted,revenueTermsVersion:REVENUE_POLICY.version
      }));
      const response = await fetch('/api/submissions', {
        method: 'POST',
        body: data,
        credentials: 'same-origin'
      });
      if (!response.headers.get('Content-Type')?.includes('application/json')) throw new Error(tr("Chưa gửi được tác phẩm. Vui lòng thử lại."));
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || tr("Chưa gửi được tác phẩm. Vui lòng thử lại."));
      setReference(result.reference);
    } catch (error) {
      setError(error instanceof Error ? error.message : tr("Chưa gửi được tác phẩm. Vui lòng thử lại."));
    } finally {
      setBusy(false);
    }
  };
  return <Modal title={tr("Gửi tác phẩm")} onClose={() => {
    if (!busy) onClose();
  }} wide closeOnBackdrop>
    {reference ? <div className="shop-checkout"><div className="shop-draft-status"><Check size={28} /><div><h3>{tr("Đã tiếp nhận tác phẩm")}</h3><p>{tr("Ảnh và hồ sơ đã được lưu để quản trị viên xem xét. Tác phẩm chưa được công khai trên website.")}</p></div></div><div className="shop-order-recipient"><span>{tr("Mã hồ sơ")}</span><strong>{reference}</strong></div><button className="shop-primary" onClick={onClose}>{tr("Đóng")}</button></div> : <form className="shop-checkout submission-form" ref={formRef} onSubmit={event => {
      event.preventDefault();
      void submit();
    }}>
      <div className="submission-collab-intro"><span className="shop-eyebrow">{tr("Dành cho nhiếp ảnh gia")}</span><h3>{tr("Cộng tác bán ảnh cùng NHIẾP ẢNH NGHỆ THUẬT HUẾ")}</h3><p>{tr("Gửi ảnh của bạn để được xét duyệt và cộng tác bán ảnh cùng NHIẾP ẢNH NGHỆ THUẬT HUẾ. Xem rõ tỷ lệ phân chia doanh thu bên dưới trước khi gửi.")}</p></div>
      <section className="submission-revenue-policy" aria-labelledby="submission-revenue-title"><h3 id="submission-revenue-title">{tr('Phân chia doanh thu bán ảnh')}</h3><p><strong>{tr('Tác giả nhận {0}%',REVENUE_POLICY.photographerPercent)}</strong><span>{tr('Phí cộng tác tổng cộng {0}%',REVENUE_POLICY.totalFeePercent)}</span></p><ul><li><b>{REVENUE_POLICY.associationFundPercent}%</b> {tr('dành cho quỹ Hội Nhiếp ảnh')}</li><li><b>{REVENUE_POLICY.administrationPercent}%</b> {tr('dành cho chi phí quản trị website')}</li></ul></section>
      <label className="submission-upload" onDragOver={event => event.preventDefault()} onDrop={event => {
        event.preventDefault();
        if (!busy) selectFile(event.dataTransfer.files[0]);
      }}><Upload size={25} /><strong>{tr("Chọn ảnh hoặc kéo thả vào đây")}</strong><span>{tr("JPG, PNG, WebP · Tối đa {0} MB",MAX_UPLOAD_MB)}</span><input aria-label={tr("Chọn ảnh tác phẩm")} type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={event => selectFile(event.target.files?.[0])} /></label>
      {preview && <div className="submission-preview"><ProtectedImage src={preview} alt={fields.title || tr("Ảnh tác phẩm")} /><small>{file?.name}</small></div>}
      <div className="submission-fields"><label>{tr("Tên tác phẩm (Tiếng Việt) *")}<input required minLength={2} maxLength={160} value={fields.title} disabled={busy} onChange={event => change('title', event.target.value)} /></label><label>{tr("Tên tiếng Anh (không bắt buộc)")}<input maxLength={160} value={fields.titleEn} disabled={busy} onChange={event => change('titleEn', event.target.value)} /></label><label>{tr("Tên tiếng Pháp (không bắt buộc)")}<input maxLength={160} value={fields.titleFr} disabled={busy} onChange={event => change('titleFr', event.target.value)} /></label><label>{tr("Thuộc bộ sưu tập")}<select value={fields.collection} disabled={busy} onChange={event => change('collection', event.target.value)}><option value="imperial-echoes">{tr("Di sản Huế")}</option><option value="perfume-river">{tr("Sông nước")}</option><option value="living-traditions">{tr("Đời sống")}</option><option value="poetic-monochrome">{tr("Ảnh đen trắng")}</option></select></label><label>{tr("Họ tên tác giả *")}<input required autoComplete="name" minLength={2} maxLength={100} value={fields.authorName} disabled={busy} onChange={event => change('authorName', event.target.value)} /></label><label>{tr("Số điện thoại liên hệ *")}<input required autoComplete="tel" type="tel" minLength={7} maxLength={30} value={fields.authorPhone} disabled={busy} onChange={event => change('authorPhone', event.target.value)} /></label><label>{tr("Email (không bắt buộc)")}<input autoComplete="email" type="email" maxLength={150} value={fields.authorEmail} disabled={busy} onChange={event => change('authorEmail', event.target.value)} /></label><label>{tr("Địa điểm chụp")}<input maxLength={200} value={fields.location} disabled={busy} onChange={event => change('location', event.target.value)} /></label></div>
      <section className="submission-price"><h3>{tr('Giá bán tác phẩm')}</h3><label>{tr('Đơn vị tiền tệ')}<select defaultValue="USD" disabled={busy}><option value="USD">USD</option></select></label><div className="submission-price-grid">{SALE_OPTIONS.map(option=><div key={option.id}><label>{tr('Giá {0} (USD) *',tr(option.title))}<input type="number" inputMode="decimal" required min="0.01" max="10000" step="0.01" value={priceUSD[option.id]} disabled={busy} onChange={event=>setPriceUSD(previous=>({...previous,[option.id]:event.target.value}))}/></label><div className="submission-price-preview" aria-live="polite">{exchangeRate!==null&&!rateError&&Number(priceUSD[option.id])>0?<Price cents={Math.round(Number(priceUSD[option.id])*100)} rate={exchangeRate}/>:<small>{tr(rateError?'Không tải được tỷ giá.':'Nhập giá USD để xem quy đổi VND.')}</small>}</div></div>)}</div>{exchangeRate!==null&&!rateError?<small>{tr('Tỷ giá do admin cấu hình: 1 USD = {0} VND',exchangeRate.toLocaleString(language==='vi'?'vi-VN':language==='fr'?'fr-FR':'en-US'))}</small>:<p>{tr(rateError?'Không tải được tỷ giá.':'Đang tải tỷ giá…')}{rateError&&<button className="shop-text-button" type="button" onClick={()=>{setRateError(false);setExchangeRate(null);setRateReload(previous=>previous+1);}}>{tr('Thử lại')}</button>}</p>}<p>{tr('Nhập giá USD riêng cho từng loại mua. Giá VND được tự quy đổi theo tỷ giá trong admin.')}</p><p>{tr('Giá bán trước phí cộng tác 20%; tác giả nhận 80%. Giá chỉ được công khai sau khi admin chấp nhận tác phẩm.')}</p></section>
      <label>{tr("Câu chuyện về tác phẩm")}<textarea maxLength={2000} rows={3} value={fields.story} disabled={busy} onChange={event => change('story', event.target.value)} /></label><label className="shop-consent"><input type="checkbox" required checked={rightsConfirmed} disabled={busy} onChange={event => setRightsConfirmed(event.target.checked)} /><span>{tr("Tôi là tác giả hoặc có quyền gửi ảnh này để quản trị viên xem xét. Việc gửi ảnh không tự chuyển quyền tác giả. Tôi chịu trách nhiệm pháp lý về bản quyền tác phẩm.")}</span></label>
      <label className="shop-consent"><input type="checkbox" required checked={revenueTermsAccepted} disabled={busy} onChange={event=>setRevenueTermsAccepted(event.target.checked)}/><span>{tr('Tôi đã đọc và đồng ý phí cộng tác 20% doanh thu bán ảnh: 10% cho quỹ Hội Nhiếp ảnh và 10% cho chi phí quản trị; tác giả nhận 80% còn lại.')}</span></label>
      {error && <p className="shop-order-error" role="alert">{tr(error)}</p>}<button className="shop-primary" type="button" disabled={busy} onClick={() => void submit()}><Camera size={17} />{busy ? tr("Đang gửi tác phẩm…") : tr("Gửi tác phẩm")}</button>
    </form>}
  </Modal>;
}
