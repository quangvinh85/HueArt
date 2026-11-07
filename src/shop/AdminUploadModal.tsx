import {useEffect,useRef,useState} from 'react';
import {ImagePlus,Upload} from 'lucide-react';
import {useShopLanguage} from './language';
import {MAX_UPLOAD_MB} from './platform';
import {ProtectedImage} from './ProtectedImage';
import Modal from './Modal';
export default function AdminUploadModal({onClose,onUploaded}:{onClose:()=>void;onUploaded:()=>void}){
 const {tr}=useShopLanguage();
 const [file,setFile]=useState<File|null>(null),[preview,setPreview]=useState(''),[publish,setPublish]=useState(true),[rights,setRights]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const [fields,setFields]=useState({title:'',titleEn:'',titleFr:'',authorName:'Đặng Huy Trứ',location:'',story:'',collection:'imperial-echoes'});
 const formRef=useRef<HTMLFormElement>(null);
 const attempt=useRef<{file:File|null;signature:string;key:string}>({file:null,signature:'',key:''});
 useEffect(()=>{if(!file){setPreview('');return;}const url=URL.createObjectURL(file);setPreview(url);return()=>URL.revokeObjectURL(url);},[file]);
 const change=(name:keyof typeof fields,value:string)=>setFields(previous=>({...previous,[name]:value}));
 const choose=(selected:File|undefined)=>{
  if(!selected||busy)return;
  if(!['image/jpeg','image/png','image/webp'].includes(selected.type)||!selected.size||selected.size>MAX_UPLOAD_MB*1048576){setFile(null);setError(tr('Chọn ảnh JPG, PNG hoặc WebP, tối đa {0} MB.',MAX_UPLOAD_MB));return;}
  setFile(selected);setError('');if(!fields.title.trim())change('title',selected.name.replace(/\.[^.]+$/,''));
 };
 const save=async()=>{
  if(busy||!formRef.current?.reportValidity())return;
  if(!file){setError(tr('Vui lòng chọn ảnh tác phẩm.'));return;}
  if(!rights)return;
  const signature=JSON.stringify({...fields,publish,rights});
  if(attempt.current.file!==file||attempt.current.signature!==signature)attempt.current={file,signature,key:crypto.randomUUID()};
  setBusy(true);setError('');
  try{
   const data=new FormData();data.append('image',file);data.append('metadata',JSON.stringify({...fields,publish,rightsConfirmed:rights,submissionKey:attempt.current.key}));
   const response=await fetch('/api/admin/artworks',{method:'POST',credentials:'same-origin',body:data});
   if(!response.headers.get('Content-Type')?.includes('application/json'))throw new Error(tr('Không tải được ảnh lên. Vui lòng thử lại.'));
   const result=await response.json();if(!response.ok)throw new Error(tr(result.error||'Không tải được ảnh lên. Vui lòng thử lại.'));
   onUploaded();
  }catch(e){setError(e instanceof Error?e.message:tr('Không tải được ảnh lên. Vui lòng thử lại.'));}finally{setBusy(false);}
 };
 return <Modal title={tr('Thêm ảnh vào thư viện')} wide onClose={()=>{if(!busy)onClose();}}><form className="shop-checkout submission-form" ref={formRef} aria-busy={busy} onSubmit={e=>{e.preventDefault();void save();}}>
  <p>{tr('Ảnh do admin thêm được lưu trực tiếp vào thư viện. Chọn hiển thị để khách xem và mua ngay, hoặc lưu ẩn để chỉnh sửa sau.')}</p>
  <label className="submission-upload" onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();choose(e.dataTransfer.files[0]);}}><Upload size={25}/><strong>{tr('Chọn ảnh hoặc kéo thả vào đây')}</strong><span>{tr('JPG, PNG, WebP · Tối đa {0} MB',MAX_UPLOAD_MB)}</span><input aria-label={tr('Chọn ảnh tác phẩm')} type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={e=>choose(e.target.files?.[0])}/></label>
  {preview&&<div className="submission-preview"><ProtectedImage src={preview} alt={fields.title||tr('Ảnh tác phẩm')} view="detail" loading="eager"/><small>{file?.name}</small></div>}
  <div className="submission-fields"><label>{tr('Tên tác phẩm (Tiếng Việt) *')}<input required minLength={2} maxLength={160} value={fields.title} disabled={busy} onChange={e=>change('title',e.target.value)}/></label><label>{tr('Tên tiếng Anh (không bắt buộc)')}<input maxLength={160} value={fields.titleEn} disabled={busy} onChange={e=>change('titleEn',e.target.value)}/></label><label>{tr('Tên tiếng Pháp (không bắt buộc)')}<input maxLength={160} value={fields.titleFr} disabled={busy} onChange={e=>change('titleFr',e.target.value)}/></label><label>{tr('Tác giả')}<input required minLength={2} maxLength={100} value={fields.authorName} disabled={busy} onChange={e=>change('authorName',e.target.value)}/></label><label>{tr('Bộ sưu tập')}<select aria-label={tr('Bộ sưu tập')} value={fields.collection} disabled={busy} onChange={e=>change('collection',e.target.value)}>{[['imperial-echoes','Di sản Huế'],['perfume-river','Sông nước'],['living-traditions','Đời sống'],['poetic-monochrome','Ảnh đen trắng']].map(([value,label])=><option value={value} key={value}>{tr(label)}</option>)}</select></label><label>{tr('Địa điểm chụp')}<input maxLength={200} value={fields.location} disabled={busy} onChange={e=>change('location',e.target.value)}/></label></div>
  <label>{tr('Câu chuyện về tác phẩm')}<textarea rows={3} maxLength={2000} value={fields.story} disabled={busy} onChange={e=>change('story',e.target.value)}/></label>
  <label className="shop-consent"><input type="checkbox" checked={publish} disabled={busy} onChange={e=>setPublish(e.target.checked)}/><span>{tr('Hiển thị trên cửa hàng sau khi lưu')}</span></label>
  <label className="shop-consent"><input type="checkbox" required checked={rights} disabled={busy} onChange={e=>setRights(e.target.checked)}/><span>{tr('Tôi là tác giả hoặc được phép đăng bán ảnh này.')}</span></label>
  {error&&<p className="shop-order-error" role="alert">{tr(error)}</p>}{busy&&<p role="status">{tr('Đang tải ảnh lên…')}</p>}<button className="shop-primary" type="submit" disabled={busy}><ImagePlus size={18}/>{tr(busy?'Đang lưu…':'Lưu ảnh vào thư viện')}</button>
 </form></Modal>;
}
