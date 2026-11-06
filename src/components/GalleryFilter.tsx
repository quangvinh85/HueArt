import React from 'react';
import { Collection, Orientation } from '../types';
import { SlidersHorizontal, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface GalleryFilterProps {
  activeCollection: Collection;
  onSelectCollection: (c: Collection) => void;
  activeOrientation: Orientation | 'all';
  onSelectOrientation: (o: Orientation | 'all') => void;
  activeMood: string;
  onSelectMood: (m: string) => void;
  sortBy: string;
  onSelectSort: (s: string) => void;
  totalFiltered: number;
}

export const GalleryFilter: React.FC<GalleryFilterProps> = ({
  activeCollection,
  onSelectCollection,
  activeOrientation,
  onSelectOrientation,
  activeMood,
  onSelectMood,
  sortBy,
  onSelectSort,
  totalFiltered,
}) => {
  const { t } = useLanguage();

  const collections: { id: Collection; label: string; sub: string }[] = [
    { id: 'all', label: t.filter.allEditions, sub: t.filter.allEditionsSub },
    { id: 'imperial-echoes', label: t.filter.imperialEchoes, sub: t.filter.imperialEchoesSub },
    { id: 'perfume-river', label: t.filter.perfumeRiver, sub: t.filter.perfumeRiverSub },
    { id: 'living-traditions', label: t.filter.livingTraditions, sub: t.filter.livingTraditionsSub },
    { id: 'poetic-monochrome', label: t.filter.poeticMonochrome, sub: t.filter.poeticMonochromeSub },
  ];

  const orientations: { id: Orientation | 'all'; label: string }[] = [
    { id: 'all', label: t.filter.allFormats },
    { id: 'landscape', label: t.filter.landscape },
    { id: 'portrait', label: t.filter.portrait },
    { id: 'panoramic', label: t.filter.panoramic },
  ];

  const moods = [
    { id: 'all', label: t.filter.allMoods },
    { id: 'imperial', label: t.filter.imperialGold },
    { id: 'misty', label: t.filter.etherealMist },
    { id: 'serene', label: t.filter.meditative },
    { id: 'vibrant', label: t.filter.vibrantSun },
    { id: 'nocturnal', label: t.filter.nocturne },
  ];

  return (
    <div id="gallery" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
      {/* Editorial Section Heading */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 pb-6 border-b border-[#252830]">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#dfb871] mb-2 font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.filter.sectionTag}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif text-[#f5f0e6] font-light">
            {t.filter.sectionTitle}
          </h2>
        </div>

        <div className="text-sm text-[#8a919e] font-sans">
          {t.filter.showingText} <span className="text-[#dfb871] font-semibold">{totalFiltered}</span> {t.filter.printsCount}
        </div>
      </div>

      {/* Collection Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
        {collections.map((col) => {
          const isActive = activeCollection === col.id;
          return (
            <button
              key={col.id}
              onClick={() => onSelectCollection(col.id)}
              className={`px-5 py-2.5 rounded-sm text-left transition-all shrink-0 cursor-pointer border ${
                isActive
                  ? 'bg-[#20242e] border-[#dfb871] text-[#f5f0e6] shadow-md'
                  : 'bg-[#12141a] border-[#22252e] text-[#9ba2af] hover:text-[#f5f0e6] hover:border-[#383d4a]'
              }`}
            >
              <div className="text-xs uppercase tracking-wider font-semibold">{col.label}</div>
              <div className="text-[10px] text-[#717887] font-sans">{col.sub}</div>
            </button>
          );
        })}
      </div>

      {/* Secondary Filters Bar */}
      <div className="bg-[#12141a]/80 border border-[#232732] p-4 rounded-sm flex flex-wrap items-center justify-between gap-4 text-xs">
        {/* Orientation Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[#717887] uppercase tracking-wider font-mono text-[10px]">{t.filter.formatLabel}</span>
          {orientations.map((o) => (
            <button
              key={o.id}
              onClick={() => onSelectOrientation(o.id)}
              className={`px-3 py-1.5 rounded-sm transition-all cursor-pointer ${
                activeOrientation === o.id
                  ? 'bg-[#2a303d] text-[#dfb871] font-medium'
                  : 'text-[#9ba2af] hover:text-white'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>

        {/* Mood Filter & Sorting */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Mood Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-[#717887] uppercase tracking-wider font-mono text-[10px]">{t.filter.atmosphereLabel}</span>
            <select
              value={activeMood}
              onChange={(e) => onSelectMood(e.target.value)}
              className="bg-[#191d26] border border-[#2d3240] text-[#c7cbd2] py-1 px-2.5 rounded-sm focus:outline-none focus:border-[#dfb871] cursor-pointer"
            >
              {moods.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#717887]" />
            <select
              value={sortBy}
              onChange={(e) => onSelectSort(e.target.value)}
              className="bg-[#191d26] border border-[#2d3240] text-[#c7cbd2] py-1 px-2.5 rounded-sm focus:outline-none focus:border-[#dfb871] cursor-pointer"
            >
              <option value="featured">{t.filter.sortCurator}</option>
              <option value="edition">{t.filter.sortScarcity}</option>
              <option value="price-low">{t.filter.sortPriceLow}</option>
              <option value="price-high">{t.filter.sortPriceHigh}</option>
              <option value="newest">{t.filter.sortNewest}</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
