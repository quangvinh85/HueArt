import React from 'react';
import { Artwork, PrintSize, PaperType } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { X, Printer, Award } from 'lucide-react';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  artwork: Artwork;
  size: PrintSize;
  paper: PaperType;
  collectorName?: string;
  orderNumber?: string;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  artwork,
  size,
  paper,
  collectorName = 'Distinguished Collector',
  orderNumber,
}) => {
  const { language, t } = useLanguage();

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const certificateSerial = orderNumber || `CERT-${artwork.id.slice(0, 4).toUpperCase()}-${new Date().getFullYear()}-0842`;
  const displayTitle = artwork.titles?.[language] || artwork.title;
  const secondaryTitle = language === 'vi' ? artwork.titles?.en : artwork.vietnameseTitle;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#14161f] border border-[#2b3040] rounded-sm shadow-2xl overflow-hidden my-auto max-h-[96vh] flex flex-col">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-[#171a25] border-b border-[#242838]">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#dfb871]" />
            <span className="text-xs uppercase font-mono tracking-widest text-[#dfb871]">
              {t.certificate.title}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-3 py-1 bg-[#202534] hover:bg-[#2b3145] text-[#f5f0e6] text-xs font-mono uppercase rounded-xs flex items-center gap-1.5 cursor-pointer border border-[#3b435a]"
            >
              <Printer className="w-3.5 h-3.5 text-[#dfb871]" />
              <span>{t.certificate.printPdfBtn}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-[#8e96a4] hover:text-white rounded-full hover:bg-[#202534] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* The Printable Certificate Paper */}
        <div className="p-6 sm:p-10 overflow-y-auto flex items-center justify-center bg-[#0d0f15]">
          <div className="w-full max-w-2xl bg-[#faf6ee] text-[#1c1c1f] p-8 sm:p-12 border-8 border-double border-[#96773e] rounded-xs shadow-2xl relative select-none">
            {/* Background Archival Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
              <span className="font-serif text-[180px] font-bold text-black uppercase">
                HUẾ
              </span>
            </div>

            {/* Certificate Header */}
            <div className="text-center pb-6 border-b-2 border-[#96773e]/40 mb-6 relative">
              <div className="text-[10px] font-mono tracking-[0.35em] uppercase text-[#735a2b] mb-1">
                {t.certificate.studioHeader}
              </div>
              <h2 className="text-3xl sm:text-4xl font-serif tracking-widest uppercase text-[#29261f]">
                {t.certificate.mainTitle}
              </h2>
              <p className="text-xs font-serif italic text-[#635a49] mt-1">
                {t.certificate.subtitleVi}
              </p>
            </div>

            {/* Certificate Body Statement */}
            <div className="space-y-4 text-center my-6">
              <p className="text-xs sm:text-sm font-serif leading-relaxed text-[#423d34]">
                {t.certificate.statement}
              </p>

              {/* Artwork Title Block */}
              <div className="py-4 px-6 bg-[#f1ece1] border border-[#d8cdb8] rounded-xs my-4 inline-block max-w-lg mx-auto">
                <div className="text-[10px] font-mono tracking-widest uppercase text-[#735a2b] mb-0.5">
                  {t.certificate.artworkTitleLabel}
                </div>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#1a1714]">
                  {displayTitle}
                </h3>
                {secondaryTitle && (
                  <p className="text-xs italic font-serif text-[#665e52]">
                    {secondaryTitle}
                  </p>
                )}
              </div>

              {/* Technical Specifications Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left pt-2 pb-4 text-xs border-y border-[#d8cdb8]/80 font-mono">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-[#735a2b] block">{t.certificate.editionLabel}</span>
                  <strong className="text-[#1c1c1f]">
                    {artwork.editionTotal - artwork.editionsRemaining + 1} / {artwork.editionTotal}
                  </strong>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-[#735a2b] block">{t.certificate.dimensionsLabel}</span>
                  <strong className="text-[#1c1c1f]">{size.dimensionsCm}</strong>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-[#735a2b] block">{t.certificate.paperMediumLabel}</span>
                  <strong className="text-[#1c1c1f] truncate block">{paper.name}</strong>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-[#735a2b] block">{t.certificate.locationGpsLabel}</span>
                  <strong className="text-[#1c1c1f] text-[11px] truncate block">{artwork.camera.coordinates}</strong>
                </div>
              </div>

              {/* Dedicated Collector Line */}
              <div className="pt-2 text-xs font-serif text-[#554e42]">
                {t.certificate.registeredToLabel}:{' '}
                <strong className="text-[#1c1c1f] underline decoration-[#96773e]">
                  {collectorName}
                </strong>
              </div>
            </div>

            {/* Signatures & Seal Footer */}
            <div className="pt-6 border-t-2 border-[#96773e]/40 flex items-end justify-between text-xs">
              {/* Studio Seal */}
              <div className="flex items-center gap-2">
                <div className="w-14 h-14 rounded-full border-2 border-red-700 text-red-700 flex flex-col items-center justify-center p-1 transform -rotate-12 shadow-xs">
                  <span className="text-[8px] font-mono tracking-tighter uppercase font-bold">HUE ART</span>
                  <span className="text-[7px] tracking-widest uppercase">ẤN KÝ</span>
                  <span className="text-[6px] font-mono">VERIFIED</span>
                </div>
                <div className="text-[10px] font-mono text-[#735a2b]">
                  <div>Ref: {certificateSerial}</div>
                  <div>{t.certificate.issuedLabel}: {new Date().toLocaleDateString(language === 'vi' ? 'vi-VN' : language === 'fr' ? 'fr-FR' : 'en-US', { month: 'long', year: 'numeric' })}</div>
                </div>
              </div>

              {/* Artist Signature */}
              <div className="text-right">
                <div className="font-serif italic text-2xl text-[#1a1714] pb-1 pr-2">
                  Quang Vinh
                </div>
                <div className="w-36 h-0.5 bg-[#96773e] ml-auto mb-1" />
                <div className="text-[10px] font-mono uppercase text-[#735a2b] tracking-wider">
                  {t.certificate.artistTitle}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
