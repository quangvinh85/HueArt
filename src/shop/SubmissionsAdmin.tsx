import { useShopLanguage } from './language';
import { useEffect, useState } from 'react';
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
}
export default function SubmissionsAdmin() {
  const {
    language,
    tr
  } = useShopLanguage();
  const [items, setItems] = useState<Submission[]>([]),
    [selected, setSelected] = useState<Submission | null>(null),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  const load = async () => {
    setBusy(true);
    setError('');
    try {
      setItems((await requestApi<{
        submissions: Submission[];
      }>('/api/admin/submissions')).submissions);
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
    if (!selected) return;
    setBusy(true);
    setError('');
    try {
      const result = await requestApi<Submission>(`/api/admin/submissions/${selected.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: selected.status,
          adminNote: selected.adminNote,
          version: selected.version
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
                setSelected({
                  ...item
                });
              }}>{tr("Xem hồ sơ")}</button></td></tr>)}</tbody></table>{!items.length && <div className="shop-empty"><p>{busy ? tr("Đang tải…") : tr("Chưa có tác phẩm gửi đến.")}</p></div>}</div>
    {selected && <Modal title={selected.reference} wide onClose={() => {
      if (!busy) setSelected(null);
    }}><div className="shop-checkout"><div className="submission-preview"><ProtectedImage src={selected.imageUrl} alt={selected.title} view="detail" loading="eager" /></div><h3>{selected.title}</h3>{items.some(item=>item.id===selected.id&&item.status==='accepted')&&<a className="shop-secondary" href={`/#artwork-submission-${selected.id}`} target="_blank" rel="noopener noreferrer">{tr('Xem trên cửa hàng')}</a>}{selected.titleEn && <p>{selected.titleEn}</p>}{selected.titleFr && <p>{selected.titleFr}</p>}<p>{selected.authorName} · {selected.authorPhone} · {selected.authorEmail}</p><p>{selected.location}</p><p>{selected.story}</p><label>{tr("Trạng thái")}<select value={selected.status} disabled={busy} onChange={event => setSelected({
            ...selected,
            status: event.target.value as Submission['status']
          })}>{Object.entries(labels).map(([id, label]) => <option key={id} value={id}>{tr(label)}</option>)}</select></label><label>{tr("Ghi chú nội bộ")}<textarea rows={3} maxLength={2000} value={selected.adminNote} disabled={busy} onChange={event => setSelected({
            ...selected,
            adminNote: event.target.value
          })} /></label>{error && <p className="shop-order-error" role="alert">{tr(error)}</p>}<button className="shop-primary" disabled={busy} onClick={() => void save()}>{tr("Lưu thay đổi")}</button></div></Modal>}
  </section>;
}
