import {lazy,Suspense,useCallback,useEffect,useRef,useState} from 'react';
import {Eye,EyeOff,ImageIcon,ImagePlus,RefreshCw,Search,Trash2,Undo2} from 'lucide-react';
import type {Artwork} from '../types';
import {useShopLanguage} from './language';
import {requestApi} from './ordersApi';
import {ProtectedImage} from './ProtectedImage';
import Modal from './Modal';

const AdminUploadModal=lazy(()=>import('./AdminUploadModal'));

type Entry={artwork:Artwork;source:string;hidden:boolean;deleted:boolean;version:number};
type Result={items:Entry[];total:number;page:number;pageSize:number;stats:{total:number;visible:number;hidden:number;trash:number}};
const collections=[['imperial-echoes','Di sản Huế'],['perfume-river','Sông nước'],['living-traditions','Đời sống'],['poetic-monochrome','Ảnh đen trắng']];
const notifyCatalogue=()=>{try{localStorage.setItem('hueart_catalog_updated',String(Date.now()));}catch{}};
function previewSource(item:Entry){return item.source==='submission'&&(item.hidden||item.deleted)?`/api/admin/submissions/${item.artwork.id.slice(11)}/image`:item.artwork.imageUrl;}

export default function CatalogueAdmin(){
 const {language,tr}=useShopLanguage();
 const [result,setResult]=useState<Result|null>(null),[query,setQuery]=useState(''),[search,setSearch]=useState(''),[state,setState]=useState('all'),[page,setPage]=useState(1);
 const [loading,setLoading]=useState(false),[saving,setSaving]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const [selected,setSelected]=useState<Entry|null>(null),[editLanguage,setEditLanguage]=useState<'vi'|'en'|'fr'>('vi'),[confirmTrash,setConfirmTrash]=useState(false);
 const [uploadOpen,setUploadOpen]=useState(false);
 const sequence=useRef(0);
 const load=useCallback(async()=>{
  const version=++sequence.current;setLoading(true);setError('');
  try{const data=await requestApi<Result>('/api/admin/catalog?'+new URLSearchParams({q:search,state,page:String(page)}));if(version===sequence.current){if(page>1&&!data.items.length){setPage(page-1);}else setResult(data);}}
  catch(e){if(version===sequence.current)setError(e instanceof Error?e.message:tr('Không tải được danh sách ảnh.'));}
  finally{if(version===sequence.current)setLoading(false);}
 },[search,state,page]);
 useEffect(()=>{void load();return()=>{sequence.current++;};},[load]);
 const mutate=async(item:Entry,action:'save'|'trash'|'restore')=>{
  if(saving)return;setSaving(true);setError('');
  try{
   await requestApi(`/api/admin/catalog/${item.artwork.id}`,{method:'PATCH',body:JSON.stringify({version:item.version,action,hidden:item.hidden,titles:item.artwork.titles,locations:item.artwork.locations,stories:item.artwork.stories,photographer:item.artwork.photographer||'',collection:item.artwork.collection})});
   notifyCatalogue();setSelected(null);setConfirmTrash(false);setNotice(tr(action==='trash'?'Đã chuyển ảnh vào thùng rác.':action==='restore'?'Đã khôi phục ảnh.':'Đã lưu thông tin ảnh.'));await load();
  }catch(e){setError(e instanceof Error?e.message:tr('Không lưu được tác phẩm.'));}finally{setSaving(false);}
 };
 const changeText=(field:'titles'|'locations'|'stories',value:string)=>setSelected(item=>item?{...item,artwork:{...item.artwork,[field]:{...item.artwork[field],[editLanguage]:value}}}:null);
 return <section>
  <div className="admin-heading"><div><h1>{tr('Thư viện ảnh')}</h1><p>{tr('Quản lý ảnh có sẵn và tác phẩm đã duyệt đang bán trên cửa hàng.')}</p></div><div className="admin-heading-actions"><button type="button" className="shop-primary" disabled={saving} onClick={()=>setUploadOpen(true)}><ImagePlus size={17}/>{tr('Thêm ảnh')}</button><button className="shop-secondary" disabled={loading||saving} onClick={()=>void load()}><RefreshCw size={15}/>{tr('Làm mới')}</button></div></div>
  <div className="admin-stats"><article><span>{tr('Tổng số ảnh')}</span><strong>{result?.stats.total??'—'}</strong><ImageIcon size={22}/></article><article><span>{tr('Đang hiển thị')}</span><strong>{result?.stats.visible??'—'}</strong><Eye size={22}/></article><article><span>{tr('Đã ẩn')}</span><strong>{result?.stats.hidden??'—'}</strong><EyeOff size={22}/></article><article><span>{tr('Thùng rác')}</span><strong>{result?.stats.trash??'—'}</strong><Trash2 size={22}/></article></div>
  <div className="admin-toolbar"><form onSubmit={e=>{e.preventDefault();setSearch(query.trim());setPage(1);}}><label className="shop-search"><Search size={17}/><input aria-label={tr('Tìm ảnh')} placeholder={tr('Tên ảnh hoặc tác giả…')} value={query} onChange={e=>setQuery(e.target.value)}/></label><button type="submit" className="shop-secondary">{tr('Tìm')}</button></form><label>{tr('Trạng thái')}<select aria-label={tr('Trạng thái')} value={state} disabled={saving} onChange={e=>{setState(e.target.value);setPage(1);}}>{[['all','Tất cả ảnh'],['visible','Đang hiển thị'],['hidden','Đã ẩn'],['trash','Thùng rác']].map(([value,label])=><option key={value} value={value}>{tr(label)}</option>)}</select></label></div>
  {notice&&<p className="admin-success" role="status">{notice}</p>}{error&&!selected&&<p className="shop-order-error" role="alert">{tr(error)}</p>}
  <div className="admin-photo-grid" aria-busy={loading}>{result?.items.map(item=><article className="admin-photo-card" key={item.artwork.id}>
   <button type="button" className="admin-photo-open" disabled={saving} onClick={()=>{setError('');setEditLanguage('vi');setConfirmTrash(false);setSelected(structuredClone(item));}}>
    {item.source==='submission'&&(item.hidden||item.deleted)?<span className="admin-photo-placeholder"><EyeOff size={24}/></span>:<ProtectedImage src={item.artwork.imageUrl} alt={item.artwork.titles[language]} view="thumb"/>}
    <span><strong>{item.artwork.titles[language]}</strong><small>{item.artwork.photographer||tr('Đặng Huy Trứ')}</small><small>{tr(item.source==='original'?'Ảnh có sẵn':'Tác phẩm đã duyệt')}</small></span>
   </button><div className="admin-photo-actions"><span className="admin-badge">{tr(item.deleted?'Thùng rác':item.hidden?'Đã ẩn':'Đang hiển thị')}</span>{item.deleted?<button type="button" className="shop-secondary" disabled={saving} onClick={()=>void mutate(item,'restore')}><Undo2 size={14}/>{tr('Khôi phục')}</button>:<button type="button" className="shop-secondary" disabled={saving} onClick={()=>{setError('');setEditLanguage('vi');setConfirmTrash(false);setSelected(structuredClone(item));}}>{tr('Chỉnh sửa')}</button>}</div>
  </article>)}</div>
  {!result?.items.length&&<div className="shop-empty"><ImageIcon size={30}/><p>{loading?tr('Đang tải…'):tr('Không có ảnh phù hợp.')}</p></div>}
  <div className="admin-pagination"><span>{tr('{0} ảnh · Trang {1}',result?.total??0,page)}</span><div><button className="shop-secondary" disabled={loading||saving||page<=1} onClick={()=>setPage(p=>p-1)}>{tr('Trước')}</button><button className="shop-secondary" disabled={loading||saving||!result||page*result.pageSize>=result.total} onClick={()=>setPage(p=>p+1)}>{tr('Sau')}</button></div></div>
  <Suspense fallback={<p role="status">{tr('Đang tải…')}</p>}>{uploadOpen&&<AdminUploadModal onClose={()=>setUploadOpen(false)} onUploaded={()=>{setUploadOpen(false);notifyCatalogue();setNotice(tr('Đã thêm ảnh vào thư viện.'));setQuery('');setSearch('');setState('all');setPage(1);if(search===''&&state==='all'&&page===1)void load();}}/>}</Suspense>
  {selected&&<Modal title={tr('Thông tin tác phẩm')} wide onClose={()=>{if(!saving)setSelected(null);}}><form className="admin-detail admin-catalog-editor" onSubmit={e=>{e.preventDefault();void mutate(selected,'save');}}>
   <section><div className="admin-catalog-preview"><ProtectedImage src={previewSource(selected)} alt={selected.artwork.titles[language]} view="detail" loading="eager"/></div><p className="admin-note">{selected.artwork.id}</p>{selected.deleted?<p>{tr('Ảnh đang ở trong thùng rác. Khôi phục để chỉnh sửa.')}</p>:<label className="admin-visible-toggle"><input type="checkbox" checked={!selected.hidden} disabled={saving} onChange={e=>setSelected({...selected,hidden:!e.target.checked})}/>{tr('Hiển thị trên cửa hàng')}</label>}<p className="admin-note">{tr('Ẩn hoặc xóa sẽ ngừng hiển thị và ngừng nhận đơn mới cho ảnh này. Đơn đã đặt vẫn được giữ.')}</p>
    {!selected.deleted&&(!confirmTrash?<button className="shop-secondary admin-danger" type="button" disabled={saving} onClick={()=>setConfirmTrash(true)}><Trash2 size={15}/>{tr('Đưa vào thùng rác')}</button>:<div className="admin-trash-confirm"><p>{tr('Xóa ảnh khỏi cửa hàng? Bạn có thể khôi phục từ thùng rác.')}</p><button className="shop-secondary admin-danger" type="button" disabled={saving} onClick={()=>void mutate(selected,'trash')}>{tr('Xác nhận xóa')}</button><button className="shop-secondary" type="button" disabled={saving} onClick={()=>setConfirmTrash(false)}>{tr('Hủy')}</button></div>)}
   </section><div className="admin-editor"><div className="shop-filters" aria-label={tr('Ngôn ngữ nội dung')}>{[['vi','Tiếng Việt'],['en','English'],['fr','Français']].map(([value,label])=><button type="button" key={value} className={editLanguage===value?'active':''} onClick={()=>setEditLanguage(value as typeof editLanguage)}>{label}</button>)}</div>
    <label>{tr('Tên tác phẩm')}<input required={editLanguage==='vi'} minLength={editLanguage==='vi'?2:undefined} maxLength={160} value={selected.artwork.titles[editLanguage]} disabled={saving||selected.deleted} onChange={e=>changeText('titles',e.target.value)}/></label>
    <label>{tr('Địa điểm')}<input maxLength={200} value={selected.artwork.locations[editLanguage]} disabled={saving||selected.deleted} onChange={e=>changeText('locations',e.target.value)}/></label>
    <label>{tr('Câu chuyện')}<textarea rows={5} maxLength={2000} value={selected.artwork.stories[editLanguage]} disabled={saving||selected.deleted} onChange={e=>changeText('stories',e.target.value)}/></label>
    <label>{tr('Tác giả')}<input maxLength={100} value={selected.artwork.photographer||''} placeholder="Đặng Huy Trứ" disabled={saving||selected.deleted} onChange={e=>setSelected({...selected,artwork:{...selected.artwork,photographer:e.target.value}})}/></label>
    <label>{tr('Bộ sưu tập')}<select aria-label={tr('Bộ sưu tập')} value={selected.artwork.collection} disabled={saving||selected.deleted} onChange={e=>setSelected({...selected,artwork:{...selected.artwork,collection:e.target.value as Artwork['collection']}})}>{collections.map(([value,label])=><option key={value} value={value}>{tr(label)}</option>)}</select></label>
    {error&&<p className="shop-order-error" role="alert">{tr(error)}</p>}{selected.deleted?<button type="button" className="shop-primary" disabled={saving} onClick={()=>void mutate(selected,'restore')}>{tr('Khôi phục')}</button>:<button className="shop-primary" type="submit" disabled={saving}>{saving?tr('Đang lưu…'):tr('Lưu thay đổi')}</button>}
   </div>
  </form></Modal>}
 </section>;
}
