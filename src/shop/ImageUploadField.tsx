import {Upload,X} from 'lucide-react';
import {useShopLanguage} from './language';
import {MAX_UPLOAD_MB} from './platform';
import {ProtectedImage} from './ProtectedImage';
import type {useUploadImage} from './useUploadImage';
export default function ImageUploadField({image,busy,title}:{image:ReturnType<typeof useUploadImage>;busy:boolean;title:string}){
 const {tr}=useShopLanguage();
 return <><label className={`submission-upload ${image.dragging?'is-dragging':''}`} {...image.dragProps} onDrop={event=>{if(busy){event.preventDefault();return;}image.dragProps.onDrop(event);}}><Upload size={25}/><strong>{tr('Chọn ảnh hoặc kéo thả vào đây')}</strong><span>{tr('JPG, PNG, WebP · Tối đa {0} MB',MAX_UPLOAD_MB)}</span><input ref={image.inputRef} aria-label={tr('Chọn ảnh tác phẩm')} type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={event=>void image.choose(event.target.files?.[0])}/></label>
 {image.preparing&&<p role="status">{tr('Đang tạo ảnh xem trước…')}</p>}
 {image.preview&&<div className="submission-preview"><ProtectedImage src={image.preview} alt={title||tr('Ảnh tác phẩm')} view="detail" loading="eager"/><button type="button" className="submission-remove-image" aria-label={tr('Xóa ảnh đã chọn')} title={tr('Xóa ảnh đã chọn')} disabled={busy} onClick={()=>image.clear()}><X size={20}/></button><small>{image.file?.name}</small></div>}
 {image.imageError&&<p className="shop-order-error" role="alert">{tr(image.imageError)}</p>}</>;
}
