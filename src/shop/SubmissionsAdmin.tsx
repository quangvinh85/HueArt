import Price from './Price';
import {SALE_OPTIONS,type SaleOptionId} from './catalog';
import {money} from './ordersApi';
import type {PaymentSettings} from './paymentTypes';
import type {Artwork} from '../types';
import { useShopLanguage } from './language';
import { useEffect, useRef, useState } from 'react';
import { requestApi, dateTime } from './ordersApi';
import Modal from './Modal';
import { ProtectedImage } from './ProtectedImage';
const labels = {
  pending: 'Chờ xem xét',
  reviewing: 'Đang xem xét',
  accepted: 'Đã chấp nhận',
  rejected: 'Từ chối'
};
interface Submission {
  id: string;
  reference: string;
  title: string;
  titleEn: string;
  titleFr: string;
  authorName: string;
  authorPhone: string;
  authorEmail: string;
  location: string;
  story: string;
  collection: string;
  imageUrl: string;
  status: keyof typeof labels;
  adminNote: string;
  version: number;
  createdAt: string;
  pricesCents?:Artwork['pricesCents'];
  proposedPricesCents?:Artwork['pricesCents'];
  revenueTerms:{totalFeePercent:number;associationFundPercent:number;associationFundName?:string;administrationPercent:number;photographerPercent:number;version:string;acceptedAt:string}|null;
}
export default function SubmissionsAdmin() {
  const {
    language,
    tr
  } = useShopLanguage();
  const pricingFormRef=useRef<HTMLFormElement>(null);
  const [editPrices,setEditPrices]=useState<Record<SaleOptionId,string>>({'copyright':'10','high-resolution':'5','framed-print':'7'});
  const [exchangeRate,setExchangeRate]=useState<number|null>(null);
  const [items, setItems] = useState<Submission[]>([]),
    [selected, setSelected] = useState<Submission | null>(null),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  const load = async () => {
    setBusy(true);
    setError('');
    try {
      const [submissions,payment]=await Promise.allSettled([requestApi<{submissions:Submission[]}>('/api/admin/submissions'),requestApi<PaymentSettings>('/api/payment-settings')]);
      if(submissions.status==='rejected')throw submissions.reason;
      setItems(submissions.value.submissions);
      setExchangeRate(payment.status==='fulfilled'?payment.value.exchangeRate:null);
    } catch (error) {
      setError(error instanceof Error ? error.message : tr("Không tải được hồ sơ."));
    } finally {
      setBusy(false);
    }
  };
  useEffect(() => {
    void load();
  }, []);
  const save = async () => {
    if (!selected||!pricingFormRef.current?.reportValidity()) return;
    const pricesCents=Object.fromEntries(SALE_OPTIONS.map(option=>[option.id,Math.round(Number(editPrices[option.id])*100)]));
    if(Object.values(pricesCents).some(cents=>!Number.isFinite(cents)||cents<1||cents>1000000)){setError(tr('Giá USD phải từ 0,01 đến 10.000, tối đa 2 chữ số thập phân.'));return;}
    setBusy(true);
    setError('');
    try {
      const result = await requestApi<Submission>(`/api/admin/submissions/${selected.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: selected.status,
          adminNote: selected.adminNote,
          version: selected.version,
          pricesCents
        })
      });
      setItems(previous => previous.map(item => item.id === result.id ? result : item));
      try {localStorage.setItem('hueart_catalog_updated',String(Date.now()));} catch {}
      setSelected(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : tr("Không lưu được hồ sơ."));
    } finally {
      setBusy(false);
    }
  };
  return <section><div className="admin-heading"><div><h2>{tr("Tác phẩm gửi đến")}</h2><p>{tr("Tác phẩm đã chấp nhận sẽ tự hiển thị trên cửa hàng và có thể đặt mua.")}</p></div><button className="shop-secondary" disabled={busy} onClick={() => void load()}>{tr("Làm mới")}</button></div>{error && <p className="shop-order-error" role="alert">{tr(error)}</p>}<div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>{tr("Mã hồ sơ")}</th><th>{tr("Tác phẩm")}</th><th>{tr("Tác giả")}</th><th>{tr("Trạng thái")}</th><th>{tr("Chi tiết")}</th></tr></thead><tbody>{items.map(item => <tr key={item.id}><td>{item.reference}<small>{dateTime(item.createdAt, language)}</small></td><td>{item.title}</td><td>{item.authorName}<small>{item.authorPhone}</small></td><td>{tr(labels[item.status])}</td><td><button className="shop-secondary" onClick={() => {
                setError('');
                setEditPrices(Object.fromEntries(SALE_OPTIONS.map(option=>[option.id,String((item.pricesCents?.[option.id]??option.priceUSD*100)/100)])) as Record<SaleOptionId,string>);
                setSelected({
                  ...item
                });
              }}>{tr("Xem hồ sơ")}</button></td></tr>)}</tbody></table>{!items.length && <div className="shop-empty"><p>{busy ? tr("Đang tải…") : tr("Chưa có tác phẩm gửi đến.")}</p></div>}</div>
    {selected && <Modal title={selected.reference} wide onClose={() => {
      if (!busy) setSelected(null);
    }}><form className="shop-checkout" ref={pricingFormRef} onSubmit={event=>{event.preventDefault();void save();}}><div className="submission-preview"><ProtectedImage src={selected.imageUrl} alt={selected.title} view="detail" loading="eager" /></div><h3>{selected.title}</h3><div className="admin-note"><strong>{tr('Giá bán tác giả đề xuất')}</strong>{selected.proposedPricesCents&&Object.keys(selected.proposedPricesCents).length?SALE_OPTIONS.filter(option=>selected.proposedPricesCents?.[option.id]!==undefined).map(option=><p key={option.id}>{tr(option.title)}: {exchangeRate!==null?<Price cents={selected.proposedPricesCents![option.id]!} rate={exchangeRate}/>:money(selected.proposedPricesCents![option.id]!,language)}</p>):<p>{tr('Hồ sơ này dùng giá mặc định của cửa hàng.')}</p>}</div><section className="submission-price"><h3>{tr('Giá bán admin chốt')}</h3><div className="submission-price-grid">{SALE_OPTIONS.map(option=><div key={option.id}><label>{tr('Giá {0} (USD) *',tr(option.title))}<input type="number" inputMode="decimal" required min="0.01" max="10000" step="0.01" disabled={busy} value={editPrices[option.id]} onChange={event=>setEditPrices(previous=>({...previous,[option.id]:event.target.value}))}/></label>{exchangeRate!==null&&Number(editPrices[option.id])>0&&<Price cents={Math.round(Number(editPrices[option.id])*100)} rate={exchangeRate}/>}</div>)}</div><p>{tr('Admin có thể chỉnh cả ba giá trước khi duyệt. Cửa hàng dùng giá admin chốt khi trạng thái là Đã chấp nhận.')}</p></section><div className="admin-note">{selected.revenueTerms?<><strong>{tr('Đã đồng ý phí cộng tác {0}%',selected.revenueTerms.totalFeePercent)}</strong><p>{tr('Quỹ {0}: {1}% · Quản trị: {2}% · Tác giả: {3}%',selected.revenueTerms.associationFundName||'Hội Nhiếp ảnh',selected.revenueTerms.associationFundPercent,selected.revenueTerms.administrationPercent,selected.revenueTerms.photographerPercent)}</p><time>{dateTime(selected.revenueTerms.acceptedAt,language)}</time></>:tr('Hồ sơ này chưa ghi nhận xác nhận mức phí 20%.')}</div>{items.some(item=>item.id===selected.id&&item.status==='accepted')&&<a className="shop-secondary" href={`/#artwork-submission-${selected.id}`} target="_blank" rel="noopener noreferrer">{tr('Xem trên cửa hàng')}</a>}{selected.titleEn && <p>{selected.titleEn}</p>}{selected.titleFr && <p>{selected.titleFr}</p>}<p>{selected.authorName} · {selected.authorPhone} · {selected.authorEmail}</p><p>{selected.location}</p><p>{selected.story}</p><label>{tr("Trạng thái")}<select value={selected.status} disabled={busy} onChange={event => setSelected({
            ...selected,
            status: event.target.value as Submission['status']
          })}>{Object.entries(labels).map(([id, label]) => <option key={id} value={id}>{tr(label)}</option>)}</select></label><label>{tr("Ghi chú nội bộ")}<textarea rows={3} maxLength={2000} value={selected.adminNote} disabled={busy} onChange={event => setSelected({
            ...selected,
            adminNote: event.target.value
          })} /></label>{error && <p className="shop-order-error" role="alert">{tr(error)}</p>}<button className="shop-primary" type="submit" disabled={busy}>{tr("Lưu thay đổi")}</button></form></Modal>}
  </section>;
}
