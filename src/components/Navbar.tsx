import React, { useState } from 'react';
import { ShoppingBag, Heart, Sparkles, Search, Menu, X, Globe, Camera } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useLanguage } from '../context/LanguageContext';
import { Currency } from '../types';
import { Language } from '../i18n/translations';

interface NavbarProps {
  onOpenCurator: () => void;
  onOpenSubmitModal: () => void;
  onNavigateSection: (sectionId: string) => void;
  onOpenFavorites: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCurator,
  onOpenSubmitModal,
  onNavigateSection,
  onOpenFavorites,
  searchQuery,
  setSearchQuery,
}) => {
  const { totalItems, openCart, currency, setCurrency } = useCart();
  const { totalFavorites } = useWishlist();
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const currencies: Currency[] = ['VND', 'USD', 'EUR', 'GBP'];
  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0b0c0e]/95 backdrop-blur-md border-b border-[#252830]/70 transition-all">
      {/* Top Banner: Limited edition archival print promise */}
      <div className="bg-[#14171d] border-b border-[#222630] py-1.5 px-4 text-center text-xs tracking-widest uppercase text-[#dfb871] flex items-center justify-center gap-2 font-sans">
        <span className="w-1.5 h-1.5 rounded-full bg-[#dfb871] inline-block animate-pulse"></span>
        <span className="truncate">{t.topBanner}</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <button
          onClick={() => onNavigateSection('hero')}
          className="text-left group flex flex-col justify-center cursor-pointer focus:outline-none"
        >
          <span className="font-serif text-sm sm:text-base leading-snug text-[#8a919e]">
            Nhiếp ảnh Nghệ thuật
          </span>
          <span className="font-serif text-xl sm:text-2xl leading-snug font-light text-[#f5f0e6] group-hover:text-[#dfb871] transition-colors">
            Đặng Huy Trứ
          </span>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-7 text-sm tracking-wider uppercase font-sans">
          <button
            onClick={() => onNavigateSection('gallery')}
            className="text-[#c7cbd2] hover:text-[#f7eedc] transition-colors cursor-pointer"
          >
            {t.nav.gallery}
          </button>
          <button
            onClick={() => onNavigateSection('collections')}
            className="text-[#c7cbd2] hover:text-[#f7eedc] transition-colors cursor-pointer"
          >
            {t.nav.collections}
          </button>
          <button
            onClick={() => onNavigateSection('about')}
            className="text-[#c7cbd2] hover:text-[#f7eedc] transition-colors cursor-pointer"
          >
            {t.nav.heritage}
          </button>
          <button
            onClick={onOpenCurator}
            className="flex items-center gap-1.5 text-[#dfb871] hover:text-[#f7eedc] transition-colors cursor-pointer font-medium"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#dfb871]" />
            <span>{t.nav.curator}</span>
          </button>
          <button
            onClick={onOpenSubmitModal}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xs bg-[#1a1e28] hover:bg-[#252a38] text-[#f5f0e6] hover:text-[#dfb871] border border-[#333b4e] transition-colors cursor-pointer text-xs font-medium"
            title="Dành cho các nhiếp ảnh gia gửi ảnh triển lãm"
          >
            <Camera className="w-3.5 h-3.5 text-[#dfb871]" />
            <span>{t.nav.submit}</span>
          </button>
        </nav>

        {/* Right Action Icons: Language, Currency, Search, Wishlist, Cart */}
        <div className="flex items-center space-x-2.5 sm:space-x-4">
          {/* Quick Search Toggle */}
          <div className="relative">
            {isSearchOpen ? (
              <div className="flex items-center bg-[#171a22] border border-[#373c49] rounded-full px-3 py-1.5 transition-all w-48 sm:w-60">
                <Search className="w-3.5 h-3.5 text-[#8a919e] mr-2" />
                <input
                  type="text"
                  placeholder={t.nav.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-xs text-[#f5f0e6] placeholder-[#6b7280] focus:outline-none w-full"
                  autoFocus
                />
                <button
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="text-[#8a919e] hover:text-white ml-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-[#9ea4b0] hover:text-[#f5f0e6] transition-colors rounded-full hover:bg-[#1a1d25] cursor-pointer"
                title="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Language Switcher Dropdown (Default Vietnamese) */}
          <div className="flex items-center bg-[#161920] border border-[#2c313d] rounded-md px-2 py-1 text-xs">
            <Globe className="w-3.5 h-3.5 text-[#dfb871] mr-1.5 shrink-0" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="bg-transparent font-medium text-[#c7cbd2] hover:text-white focus:outline-none cursor-pointer"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code} className="bg-[#12141a] text-white">
                  {l.flag} {l.label}
                </option>
              ))}
            </select>
          </div>

          {/* Currency Switcher */}
          <div className="relative">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              className="bg-[#161920] border border-[#2c313d] text-xs font-mono text-[#c7cbd2] hover:text-white py-1 px-2 rounded-md focus:outline-none focus:border-[#dfb871] cursor-pointer transition-colors"
            >
              {currencies.map((c) => (
                <option key={c} value={c} className="bg-[#12141a] text-white">
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Favorites Button */}
          <button
            onClick={onOpenFavorites}
            className="relative p-2 text-[#9ea4b0] hover:text-[#e58a98] transition-colors rounded-full hover:bg-[#1a1d25] cursor-pointer"
            title={t.nav.saved}
          >
            <Heart className="w-4 h-4" />
            {totalFavorites > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#b34055] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {totalFavorites}
              </span>
            )}
          </button>

          {/* Cart Bag */}
          <button
            onClick={openCart}
            className="relative p-2.5 bg-[#171a22] hover:bg-[#202430] border border-[#2b303d] text-[#f5f0e6] hover:text-[#dfb871] transition-all rounded-full flex items-center cursor-pointer shadow-lg"
            title={t.nav.bag}
          >
            <ShoppingBag className="w-4 h-4" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#dfb871] text-[#0b0c0e] text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-md">
                {totalItems}
              </span>
            )}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#9ea4b0] hover:text-white focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#101217] border-b border-[#252830] px-6 py-6 space-y-4 text-sm font-sans tracking-wider uppercase">
          <button
            onClick={() => {
              onNavigateSection('gallery');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-[#c7cbd2] hover:text-[#dfb871]"
          >
            {t.nav.gallery}
          </button>
          <button
            onClick={() => {
              onNavigateSection('collections');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-[#c7cbd2] hover:text-[#dfb871]"
          >
            {t.nav.collections}
          </button>
          <button
            onClick={() => {
              onNavigateSection('about');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-[#c7cbd2] hover:text-[#dfb871]"
          >
            {t.nav.heritage}
          </button>
          <button
            onClick={() => {
              onOpenCurator();
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-2 py-2 text-[#dfb871]"
          >
            <Sparkles className="w-4 h-4" />
            <span>{t.nav.curator}</span>
          </button>
          <button
            onClick={() => {
              onOpenSubmitModal();
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-2 py-2 text-[#f5f0e6] hover:text-[#dfb871]"
          >
            <Camera className="w-4 h-4 text-[#dfb871]" />
            <span>{t.nav.submit}</span>
          </button>
        </div>
      )}
    </header>
  );
};
