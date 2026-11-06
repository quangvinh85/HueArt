import React, { useState } from 'react';
import { Shield, Check, Mail, Phone, MapPin, Camera, Building2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface FooterProps {
  onOpenSubmitModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenSubmitModal }) => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => {
        setEmail('');
      }, 3000);
    }
  };

  return (
    <footer className="bg-[#08090c] border-t border-[#1d212a] text-[#8e96a4] font-sans text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#1d212a]">
          {/* Brand & Atelier Statement (5 Cols) */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-serif text-2xl tracking-[0.2em] font-light text-[#f5f0e6]">
                HUE ART
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1e222c] text-[#dfb871] font-mono border border-[#dfb871]/30">
                PRINTS
              </span>
            </div>
            <p className="text-xs text-[#7d8695] leading-relaxed max-w-sm">
              {t.footer.brandText}
            </p>

            {/* Verified Organization & Contact Box */}
            <div className="p-3.5 bg-[#0f1117] border border-[#232836] rounded-xs space-y-2 text-xs font-mono text-[#a2abb9]">
              <div className="text-[#dfb871] font-serif text-sm font-semibold tracking-wide leading-snug">
                {t.footer.atelierLocation}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#dfb871] shrink-0" />
                <span>273 Điện Biên Phủ, Thành Phố Huế</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#dfb871] shrink-0" />
                <span>Hotline: <strong className="text-[#f5f0e6]">+(84)778480911</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#dfb871] shrink-0" />
                <span>Email: <strong className="text-[#f5f0e6]">vinhhuong119@gmail.com</strong></span>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-[#1d222e] text-[11px]">
                <Building2 className="w-3.5 h-3.5 text-[#dfb871] shrink-0" />
                <span>Tài khoản: <strong className="text-[#f5f0e6]">Vietcombank - Vinh Huong - 0161000042240</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Curatorial Links (3 Cols) */}
          <div className="md:col-span-3 space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-[#f5f0e6] block">
              {t.footer.portfoliosTitle}
            </span>
            <ul className="space-y-2 text-xs text-[#9ea6b5]">
              <li><a href="#gallery" className="hover:text-[#dfb871] transition-colors">{t.filter.imperialEchoes}</a></li>
              <li><a href="#gallery" className="hover:text-[#dfb871] transition-colors">{t.filter.perfumeRiver}</a></li>
              <li><a href="#gallery" className="hover:text-[#dfb871] transition-colors">{t.filter.livingTraditions}</a></li>
              <li><a href="#gallery" className="hover:text-[#dfb871] transition-colors">{t.filter.poeticMonochrome}</a></li>
              <li><a href="#about" className="hover:text-[#dfb871] transition-colors">{t.about.museumSpecsTag}</a></li>
              {onOpenSubmitModal && (
                <li className="pt-2">
                  <button
                    onClick={onOpenSubmitModal}
                    className="flex items-center gap-1.5 text-[#dfb871] hover:underline cursor-pointer font-mono text-xs"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{t.submitModal.menuLabel}</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Collector Journal Signup (4 Cols) */}
          <div className="md:col-span-4 space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-[#f5f0e6] block">
              {t.footer.gazetteTitle}
            </span>
            <p className="text-xs text-[#7d8695] leading-relaxed">
              {t.footer.gazetteDesc}
            </p>

            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="flex">
                <input
                  type="email"
                  required
                  placeholder={t.footer.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#141720] border border-[#262b38] rounded-l-xs px-3 py-2 text-xs text-[#f5f0e6] placeholder-[#575e6d] focus:outline-none focus:border-[#dfb871] w-full"
                />
                <button
                  type="submit"
                  className="bg-[#dfb871] hover:bg-[#c5a059] text-[#0b0c0e] font-mono text-xs uppercase px-4 py-2 font-bold rounded-r-xs cursor-pointer transition-colors shrink-0"
                >
                  {t.footer.joinBtn}
                </button>
              </div>

              {subscribed && (
                <div className="text-[11px] text-[#9de0ad] flex items-center gap-1.5 pt-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>{t.footer.joinSuccess}</span>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Bottom Guarantee & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#6b7382]">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#dfb871]" />
            <span>{t.footer.guaranteeText}</span>
          </div>

          <div>
            © {new Date().getFullYear()} {t.footer.rights}
          </div>
        </div>
      </div>
    </footer>
  );
};
