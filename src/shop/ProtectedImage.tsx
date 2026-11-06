import { useEffect, type ImgHTMLAttributes, type SyntheticEvent } from 'react';

const stopImageAction = (event: SyntheticEvent) => event.preventDefault();

// These controls deter ordinary image saving; they are not access control.
export function useImageProtection(onBlocked: () => void) {
  useEffect(() => {
    const isImageTarget = (target: EventTarget | null) => target instanceof Element && Boolean(target.closest('[data-protected-image]'));
    const preventImageAction = (event: Event) => {
      if (isImageTarget(event.target)) {
        event.preventDefault();
        if (event.type === 'contextmenu') onBlocked();
      }
    };
    const preventImageCopy = (event: ClipboardEvent) => {
      // Never interfere with copying contact or order text, even if a previous
      // page selection included a photo.
      const editable = (target: EventTarget | null) => target instanceof Element && Boolean(target.closest('input, textarea, [contenteditable="true"]'));
      if (editable(event.target) || editable(document.activeElement)) return;
      const selection = window.getSelection();
      const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
      const containsImage = range && Array.from(document.querySelectorAll('[data-protected-image]')).some(element => range.intersectsNode(element));
      if (isImageTarget(event.target) || isImageTarget(document.activeElement) || containsImage) {
        event.preventDefault();
        onBlocked();
      }
    };
    const preventSave = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        onBlocked();
      }
    };
    document.addEventListener('contextmenu', preventImageAction);
    document.addEventListener('dragstart', preventImageAction);
    document.addEventListener('copy', preventImageCopy);
    document.addEventListener('cut', preventImageCopy);
    document.addEventListener('keydown', preventSave);
    return () => {
      document.removeEventListener('contextmenu', preventImageAction);
      document.removeEventListener('dragstart', preventImageAction);
      document.removeEventListener('copy', preventImageCopy);
      document.removeEventListener('cut', preventImageCopy);
      document.removeEventListener('keydown', preventSave);
    };
  }, [onBlocked]);
}

type ProtectedImageProps = Pick<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt' | 'loading' | 'fetchPriority'> & { className?: string };

export function ProtectedImage({ className = '', ...props }: ProtectedImageProps) {
  return <span className={`shop-protected-image ${className}`} data-protected-image onContextMenu={stopImageAction} onDragStart={stopImageAction}>
    <img {...props} draggable={false} onContextMenu={stopImageAction} onDragStart={stopImageAction} />
    <span className="shop-image-watermarks" aria-hidden="true">{Array.from({ length: 9 }, (_, index) => <span key={index}>© ĐẶNG HUY TRỨ</span>)}</span>
  </span>;
}
