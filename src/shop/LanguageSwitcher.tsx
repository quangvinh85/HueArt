import { Globe } from 'lucide-react';
import { useShopLanguage } from './language';
import type { Language } from '../i18n/translations';
export default function LanguageSwitcher(){
  const {language,setLanguage}=useShopLanguage();
  return <label className="shop-language"><Globe size={16}/><select aria-label="Language / Ngôn ngữ / Langue" value={language} onChange={event=>setLanguage(event.target.value as Language)}><option value="vi">Tiếng Việt</option><option value="en">English</option><option value="fr">Français</option></select></label>;
}
