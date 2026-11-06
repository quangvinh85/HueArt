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
  const [rightsConfirmed, setRightsConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [reference, setReference] = useState('');
  const [submissionKey, setSubmissionKey] = useState(() => crypto.randomUUID());
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    setSubmissionKey(crypto.randomUUID());
  }, [file, fields, rightsConfirmed]);
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
    setBusy(true);
    setError('');
    try {
      const data = new FormData();
      data.append('image', file);
      data.append('metadata', JSON.stringify({
        ...fields,
        submissionKey,
        rightsConfirmed
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
  }} wide>
    {reference ? <div className="shop-checkout"><div className="shop-draft-status"><Check size={28} /><div><h3>{tr("Đã tiếp nhận tác phẩm")}</h3><p>{tr("Ảnh và hồ sơ đã được lưu để quản trị viên xem xét. Tác phẩm chưa được công khai trên website.")}</p></div></div><div className="shop-order-recipient"><span>{tr("Mã hồ sơ")}</span><strong>{reference}</strong></div><button className="shop-primary" onClick={onClose}>{tr("Đóng")}</button></div> : <form className="shop-checkout submission-form" ref={formRef} onSubmit={event => {
      event.preventDefault();
      void submit();
    }}>
      <p>{tr("Chia sẻ góc nhìn của bạn về Huế. Ảnh được gửi riêng cho quản trị viên, chỉ công bố sau khi hai bên thống nhất.")}</p>
      <label className="submission-upload" onDragOver={event => event.preventDefault()} onDrop={event => {
        event.preventDefault();
        if (!busy) selectFile(event.dataTransfer.files[0]);
      }}><Upload size={25} /><strong>{tr("Chọn ảnh hoặc kéo thả vào đây")}</strong><span>{tr("JPG, PNG, WebP · Tối đa {0} MB",MAX_UPLOAD_MB)}</span><input aria-label={tr("Chọn ảnh tác phẩm")} type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={event => selectFile(event.target.files?.[0])} /></label>
      {preview && <div className="submission-preview"><ProtectedImage src={preview} alt={fields.title || tr("Ảnh tác phẩm")} /><small>{file?.name}</small></div>}
      <div className="submission-fields"><label>{tr("Tên tác phẩm (Tiếng Việt) *")}<input required minLength={2} maxLength={160} value={fields.title} disabled={busy} onChange={event => change('title', event.target.value)} /></label><label>{tr("Tên tiếng Anh (không bắt buộc)")}<input maxLength={160} value={fields.titleEn} disabled={busy} onChange={event => change('titleEn', event.target.value)} /></label><label>{tr("Tên tiếng Pháp (không bắt buộc)")}<input maxLength={160} value={fields.titleFr} disabled={busy} onChange={event => change('titleFr', event.target.value)} /></label><label>{tr("Thuộc bộ sưu tập")}<select value={fields.collection} disabled={busy} onChange={event => change('collection', event.target.value)}><option value="imperial-echoes">{tr("Di sản Huế")}</option><option value="perfume-river">{tr("Sông nước")}</option><option value="living-traditions">{tr("Đời sống")}</option><option value="poetic-monochrome">{tr("Ảnh đen trắng")}</option></select></label><label>{tr("Họ tên tác giả *")}<input required autoComplete="name" minLength={2} maxLength={100} value={fields.authorName} disabled={busy} onChange={event => change('authorName', event.target.value)} /></label><label>{tr("Số điện thoại liên hệ *")}<input required autoComplete="tel" type="tel" minLength={7} maxLength={30} value={fields.authorPhone} disabled={busy} onChange={event => change('authorPhone', event.target.value)} /></label><label>{tr("Email (không bắt buộc)")}<input autoComplete="email" type="email" maxLength={150} value={fields.authorEmail} disabled={busy} onChange={event => change('authorEmail', event.target.value)} /></label><label>{tr("Địa điểm chụp")}<input maxLength={200} value={fields.location} disabled={busy} onChange={event => change('location', event.target.value)} /></label></div>
      <label>{tr("Câu chuyện về tác phẩm")}<textarea maxLength={2000} rows={3} value={fields.story} disabled={busy} onChange={event => change('story', event.target.value)} /></label><label className="shop-consent"><input type="checkbox" required checked={rightsConfirmed} disabled={busy} onChange={event => setRightsConfirmed(event.target.checked)} /><span>{tr("Tôi là tác giả hoặc có quyền gửi ảnh này để quản trị viên xem xét. Việc gửi ảnh không tự chuyển quyền tác giả.")}</span></label>
      {error && <p className="shop-order-error" role="alert">{tr(error)}</p>}<button className="shop-primary" type="button" disabled={busy} onClick={() => void submit()}><Camera size={17} />{busy ? tr("Đang gửi tác phẩm…") : tr("Gửi tác phẩm")}</button>
    </form>}
  </Modal>;
}
