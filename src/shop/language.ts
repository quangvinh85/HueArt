import { useLanguage } from '../context/LanguageContext';
import type { Language } from '../i18n/translations';
import translations from './translations.json';

export function translateText(source: string, language: Language, ...values: unknown[]): string {
  const key = source.trim();
  const entry = (translations as Record<string, string[]>)[key];
  const text = language === 'vi' || !entry ? key : entry[language === 'en' ? 0 : 1];
  const spaced = (source.startsWith(' ') ? ' ' : '') + text + (source.endsWith(' ') ? ' ' : '');
  return spaced.replace(/\{(\d+)\}/g, (_,index)=>String(values[Number(index)] ?? ''));
}
export function useShopLanguage() {
  const { language,setLanguage } = useLanguage();
  return {language,setLanguage,tr:(source:string,...values:unknown[])=>translateText(source,language,...values)};
}
