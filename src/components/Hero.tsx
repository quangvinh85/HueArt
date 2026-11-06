import React from 'react';
import { Eye, Sparkles, ArrowDown, Award, ShieldCheck, Feather } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface HeroProps {
  onExplore: () => void;
  onOpenCurator: () => void;
  onOpenRoomVisualizer: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onExplore,
  onOpenCurator,
  onOpenRoomVisualizer,
}) => {
  const { t } = useLanguage();

  return (
    <div id="hero" className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Background Hero Image with Genuine Hue Meridian Gate Photo */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/hue/ngo-mon-meridian.jpg"
          alt="Hoàng thành Huế — Cửa Ngọ Môn"
          className="w-full h-full object-cover object-center brightness-[0.38] filter scale-105 transform duration-1000 ease-out"
        />
        {/* Layered Vignettes for Gallery Mood */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c0e] via-[#0b0c0e]/50 to-[#0b0c0e]/80" />
        <div className="absolute inset-0 bg-radial from-transparent via-[#0b0c0e]/40 to-[#0b0c0e]" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-12 pb-16">
        {/* Poetic Top Tag */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#1b1f28]/85 border border-[#dfb871]/35 backdrop-blur-md mb-8 shadow-lg">
          <Feather className="w-3.5 h-3.5 text-[#dfb871]" />
          <span className="text-xs uppercase tracking-[0.25em] text-[#e8ded0] font-sans font-medium">
            {t.hero.tag}
          </span>
        </div>

        {/* Main Title with Editorial Typography */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-light text-[#f7eedc] tracking-tight leading-[1.1] mb-6">
          {t.hero.titlePart1} <br />
          <span className="italic font-normal gold-gradient-text">
            {t.hero.titleHighlight}
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-[#b8c0cc] font-light leading-relaxed mb-10">
          {t.hero.description}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 mb-14">
          <button
            onClick={onExplore}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#dfb871] hover:bg-[#c5a059] text-[#0b0c0e] font-sans text-xs tracking-[0.2em] uppercase font-bold transition-all shadow-xl hover:shadow-[#dfb871]/20 rounded-sm cursor-pointer flex items-center justify-center gap-2 group"
          >
            <span>{t.hero.exploreBtn}</span>
            <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
          </button>

          <button
            onClick={onOpenRoomVisualizer}
            className="w-full sm:w-auto px-7 py-3.5 bg-[#171b24]/90 hover:bg-[#202532] text-[#f5f0e6] border border-[#363d4e] font-sans text-xs tracking-[0.2em] uppercase transition-all rounded-sm cursor-pointer flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4 text-[#dfb871]" />
            <span>{t.hero.roomBtn}</span>
          </button>

          <button
            onClick={onOpenCurator}
            className="w-full sm:w-auto px-6 py-3.5 bg-transparent hover:bg-[#1b202c]/50 text-[#dfb871] border border-[#dfb871]/40 font-sans text-xs tracking-[0.2em] uppercase transition-all rounded-sm cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.hero.curatorBtn}</span>
          </button>
        </div>

        {/* Quality Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-[#252830]/70 max-w-4xl mx-auto text-left">
          <div className="flex items-start gap-3">
            <Award className="w-5 h-5 text-[#dfb871] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs uppercase tracking-wider text-[#f5f0e6] font-medium">{t.hero.badges.paper.title}</p>
              <p className="text-[11px] text-[#8e96a4]">{t.hero.badges.paper.subtitle}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#dfb871] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs uppercase tracking-wider text-[#f5f0e6] font-medium">{t.hero.badges.editions.title}</p>
              <p className="text-[11px] text-[#8e96a4]">{t.hero.badges.editions.subtitle}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Award className="w-5 h-5 text-[#dfb871] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs uppercase tracking-wider text-[#f5f0e6] font-medium">{t.hero.badges.auth.title}</p>
              <p className="text-[11px] text-[#8e96a4]">{t.hero.badges.auth.subtitle}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#dfb871] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs uppercase tracking-wider text-[#f5f0e6] font-medium">{t.hero.badges.transit.title}</p>
              <p className="text-[11px] text-[#8e96a4]">{t.hero.badges.transit.subtitle}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
