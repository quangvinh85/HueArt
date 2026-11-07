import { useShopLanguage } from './language';
import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
export default function Modal({
  title,
  onClose,
  children,
  wide = false
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  const {
    language,
    tr
  } = useShopLanguage();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    ref.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const elements = Array.from(ref.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), textarea, select') || []).filter(el => el.getClientRects().length > 0);
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === ref.current)) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === ref.current)) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
      previousFocus?.focus();
    };
  }, []);
  return <div className="shop-overlay">
    <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="shop-dialog-title" className={`shop-dialog ${wide ? 'shop-dialog-wide' : ''}`}>
      <div className="shop-dialog-header"><h2 id="shop-dialog-title">{title}</h2><button className="shop-icon" onClick={onClose} aria-label={tr("Đóng")}><X size={21} /></button></div>
      {children}
    </div>
  </div>;
}
