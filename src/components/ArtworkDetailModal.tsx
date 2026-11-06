import React, { useState, useRef } from 'react';
import { Artwork, PrintSize, PaperType, FrameType, MatType } from '../types';
import { PRINT_SIZES, PAPER_TYPES, FRAME_TYPES, MAT_TYPES } from '../data/framing';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useLanguage } from '../context/LanguageContext';
import {
  X,
  Heart,
  Eye,
  Check,
  ShoppingBag,
  Maximize2,
  MapPin,
  FileText,
} from 'lucide-react';

interface ArtworkDetailModalProps {
  artwork: Artwork | null;
  onClose: () => void;
  onPreviewInRoom: (artwork: Artwork) => void;
  onOpenCertificatePreview: (artwork: Artwork, size: PrintSize, paper: PaperType) => void;
}

export const ArtworkDetailModal: React.FC<ArtworkDetailModalProps> = ({
  artwork,
  onClose,
  onPreviewInRoom,
  onOpenCertificatePreview,
}) => {
  const { calculateItemPrice, formatPrice, addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useWishlist();
  const { language, t } = useLanguage();

  const [selectedSize, setSelectedSize] = useState<PrintSize>(PRINT_SIZES[1]); // Classic Gallery default
  const [selectedPaper, setSelectedPaper] = useState<PaperType>(PAPER_TYPES[0]); // Hahnemuhle default
  const [selectedFrame, setSelectedFrame] = useState<FrameType>(FRAME_TYPES[1]); // Solid Oak default
  const [selectedMat, setSelectedMat] = useState<MatType>(MAT_TYPES[1]); // Ivory Mat default
  const [customDedication, setCustomDedication] = useState('');
  const [activeTab, setActiveTab] = useState<'configure' | 'story' | 'camera'>('configure');
  const [addedToast, setAddedToast] = useState(false);

  // Loupe magnifier state
  const [showLoupe, setShowLoupe] = useState(false);
  const [loupePos, setLoupePos] = useState({ x: 0, y: 0, bgX: 0, bgY: 0 });
  const imgContainerRef = useRef<HTMLDivElement>(null);

  if (!artwork) return null;

  const currentPriceUSD = calculateItemPrice(
    artwork,
    selectedSize,
    selectedPaper,
    selectedFrame,
    selectedMat
  );

  const favorited = isFavorite(artwork.id);

  // Localized texts
  const displayTitle = artwork.titles?.[language] || artwork.title;
  const displayLocation = artwork.locations?.[language] || artwork.location;
  const displayStory = artwork.stories?.[language] || artwork.story;
  const displayHistoricalNote = artwork.historicalNotes?.[language] || artwork.historicalNote;
  const secondaryTitle = language === 'vi' ? artwork.titles?.en : artwork.vietnameseTitle;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imgContainerRef.current) return;
    const { left, top, width, height } = imgContainerRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;

    if (x < 0 || x > width || y < 0 || y > height) {
      setShowLoupe(false);
      return;
    }

    const bgX = (x / width) * 100;
    const bgY = (y / height) * 100;

    setLoupePos({ x, y, bgX, bgY });
    setShowLoupe(true);
  };

  const handleAddToCart = () => {
    addToCart(artwork, selectedSize, selectedPaper, selectedFrame, selectedMat, 1, customDedication);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0b0c0e]/95 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl bg-[#111319] border border-[#2b303e] rounded-sm shadow-2xl overflow-hidden my-auto max-h-[96vh] flex flex-col">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#222633] bg-[#141720]">
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#dfb871] bg-[#222838] px-2.5 py-1 rounded-xs border border-[#dfb871]/30">
              {t.modal.editionBadge} • {artwork.editionTotal - artwork.editionsRemaining + 1} / {artwork.editionTotal}
            </span>
            <span className="hidden sm:inline text-xs text-[#8a919f] font-sans">
              {t.modal.archivalNote}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleFavorite(artwork.id)}
              className="p-2 text-[#9da3b1] hover:text-[#e87082] transition-colors rounded-full hover:bg-[#1f232e] cursor-pointer"
              title="Save to Wishlist"
            >
              <Heart className={`w-4 h-4 ${favorited ? 'fill-[#e87082] text-[#e87082]' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#9da3b1] hover:text-white transition-colors rounded-full hover:bg-[#1f232e] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto">
          {/* Left Column: Interactive Framing & Image Inspection (7 Cols) */}
          <div className="lg:col-span-7 bg-[#0d0f14] p-4 sm:p-8 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-[#222633] relative select-none">
            {/* Visualizer Prompt */}
            <div className="w-full flex items-center justify-between text-xs text-[#818a99] mb-4">
              <span className="flex items-center gap-1.5 font-mono text-[11px]">
                <Maximize2 className="w-3.5 h-3.5 text-[#dfb871]" />
                {t.modal.loupePrompt}
              </span>

              <button
                onClick={() => onPreviewInRoom(artwork)}
                className="flex items-center gap-1.5 text-[#dfb871] hover:text-[#f5f0e6] font-medium text-xs tracking-wider uppercase transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{t.modal.viewOnWall}</span>
              </button>
            </div>

            {/* Framed Artwork Preview Box */}
            <div className="relative max-w-full max-h-[58vh] flex items-center justify-center p-6 bg-[#0a0c10] rounded-xs shadow-2xl">
              {/* Outer Frame Simulation */}
              <div
                style={{
                  padding: selectedFrame.frameWidthPx > 0 ? `${selectedFrame.frameWidthPx}px` : '0px',
                  backgroundColor: selectedFrame.borderHex !== 'transparent' ? selectedFrame.borderHex : 'transparent',
                  boxShadow:
                    selectedFrame.id !== 'frame-none'
                      ? '0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 2px 4px rgba(255, 255, 255, 0.15)'
                      : '0 20px 40px rgba(0, 0, 0, 0.6)',
                }}
                className="transition-all duration-300 relative rounded-[2px]"
              >
                {/* Mat Board Simulation */}
                <div
                  style={{
                    padding: selectedMat.id !== 'mat-none' ? '28px' : '0px',
                    backgroundColor: selectedMat.colorHex !== 'transparent' ? selectedMat.colorHex : 'transparent',
                    boxShadow: selectedMat.id !== 'mat-none' ? 'inset 0 2px 8px rgba(0,0,0,0.45)' : 'none',
                  }}
                  className="transition-all duration-300"
                >
                  {/* Image Container with Loupe */}
                  <div
                    ref={imgContainerRef}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => setShowLoupe(false)}
                    className="relative cursor-crosshair overflow-hidden shadow-md"
                  >
                    <img
                      src={artwork.imageUrl}
                      alt={displayTitle}
                      className={`max-h-[46vh] w-auto object-contain transition-all duration-300 ${
                        selectedPaper.id === 'paper-washi' ? 'contrast-95 brightness-105' : ''
                      }`}
                    />

                    {/* Paper Texture Overlay */}
                    {selectedPaper.id === 'paper-washi' && (
                      <div className="absolute inset-0 bg-[#e8ded0]/10 mix-blend-overlay pointer-events-none" />
                    )}

                    {/* Interactive 2.5x Loupe Magnifier */}
                    {showLoupe && (
                      <div
                        style={{
                          left: `${loupePos.x - 70}px`,
                          top: `${loupePos.y - 70}px`,
                          backgroundImage: `url(${artwork.highResUrl})`,
                          backgroundPosition: `${loupePos.bgX}% ${loupePos.bgY}%`,
                          backgroundSize: '350%',
                        }}
                        className="absolute w-36 h-36 rounded-full border-2 border-[#dfb871] shadow-2xl pointer-events-none z-30 bg-no-repeat ring-4 ring-black/60"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Specs Under Preview */}
            <div className="mt-5 text-center">
              <p className="text-xs font-mono text-[#a2abb9]">
                {selectedSize.dimensionsCm} ({selectedSize.dimensionsInches}) • {selectedPaper.name}
              </p>
              <p className="text-[11px] text-[#717888] mt-0.5">
                {selectedFrame.names[language]} {selectedMat.id !== 'mat-none' ? `• ${selectedMat.names[language]}` : ''}
              </p>
            </div>
          </div>

          {/* Right Column: Customization Controls & Artwork Narrative (5 Cols) */}
          <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto max-h-[82vh]">
            <div>
              {/* Title Header */}
              <div className="mb-5 pb-4 border-b border-[#222633]">
                <div className="flex items-center gap-1.5 text-xs text-[#dfb871] mb-1 font-sans">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{displayLocation}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif text-[#f5f0e6] leading-tight mb-1">
                  {displayTitle}
                </h2>
                {secondaryTitle && (
                  <p className="text-sm text-[#8c94a4] italic font-serif">
                    {secondaryTitle}
                  </p>
                )}
              </div>

              {/* Sub-Tabs: Configure / Story / Camera */}
              <div className="flex border-b border-[#222633] mb-6 text-xs font-sans uppercase tracking-wider">
                <button
                  onClick={() => setActiveTab('configure')}
                  className={`pb-2.5 mr-6 transition-colors border-b-2 cursor-pointer ${
                    activeTab === 'configure'
                      ? 'border-[#dfb871] text-[#dfb871] font-semibold'
                      : 'border-transparent text-[#818a99] hover:text-white'
                  }`}
                >
                  {t.modal.tabConfigure}
                </button>
                <button
                  onClick={() => setActiveTab('story')}
                  className={`pb-2.5 mr-6 transition-colors border-b-2 cursor-pointer ${
                    activeTab === 'story'
                      ? 'border-[#dfb871] text-[#dfb871] font-semibold'
                      : 'border-transparent text-[#818a99] hover:text-white'
                  }`}
                >
                  {t.modal.tabStory}
                </button>
                <button
                  onClick={() => setActiveTab('camera')}
                  className={`pb-2.5 transition-colors border-b-2 cursor-pointer ${
                    activeTab === 'camera'
                      ? 'border-[#dfb871] text-[#dfb871] font-semibold'
                      : 'border-transparent text-[#818a99] hover:text-white'
                  }`}
                >
                  {t.modal.tabCamera}
                </button>
              </div>

              {/* TAB 1: CONFIGURE */}
              {activeTab === 'configure' && (
                <div className="space-y-6">
                  {/* Step 1: Print Size Selection */}
                  <div>
                    <label className="text-xs uppercase font-mono tracking-wider text-[#a2abb9] mb-2 flex items-center justify-between">
                      <span>{t.modal.stepSize}</span>
                      <span className="text-[#dfb871]">{selectedSize.dimensionsCm}</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {PRINT_SIZES.map((size) => (
                        <button
                          key={size.id}
                          onClick={() => setSelectedSize(size)}
                          className={`p-2.5 text-left border rounded-xs transition-all cursor-pointer ${
                            selectedSize.id === size.id
                              ? 'bg-[#1e2330] border-[#dfb871] text-white shadow-sm'
                              : 'bg-[#13161d] border-[#222633] text-[#939cae] hover:border-[#383f50]'
                          }`}
                        >
                          <div className="text-xs font-semibold text-[#f5f0e6]">{size.names[language]}</div>
                          <div className="text-[11px] text-[#717888] font-mono mt-0.5">
                            {size.dimensionsCm} ({size.dimensionsInches})
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 2: Museum Paper Selection */}
                  <div>
                    <label className="text-xs uppercase font-mono tracking-wider text-[#a2abb9] mb-2 flex items-center justify-between">
                      <span>{t.modal.stepPaper}</span>
                      <span className="text-[11px] text-[#8a919f]">{selectedPaper.weightGsm} gsm</span>
                    </label>
                    <div className="space-y-2">
                      {PAPER_TYPES.map((paper) => (
                        <button
                          key={paper.id}
                          onClick={() => setSelectedPaper(paper)}
                          className={`w-full p-2.5 text-left border rounded-xs transition-all cursor-pointer flex items-center justify-between ${
                            selectedPaper.id === paper.id
                              ? 'bg-[#1e2330] border-[#dfb871] text-white'
                              : 'bg-[#13161d] border-[#222633] text-[#939cae] hover:border-[#383f50]'
                          }`}
                        >
                          <div>
                            <div className="text-xs font-medium text-[#f5f0e6]">{paper.name}</div>
                            <div className="text-[10px] text-[#717888]">{paper.subnames[language]} • {paper.finishes[language]}</div>
                          </div>
                          {paper.surchargeUSD > 0 && (
                            <span className="text-[11px] font-mono text-[#dfb871]">
                              +{formatPrice(paper.surchargeUSD)}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 3: Frame Selection */}
                  <div>
                    <label className="text-xs uppercase font-mono tracking-wider text-[#a2abb9] mb-2 flex items-center justify-between">
                      <span>{t.modal.stepFrame}</span>
                      <span className="text-[#dfb871]">{selectedFrame.names[language]}</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {FRAME_TYPES.map((frame) => (
                        <button
                          key={frame.id}
                          onClick={() => setSelectedFrame(frame)}
                          className={`p-2 text-left border rounded-xs transition-all cursor-pointer flex flex-col justify-between ${
                            selectedFrame.id === frame.id
                              ? 'bg-[#1e2330] border-[#dfb871] text-white'
                              : 'bg-[#13161d] border-[#222633] text-[#939cae] hover:border-[#383f50]'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <span
                              style={{ backgroundColor: frame.borderHex !== 'transparent' ? frame.borderHex : '#444' }}
                              className="w-3 h-3 rounded-full border border-white/20 shrink-0"
                            />
                            <span className="text-[11px] font-medium text-[#f5f0e6] truncate">
                              {frame.names[language]}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-[#8a919f]">
                            {frame.surchargeUSD === 0 ? t.modal.included : `+${formatPrice(frame.surchargeUSD)}`}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 4: Mat Board Option */}
                  {selectedFrame.id !== 'frame-none' && (
                    <div>
                      <label className="text-xs uppercase font-mono tracking-wider text-[#a2abb9] mb-2 block">
                        {t.modal.stepMat}
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {MAT_TYPES.map((mat) => (
                          <button
                            key={mat.id}
                            onClick={() => setSelectedMat(mat)}
                            className={`p-2 text-center border rounded-xs transition-all cursor-pointer ${
                              selectedMat.id === mat.id
                                ? 'bg-[#1e2330] border-[#dfb871] text-[#dfb871]'
                                : 'bg-[#13161d] border-[#222633] text-[#939cae] hover:border-[#383f50]'
                            }`}
                          >
                            <span className="text-[11px] block">{mat.names[language]}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Certificate Dedication Input */}
                  <div>
                    <label className="text-xs uppercase font-mono tracking-wider text-[#a2abb9] mb-1 flex items-center justify-between">
                      <span>{t.modal.customDedicationLabel}</span>
                      <span className="text-[10px] text-[#717888] font-sans">{t.modal.optional}</span>
                    </label>
                    <input
                      type="text"
                      placeholder={t.modal.customDedicationPlaceholder}
                      value={customDedication}
                      onChange={(e) => setCustomDedication(e.target.value)}
                      maxLength={70}
                      className="w-full bg-[#13161d] border border-[#222633] rounded-xs px-3 py-2 text-xs text-[#f5f0e6] placeholder-[#575e6d] focus:outline-none focus:border-[#dfb871]"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: STORY */}
              {activeTab === 'story' && (
                <div className="space-y-5 text-sm text-[#b2bac7] leading-relaxed">
                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-widest text-[#dfb871] mb-2">
                      {t.modal.photographerNote}
                    </h4>
                    <p className="font-serif text-base text-[#e5dfd5] italic">
                      "{displayStory}"
                    </p>
                  </div>

                  <div className="p-4 bg-[#141822] border-l-2 border-[#dfb871] rounded-r-xs">
                    <h4 className="text-xs font-mono uppercase tracking-widest text-[#dfb871] mb-1">
                      {t.modal.historicalSignificance}
                    </h4>
                    <p className="text-xs text-[#9ea7b5] leading-normal font-sans">
                      {displayHistoricalNote}
                    </p>
                  </div>

                  <button
                    onClick={() => onOpenCertificatePreview(artwork, selectedSize, selectedPaper)}
                    className="w-full py-2.5 bg-[#171b25] hover:bg-[#202533] border border-[#2c3242] text-[#dfb871] text-xs font-mono uppercase tracking-wider rounded-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{t.modal.viewCertificateSample}</span>
                  </button>
                </div>
              )}

              {/* TAB 3: CAMERA DATA */}
              {activeTab === 'camera' && (
                <div className="space-y-4 text-xs font-mono">
                  <div className="bg-[#141822] p-4 rounded-xs border border-[#232734] space-y-3">
                    <div className="flex items-center justify-between border-b border-[#222633] pb-2">
                      <span className="text-[#717888]">{t.modal.cameraBody}</span>
                      <span className="text-[#f5f0e6]">{artwork.camera.camera}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-[#222633] pb-2">
                      <span className="text-[#717888]">{t.modal.cameraLens}</span>
                      <span className="text-[#f5f0e6]">{artwork.camera.lens}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-[#222633] pb-2">
                      <span className="text-[#717888]">{t.modal.exposureSettings}</span>
                      <span className="text-[#f5f0e6]">{artwork.camera.settings}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-[#222633] pb-2">
                      <span className="text-[#717888]">{t.modal.coordinates}</span>
                      <span className="text-[#dfb871]">{artwork.camera.coordinates}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#717888]">{t.modal.capturedTime}</span>
                      <span className="text-[#f5f0e6]">{artwork.camera.capturedAt}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#717888] font-sans">
                    {t.modal.rawNote}
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Checkout & Add to Cart Action */}
            <div className="pt-6 border-t border-[#222633] mt-6">
              <div className="flex items-end justify-between mb-4">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-[#717888] block">
                    {t.modal.totalInvestment}
                  </span>
                  <div className="text-2xl sm:text-3xl font-serif font-bold text-[#f5f0e6]">
                    {formatPrice(currentPriceUSD)}
                  </div>
                  <span className="text-[10px] text-[#818a99] font-sans">
                    {t.modal.freeInsuredNote}
                  </span>
                </div>

                <button
                  onClick={() => onPreviewInRoom(artwork)}
                  className="px-3 py-2 bg-[#171b24] hover:bg-[#202533] border border-[#2e3444] text-[#dfb871] text-xs font-sans uppercase tracking-wider rounded-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{t.modal.roomWallBtn}</span>
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full py-3.5 bg-[#dfb871] hover:bg-[#c5a059] text-[#0b0c0e] font-sans text-xs tracking-[0.2em] uppercase font-bold rounded-xs shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {addedToast ? (
                  <>
                    <Check className="w-4 h-4 text-[#0b0c0e]" />
                    <span>{t.modal.addedToBag}</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-[#0b0c0e]" />
                    <span>{t.modal.addEditionToBag}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
