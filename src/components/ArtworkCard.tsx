import React, { useState } from 'react';
import { Artwork } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useLanguage } from '../context/LanguageContext';
import { Heart, Eye, Sliders, MapPin } from 'lucide-react';

interface ArtworkCardProps {
  artwork: Artwork;
  onSelect: (artwork: Artwork) => void;
  onPreviewInRoom: (artwork: Artwork) => void;
}

export const ArtworkCard: React.FC<ArtworkCardProps> = ({
  artwork,
  onSelect,
  onPreviewInRoom,
}) => {
  const { formatPrice } = useCart();
  const { isFavorite, toggleFavorite } = useWishlist();
  const { language, t } = useLanguage();
  const [imageLoaded, setImageLoaded] = useState(false);

  const favorited = isFavorite(artwork.id);
  const isScarce = artwork.editionsRemaining <= 10;

  // Localized title & location
  const displayTitle = artwork.titles?.[language] || artwork.title;
  const displayLocation = artwork.locations?.[language] || artwork.location;
  const secondaryTitle = language === 'vi' ? artwork.titles?.en : artwork.vietnameseTitle;

  return (
    <div className="group relative bg-[#111318] border border-[#232733] hover:border-[#dfb871]/60 transition-all duration-300 rounded-sm overflow-hidden flex flex-col justify-between shadow-lg hover:shadow-2xl">
      {/* Artwork Image Container with Gallery Matting Frame Effect */}
      <div className="relative p-3 sm:p-4 bg-[#0d0f13] flex items-center justify-center overflow-hidden">
        {/* Subtle Archival Mat effect */}
        <div className="relative w-full overflow-hidden bg-[#151821] shadow-inner transition-transform duration-500 group-hover:scale-[1.01]">
          {/* Skeleton placeholder while loading */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-[#191d26] animate-pulse flex items-center justify-center">
              <span className="text-xs text-[#525a6c] font-mono">Loading...</span>
            </div>
          )}

          <img
            src={artwork.imageUrl}
            alt={displayTitle}
            onLoad={() => setImageLoaded(true)}
            className={`w-full object-cover transition-all duration-700 ${
              artwork.orientation === 'portrait'
                ? 'aspect-[2/3]'
                : artwork.orientation === 'panoramic'
                ? 'aspect-[16/9]'
                : 'aspect-[3/2]'
            } ${imageLoaded ? 'opacity-100' : 'opacity-0'} group-hover:brightness-105`}
            loading="lazy"
          />

          {/* Scarcity & Edition Badge */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
            <span
              className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-xs tracking-wider backdrop-blur-md shadow-md ${
                isScarce
                  ? 'bg-[#842323]/90 text-[#fcedee] border border-[#d44545]'
                  : 'bg-[#151821]/80 text-[#dfb871] border border-[#dfb871]/30'
              }`}
            >
              {t.card.edition}: {artwork.editionTotal - artwork.editionsRemaining + 1}/{artwork.editionTotal}
            </span>
            {artwork.featured && (
              <span className="text-[9px] font-sans uppercase tracking-widest px-2 py-0.5 bg-[#dfb871] text-[#0b0c0e] font-bold rounded-xs shadow-md">
                {t.card.curatorChoice}
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(artwork.id);
            }}
            className="absolute top-2.5 right-2.5 p-2 rounded-full bg-[#0e1015]/80 hover:bg-[#0e1015] border border-[#2b303d] text-[#c5c9d2] hover:text-[#e87082] transition-colors z-10 cursor-pointer shadow-md"
            title={favorited ? 'Remove' : 'Save'}
          >
            <Heart className={`w-3.5 h-3.5 ${favorited ? 'fill-[#e87082] text-[#e87082]' : ''}`} />
          </button>

          {/* Quick Hover Action Overlay */}
          <div className="absolute inset-0 bg-[#0b0c0e]/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 p-4 backdrop-blur-[2px]">
            <button
              onClick={() => onSelect(artwork)}
              className="px-4 py-2 bg-[#dfb871] hover:bg-[#c5a059] text-[#0b0c0e] text-xs font-semibold uppercase tracking-wider rounded-xs flex items-center gap-1.5 shadow-xl transition-transform hover:scale-105 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{t.card.configureFrame}</span>
            </button>
            <button
              onClick={() => onPreviewInRoom(artwork)}
              className="p-2 bg-[#1b1f29] hover:bg-[#252b39] text-[#f5f0e6] border border-[#3b4252] rounded-xs shadow-xl transition-transform hover:scale-105 cursor-pointer"
              title={t.card.wallPreview}
            >
              <Eye className="w-4 h-4 text-[#dfb871]" />
            </button>
          </div>
        </div>
      </div>

      {/* Artwork Metadata & Purchase Info */}
      <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 border-t border-[#1f232e]">
        <div>
          {/* Location & Year */}
          <div className="flex items-center justify-between text-[11px] text-[#7d8696] mb-1.5 font-sans">
            <span className="flex items-center gap-1 truncate max-w-[70%]">
              <MapPin className="w-3 h-3 text-[#dfb871] shrink-0" />
              <span className="truncate">{displayLocation}</span>
            </span>
            <span className="font-mono text-[#9ea5b3]">{artwork.year}</span>
          </div>

          {/* Title in Active Language & Secondary */}
          <h3
            onClick={() => onSelect(artwork)}
            className="text-lg sm:text-xl font-serif text-[#f5f0e6] hover:text-[#dfb871] cursor-pointer transition-colors leading-snug mb-1"
          >
            {displayTitle}
          </h3>
          {secondaryTitle && (
            <p className="text-xs text-[#8991a0] italic mb-3 font-serif truncate">
              {secondaryTitle}
            </p>
          )}

          {/* Camera Info Snippet */}
          <p className="text-[10px] text-[#6b7383] font-mono line-clamp-1 mb-4 border-l border-[#2e3342] pl-2">
            {artwork.camera.camera} • {artwork.camera.settings}
          </p>
        </div>

        {/* Price & Action Row */}
        <div className="flex items-center justify-between pt-3 border-t border-[#1f232e]">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#717888] block">{t.card.fromPrice}</span>
            <span className="text-base font-serif font-semibold text-[#f5f0e6]">
              {formatPrice(artwork.basePriceUSD)}
            </span>
          </div>

          <button
            onClick={() => onSelect(artwork)}
            className="text-xs tracking-wider uppercase text-[#dfb871] hover:text-[#f7eedc] font-medium flex items-center gap-1 group/btn cursor-pointer"
          >
            <span>{t.card.viewEdition}</span>
            <span className="transition-transform group-hover/btn:translate-x-1">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};
