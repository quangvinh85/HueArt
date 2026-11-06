import React from 'react';
import { Collection } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { Feather, Sparkles, CheckCircle2 } from 'lucide-react';

interface AboutSectionProps {
  onSelectCollection: (col: Collection) => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onSelectCollection }) => {
  const { t } = useLanguage();

  return (
    <section id="about" className="py-24 bg-[#0d0f14] border-t border-[#232734] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Curatorial Narrative Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#dfb871] font-mono">
              <Feather className="w-3.5 h-3.5" />
              <span>{t.about.tag}</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-serif text-[#f5f0e6] font-light leading-tight">
              {t.about.titlePart1} <br />
              <span className="italic gold-gradient-text">{t.about.titleHighlight}</span>
            </h2>

            <p className="text-sm sm:text-base text-[#adb6c4] leading-relaxed font-light">
              {t.about.p1}
            </p>

            <p className="text-sm sm:text-base text-[#adb6c4] leading-relaxed font-light">
              {t.about.p2}
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#222634]">
              <div>
                <h4 className="font-serif text-2xl text-[#dfb871]">{t.about.stat1Number}</h4>
                <p className="text-xs text-[#788191] font-sans">
                  {t.about.stat1Desc}
                </p>
              </div>
              <div>
                <h4 className="font-serif text-2xl text-[#dfb871]">{t.about.stat2Number}</h4>
                <p className="text-xs text-[#788191] font-sans">
                  {t.about.stat2Desc}
                </p>
              </div>
            </div>
          </div>

          {/* Right Visual Collage with Genuine Hue Khai Dinh & Thai Hoa Photo */}
          <div className="lg:col-span-6 relative">
            <div className="relative p-4 bg-[#141822] border border-[#262c3b] rounded-sm shadow-2xl">
              <img
                src="/images/hue/khai-dinh-interior.jpg"
                alt="Khảm sành sứ Cung điện Khải Định Huế"
                className="w-full h-80 sm:h-96 object-cover rounded-xs filter contrast-105"
              />
              <div className="absolute -bottom-6 -left-6 bg-[#1a1e2a] border border-[#3b4356] p-4 rounded-xs shadow-2xl max-w-xs hidden sm:block">
                <div className="flex items-center gap-2 text-xs font-mono text-[#dfb871] mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t.about.calloutBadge}</span>
                </div>
                <p className="text-[11px] text-[#9fa7b6] leading-normal font-sans">
                  {t.about.calloutDesc}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Collections Gallery Grid Preview */}
        <div id="collections" className="pt-12 border-t border-[#222634]">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase font-mono tracking-widest text-[#dfb871] block mb-2">
              {t.about.themesTag}
            </span>
            <h3 className="text-3xl font-serif text-[#f5f0e6]">
              {t.about.themesTitle}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Theme 1: Imperial Echoes */}
            <div
              onClick={() => onSelectCollection('imperial-echoes')}
              className="group relative h-96 rounded-xs overflow-hidden border border-[#272c3a] hover:border-[#dfb871] transition-all cursor-pointer shadow-xl"
            >
              <img
                src="/images/hue/tu-duc-pavilion.jpg"
                alt="Xung Khiêm Tạ Lăng Tự Đức Huế"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-75 group-hover:brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c0e] via-[#0b0c0e]/40 to-transparent" />
              <div className="absolute bottom-0 inset-x-0 p-6">
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#dfb871] block mb-1">
                  {t.about.pI_tag}
                </span>
                <h4 className="text-2xl font-serif text-[#f5f0e6] mb-1">{t.about.pI_title}</h4>
                <p className="text-xs text-[#a2abb9] line-clamp-2 mb-3">
                  {t.about.pI_desc}
                </p>
                <span className="text-xs font-mono uppercase text-[#dfb871] tracking-wider flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  {t.about.explorePortfolio}
                </span>
              </div>
            </div>

            {/* Theme 2: Perfume River */}
            <div
              onClick={() => onSelectCollection('perfume-river')}
              className="group relative h-96 rounded-xs overflow-hidden border border-[#272c3a] hover:border-[#dfb871] transition-all cursor-pointer shadow-xl"
            >
              <img
                src="/images/hue/perfume-river-hue.jpg"
                alt="Thuyền rồng sông Hương Huế"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-75 group-hover:brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c0e] via-[#0b0c0e]/40 to-transparent" />
              <div className="absolute bottom-0 inset-x-0 p-6">
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#dfb871] block mb-1">
                  {t.about.pII_tag}
                </span>
                <h4 className="text-2xl font-serif text-[#f5f0e6] mb-1">{t.about.pII_title}</h4>
                <p className="text-xs text-[#a2abb9] line-clamp-2 mb-3">
                  {t.about.pII_desc}
                </p>
                <span className="text-xs font-mono uppercase text-[#dfb871] tracking-wider flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  {t.about.explorePortfolio}
                </span>
              </div>
            </div>

            {/* Theme 3: Living Traditions */}
            <div
              onClick={() => onSelectCollection('living-traditions')}
              className="group relative h-96 rounded-xs overflow-hidden border border-[#272c3a] hover:border-[#dfb871] transition-all cursor-pointer shadow-xl"
            >
              <img
                src="/images/hue/thuy-xuan-incense.jpg"
                alt="Làng hương Thủy Xuân Huế"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-75 group-hover:brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c0e] via-[#0b0c0e]/40 to-transparent" />
              <div className="absolute bottom-0 inset-x-0 p-6">
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#dfb871] block mb-1">
                  {t.about.pIII_tag}
                </span>
                <h4 className="text-2xl font-serif text-[#f5f0e6] mb-1">{t.about.pIII_title}</h4>
                <p className="text-xs text-[#a2abb9] line-clamp-2 mb-3">
                  {t.about.pIII_desc}
                </p>
                <span className="text-xs font-mono uppercase text-[#dfb871] tracking-wider flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  {t.about.explorePortfolio}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Framing & Materials Standards Breakdown */}
        <div className="mt-20 p-8 sm:p-12 bg-[#12151d] border border-[#242937] rounded-sm">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <span className="text-xs uppercase font-mono tracking-widest text-[#dfb871] block mb-1">
              {t.about.museumSpecsTag}
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif text-[#f5f0e6]">
              {t.about.museumSpecsTitle}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs text-[#9aa2af]">
            <div className="space-y-2">
              <div className="font-semibold text-sm text-[#f5f0e6] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#dfb871]" />
                <span>{t.about.spec1Title}</span>
              </div>
              <p className="leading-relaxed">
                {t.about.spec1Desc}
              </p>
            </div>

            <div className="space-y-2">
              <div className="font-semibold text-sm text-[#f5f0e6] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#dfb871]" />
                <span>{t.about.spec2Title}</span>
              </div>
              <p className="leading-relaxed">
                {t.about.spec2Desc}
              </p>
            </div>

            <div className="space-y-2">
              <div className="font-semibold text-sm text-[#f5f0e6] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#dfb871]" />
                <span>{t.about.spec3Title}</span>
              </div>
              <p className="leading-relaxed">
                {t.about.spec3Desc}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
