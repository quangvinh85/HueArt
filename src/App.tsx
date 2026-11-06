import { lazy, Suspense } from 'react';
import { useShopLanguage } from './shop/language';
import Shop from './shop/Shop';
import { LanguageProvider } from './context/LanguageContext';
const Admin = lazy(() => import('./shop/Admin'));

function Routes() {
  const {tr}=useShopLanguage();
  return window.location.pathname.replace(/\/$/, '') === '/admin'
    ? <Suspense fallback={<div style={{ padding: 40 }}>{tr("Đang tải trang quản lý…")}</div>}><Admin /></Suspense>
    : <Shop />;
}

export default function App() { return <LanguageProvider><Routes/></LanguageProvider>; }
