import React, { useState } from 'react';
import { Artwork, FrameType, PrintSize } from '../types';
import { ARTWORKS } from '../data/artworks';
import { FRAME_TYPES, PRINT_SIZES, ROOM_PRESETS } from '../data/framing';
import { useLanguage } from '../context/LanguageContext';
import { X, Sliders, ChevronLeft, ChevronRight } from 'lucide-react';

interface RoomVisualizerModalProps {
  initialArtwork: Artwork | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectArtworkForCustomizing: (artwork: Artwork) => void;
}

export const RoomVisualizerModal: React.FC<RoomVisualizerModalProps> = ({
  initialArtwork,
  isOpen,
  onClose,
  onSelectArtworkForCustomizing,
}) => {
  const { language, t } = useLanguage();
  const [currentArtwork, setCurrentArtwork] = useState<Artwork>(
    initialArtwork || ARTWORKS[0]
  );
  const [selectedRoom, setSelectedRoom] = useState(ROOM_PRESETS[0]);
  const [customWallColor, setCustomWallColor] = useState(ROOM_PRESETS[0].wallColor);
  const [selectedFrame, setSelectedFrame] = useState<FrameType>(FRAME_TYPES[1]); // Oak
  const [selectedSize, setSelectedSize] = useState<PrintSize>(PRINT_SIZES[1]); // Classic Gallery

  if (!isOpen) return null;

  const displayTitle = currentArtwork.titles?.[language] || currentArtwork.title;

  const wallColors = [
    { label: 'Gốc / Original', hex: selectedRoom.wallColor },
    { label: 'Vải Lanh Ấm / Linen', hex: '#ede6da' },
    { label: 'Xanh Ngọc Celadon', hex: '#c5cdc4' },
    { label: 'Xám Than Zen / Charcoal', hex: '#262a33' },
    { label: 'Đất Nung Terracotta', hex: '#b38274' },
    { label: 'Trắng Sáng Studio', hex: '#f9f8f5' },
  ];

  // Dynamic scale percentage based on size
  const scaleMap: Record<string, string> = {
    'size-small': 'w-36 sm:w-48',
    'size-classic': 'w-48 sm:w-64',
    'size-exhibition': 'w-60 sm:w-80',
    'size-grand': 'w-72 sm:w-[26rem]',
  };

  const currentIndex = ARTWORKS.findIndex((a) => a.id === currentArtwork.id);
  const handlePrev = () => {
    const prev = (currentIndex - 1 + ARTWORKS.length) % ARTWORKS.length;
    setCurrentArtwork(ARTWORKS[prev]);
  };
  const handleNext = () => {
    const next = (currentIndex + 1) % ARTWORKS.length;
    setCurrentArtwork(ARTWORKS[next]);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#08090b]/95 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl bg-[#111319] border border-[#272c3a] rounded-sm shadow-2xl overflow-hidden my-auto max-h-[96vh] flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#141720] border-b border-[#222633]">
          <div>
            <h3 className="font-serif text-lg text-[#f5f0e6]">
              {t.visualizer.title}
            </h3>
            <p className="text-xs text-[#8a919f] font-sans">
              {t.visualizer.subtitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#9da3b1] hover:text-white transition-colors rounded-full hover:bg-[#1f232e] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Room Stage Canvas */}
        <div className="relative h-[50vh] sm:h-[58vh] overflow-hidden flex items-center justify-center select-none">
          {/* Room Ambient Background Image with Tint Overlay */}
          <img
            src={selectedRoom.sceneImage}
            alt={selectedRoom.names[language]}
            className="absolute inset-0 w-full h-full object-cover object-center brightness-90 filter"
          />

          {/* Wall Paint Overlay Color tint with multiply blend */}
          <div
            style={{ backgroundColor: customWallColor }}
            className="absolute inset-0 mix-blend-multiply opacity-75 transition-colors duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

          {/* The Framed Artwork Hung on Wall */}
          <div className="relative z-10 flex flex-col items-center justify-center transition-all duration-300">
            {/* Drop Shadow on the wall behind the frame */}
            <div
              style={{
                padding: selectedFrame.frameWidthPx > 0 ? `${selectedFrame.frameWidthPx}px` : '0px',
                backgroundColor: selectedFrame.borderHex !== 'transparent' ? selectedFrame.borderHex : 'transparent',
                boxShadow:
                  '0 35px 60px -15px rgba(0, 0, 0, 0.9), 0 0 15px rgba(0,0,0,0.5)',
              }}
              className={`transition-all duration-300 rounded-[2px] ${scaleMap[selectedSize.id] || 'w-64'}`}
            >
              <div className="p-3 bg-[#f6f3eb] shadow-inner transition-all">
                <img
                  src={currentArtwork.imageUrl}
                  alt={displayTitle}
                  className="w-full object-cover shadow-xs"
                />
              </div>
            </div>

            {/* Subtle Title Badge beneath the hanging */}
            <div className="mt-4 px-3 py-1 bg-[#0e1015]/85 backdrop-blur-md rounded-full border border-white/10 text-center shadow-lg">
              <span className="text-[11px] font-serif text-[#f5f0e6]">
                {displayTitle}
              </span>
              <span className="text-[10px] text-[#dfb871] font-mono ml-2">
                ({selectedSize.dimensionsCm} • {selectedFrame.names[language]})
              </span>
            </div>
          </div>

          {/* Previous / Next Artwork Arrows on Stage */}
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-[#0e1015]/80 hover:bg-[#0e1015] border border-white/10 text-white z-20 cursor-pointer shadow-xl transition-transform hover:scale-110"
            title={t.visualizer.prevArt}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-[#0e1015]/80 hover:bg-[#0e1015] border border-white/10 text-white z-20 cursor-pointer shadow-xl transition-transform hover:scale-110"
            title={t.visualizer.nextArt}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Bottom Configuration Toolbar */}
        <div className="bg-[#13161e] border-t border-[#222633] p-4 sm:p-6 grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 overflow-y-auto">
          {/* Room Environment Selection */}
          <div>
            <label className="text-[11px] uppercase font-mono tracking-wider text-[#8a92a0] mb-2 block">
              {t.visualizer.stepRoom}
            </label>
            <select
              value={selectedRoom.id}
              onChange={(e) => {
                const found = ROOM_PRESETS.find((r) => r.id === e.target.value);
                if (found) {
                  setSelectedRoom(found);
                  setCustomWallColor(found.wallColor);
                }
              }}
              className="w-full bg-[#181c25] border border-[#2b303d] text-xs text-[#f5f0e6] py-2 px-3 rounded-xs focus:outline-none focus:border-[#dfb871] cursor-pointer"
            >
              {ROOM_PRESETS.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.names[language]}
                </option>
              ))}
            </select>
          </div>

          {/* Wall Color Palette */}
          <div>
            <label className="text-[11px] uppercase font-mono tracking-wider text-[#8a92a0] mb-2 block">
              {t.visualizer.stepWallColor}
            </label>
            <div className="flex items-center gap-2">
              {wallColors.map((color) => (
                <button
                  key={color.label}
                  onClick={() => setCustomWallColor(color.hex)}
                  style={{ backgroundColor: color.hex }}
                  className={`w-7 h-7 rounded-full border transition-all cursor-pointer relative ${
                    customWallColor === color.hex
                      ? 'border-[#dfb871] ring-2 ring-[#dfb871]/40 scale-110'
                      : 'border-white/20 hover:scale-105'
                  }`}
                  title={color.label}
                />
              ))}
            </div>
          </div>

          {/* Frame Style Picker */}
          <div>
            <label className="text-[11px] uppercase font-mono tracking-wider text-[#8a92a0] mb-2 block">
              {t.visualizer.stepFrame}
            </label>
            <select
              value={selectedFrame.id}
              onChange={(e) => {
                const found = FRAME_TYPES.find((f) => f.id === e.target.value);
                if (found) setSelectedFrame(found);
              }}
              className="w-full bg-[#181c25] border border-[#2b303d] text-xs text-[#f5f0e6] py-2 px-3 rounded-xs focus:outline-none focus:border-[#dfb871] cursor-pointer"
            >
              {FRAME_TYPES.map((frame) => (
                <option key={frame.id} value={frame.id}>
                  {frame.names[language]}
                </option>
              ))}
            </select>
          </div>

          {/* Scale / Print Size & Customizer Action */}
          <div className="flex flex-col justify-end">
            <button
              onClick={() => {
                onClose();
                onSelectArtworkForCustomizing(currentArtwork);
              }}
              className="w-full py-2.5 bg-[#dfb871] hover:bg-[#c5a059] text-[#0b0c0e] font-sans text-xs tracking-wider uppercase font-bold rounded-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{t.visualizer.customizeEditionBtn}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
