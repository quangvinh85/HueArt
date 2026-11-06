import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, TRANSLATIONS, Translations } from '../i18n/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default is Vietnamese ('vi') as requested
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('hueart_language') as Language;
      if (saved && (saved === 'vi' || saved === 'en' || saved === 'fr')) {
        return saved;
      }
    } catch {
      // Fallback
    }
    return 'vi';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('hueart_language', lang);
    } catch (e) {
      console.warn('Could not save language to localStorage', e);
    }
  };

  useEffect(() => {
    // Update html lang attribute
    document.documentElement.lang = language;
  }, [language]);

  const t = TRANSLATIONS[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
