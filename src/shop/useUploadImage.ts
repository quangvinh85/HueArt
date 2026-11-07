import {useRef,useState,useEffect} from 'react';
import {prepareImage,type PreparedImage} from './prepareImage';
import {MAX_UPLOAD_MB} from './platform';
export function useUploadImage(){
 const [file,setFile]=useState<File|null>(null),[prepared,setPrepared]=useState<PreparedImage|null>(null),[preparing,setPreparing]=useState(false),[imageError,setImageError]=useState(''),[dragging,setDragging]=useState(false);
 const inputRef=useRef<HTMLInputElement>(null),sequence=useRef(0);
 useEffect(()=>()=>{sequence.current++;},[]);
 const clear=()=>{sequence.current++;setFile(null);setPrepared(null);setPreparing(false);setImageError('');if(inputRef.current)inputRef.current.value='';};
 const choose=async(selected:File|undefined)=>{
  if(!selected)return;const current=++sequence.current;setImageError('');setPrepared(null);setFile(null);
  if(!['image/jpeg','image/png','image/webp'].includes(selected.type)||!selected.size||selected.size>MAX_UPLOAD_MB*1048576){setPreparing(false);setImageError('Chọn ảnh JPG, PNG hoặc WebP đúng định dạng và giới hạn dung lượng.');if(inputRef.current)inputRef.current.value='';return;}
  setPreparing(true);
  try{const result=await prepareImage(selected);if(sequence.current===current){setFile(selected);setPrepared(result);}}
  catch(error){if(sequence.current===current){setImageError(error instanceof Error?error.message:'Không tạo được ảnh xem trước.');if(inputRef.current)inputRef.current.value='';}}
  finally{if(sequence.current===current)setPreparing(false);}
 };
 const append=(data:FormData)=>{if(!file||!prepared)throw new Error('Vui lòng chọn ảnh và chờ tạo ảnh xem trước.');data.append('image',file);for(const [size,value] of Object.entries(prepared.files))data.append('preview'+size,value);};
 return {file,preview:prepared?.display||'',preparing,imageError,dragging,inputRef,clear,choose,append,
  dragProps:{onDragEnter:(event:React.DragEvent)=>{event.preventDefault();setDragging(true);},onDragOver:(event:React.DragEvent)=>{event.preventDefault();event.stopPropagation();event.dataTransfer.dropEffect='copy';setDragging(true);},onDragLeave:(event:React.DragEvent)=>{if(!event.currentTarget.contains(event.relatedTarget as Node|null))setDragging(false);},onDrop:(event:React.DragEvent)=>{event.preventDefault();event.stopPropagation();setDragging(false);void choose(event.dataTransfer.files[0]);}}};
}
