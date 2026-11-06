import { ProtectedImage } from '../shop/ProtectedImage';
import { useShopLanguage } from '../shop/language';
import React, { useState, useEffect } from 'react';
import { Artwork } from '../types';
import { getCuratorAdvice, CuratorResponse } from '../services/geminiService';
import { useLanguage } from '../context/LanguageContext';
import { X, Sparkles, Send, Loader2, ArrowRight } from 'lucide-react';

interface CuratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectArtwork: (artwork: Artwork) => void;
}

export const CuratorModal: React.FC<CuratorModalProps> = ({
  isOpen,
  onClose,
  onSelectArtwork,
}) => {
  const { language, t } = useLanguage();
  const { tr } = useShopLanguage();
  const [error,setError] = useState('');
  const [query, setQuery] = useState('');
  const [selectedRoomType, setSelectedRoomType] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CuratorResponse | null>(null);

  useEffect(()=>{setResult(null);setError('');},[language]);
  if (!isOpen) return null;

  const roomPresets = language === 'vi' ? [
    { label: 'Phòng Khách Ấm Cúng', mood: 'Hoàng Gia Cổ Kính', text: 'Tôi muốn tìm bức tranh làm điểm nhấn sang trọng cho phòng khách, mang hơi thở cung đình và lịch sử ngàn năm.' },
    { label: 'Phòng Ngủ Thiền Định', mood: 'Sương Khói Mơ Màng', text: 'Cần một tác phẩm tĩnh lặng với sương sớm sông Hương để mang lại giấc ngủ thư thái và bình yên.' },
    { label: 'Phòng Làm Việc & Đọc Sách', mood: 'Trắng Đen Hoài Niệm', text: 'Tìm kiếm bức ảnh kiến trúc nghệ thuật đen trắng sắc sảo, phù hợp với tủ sách gỗ óc chó sẫm màu.' },
    { label: 'Không Gian Thưởng Trà', mood: 'Nét Đẹp Làng Nghề', text: 'Cần bức tranh tôn vinh hoa sen hồ Tịnh Tâm hoặc sắc màu làng hương Thủy Xuân tràn đầy sức sống.' },
  ] : language === 'fr' ? [
    { label: 'Salon Chaleureux', mood: 'Élégance Impériale', text: 'Je recherche une œuvre qui commande la pièce avec chaleur et noblesse historique.' },
    { label: 'Chambre Méditative', mood: 'Brume & Sérénité', text: 'À la recherche d’une photographie apaisante avec la brume de la rivière pour la détente.' },
    { label: 'Bureau & Bibliothèque', mood: 'Monochrome Précis', text: 'Tirage architectural noir et blanc raffiné s’associant au mobilier en noyer foncé.' },
    { label: 'Espace Thé & Détente', mood: 'Tradition Vivante', text: 'Célébration vibrante de l’artisanat de l’encens et des lotus royaux de Hué.' },
  ] : [
    { label: 'Living Salon', mood: 'Imperial Elegance', text: 'I want an artwork that commands the room with timeless warmth and ancient history.' },
    { label: 'Quiet Bedroom', mood: 'Misty & Meditative', text: 'Looking for a calm, serene photograph with soft river mist to bring peace before sleep.' },
    { label: 'Executive Study', mood: 'Monochrome Drama', text: 'Seeking a sophisticated architectural fine-art print that pairs with dark walnut furniture.' },
    { label: 'Dining Area', mood: 'Vibrant Heritage', text: 'Want a vibrant celebration of Vietnamese artisanal culture and vivid color.' },
  ];

  const handleConsult = async (overrideQuery?: string, overrideMood?: string) => {
    const q = overrideQuery || query;
    if (!q.trim()) return;

    if(loading)return;
    setLoading(true);setError('');
    try {
      const response = await getCuratorAdvice(q, selectedRoomType, overrideMood || selectedMood, language);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? tr(err.message) : tr('Chưa lấy được gợi ý. Vui lòng thử lại.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#090b0e]/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#111319] border border-[#2b303d] rounded-sm shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#141822] border-b border-[#222633]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-full bg-[#dfb871]/10 border border-[#dfb871]/30 text-[#dfb871]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg text-[#f5f0e6]">
                {t.curatorModal.title}
              </h3>
              <p className="text-xs text-[#8a919f] font-sans">
                {t.curatorModal.subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label={tr('Đóng')}
            className="p-2 text-[#9da3b1] hover:text-white transition-colors rounded-full hover:bg-[#1f232e] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Quick Consultation Presets */}
          <div>
            <label className="text-xs uppercase font-mono tracking-wider text-[#8a919f] mb-2.5 block">
              {t.curatorModal.themesLabel}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {roomPresets.map((preset) => (
                <button
                  key={preset.label}
                  disabled={loading}
                  onClick={() => {
                    setQuery(preset.text);
                    setSelectedMood(preset.mood);
                    handleConsult(preset.text, preset.mood);
                  }}
                  className="p-3 bg-[#161922] hover:bg-[#1e2330] border border-[#232733] hover:border-[#dfb871]/40 rounded-xs text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-[#f5f0e6] group-hover:text-[#dfb871]">
                      {preset.label}
                    </span>
                    <span className="text-[10px] text-[#dfb871] font-mono">
                      {preset.mood}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#717888] line-clamp-2">
                    {preset.text}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* User Prompt Input */}
          <div className="space-y-2">
            <label className="text-xs uppercase font-mono tracking-wider text-[#8a919f] block">
              {t.curatorModal.inputLabel}
            </label>
            <div className="relative">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.curatorModal.inputPlaceholder}
                rows={3}
                className="w-full bg-[#151821] border border-[#262b38] rounded-xs p-3 text-xs text-[#f5f0e6] placeholder-[#575e6d] focus:outline-none focus:border-[#dfb871]"
              />
              <button
                onClick={() => handleConsult()}
                disabled={loading || !query.trim()}
                className="absolute right-3 bottom-3 px-3.5 py-1.5 bg-[#dfb871] hover:bg-[#c5a059] disabled:opacity-40 text-[#0b0c0e] text-xs font-semibold uppercase tracking-wider rounded-xs flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                {loading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <span>{t.curatorModal.consultBtn}</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="py-8 text-center space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#dfb871] mx-auto" />
              <p className="text-xs font-mono text-[#8a919f]">
                {t.curatorModal.evaluating}
              </p>
            </div>
          )}

          {error&&<p className="shop-order-error" role="alert">{error}</p>}
          {result?.mode==='catalog'&&!loading&&<p className="shop-option-description">{tr('Đang dùng gợi ý theo bộ sưu tập. AI sẽ hoạt động khi quản trị viên cấu hình API key và dịch vụ sẵn sàng.')}</p>}
          {/* Recommendation Results */}
          {result && !loading && (
            <div className="space-y-6 pt-4 border-t border-[#222633] animate-in fade-in duration-300">
              {/* Curator Note */}
              <div className="p-4 bg-[#141822] border-l-2 border-[#dfb871] rounded-r-xs">
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#dfb871] block mb-1">
                  {t.curatorModal.evaluationTitle}
                </span>
                <p className="font-serif text-sm text-[#e4ddd4] italic leading-relaxed">
                  "{result.curatorNote}"
                </p>
              </div>

              {/* Recommended Prints Grid */}
              <div className="space-y-4">
                <span className="text-xs uppercase font-mono tracking-wider text-[#8a919f] block">
                  {t.curatorModal.recommendedArtworks}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {result.recommendations.map((rec) => {
                    const recTitle = rec.artwork.titles?.[language] || rec.artwork.title;
                    const recSubtitle = language === 'vi' ? rec.artwork.titles?.en : rec.artwork.vietnameseTitle;

                    return (
                      <div
                        key={rec.artwork.id}
                        className="bg-[#151821] border border-[#272c3a] hover:border-[#dfb871]/50 p-4 rounded-xs transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="relative aspect-[3/2] overflow-hidden rounded-xs mb-3 bg-[#0d0f14]">
                            <ProtectedImage
                              src={rec.artwork.imageUrl}
                              alt={recTitle}
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-[#0b0c0e]/80 text-[#dfb871] text-[10px] font-mono rounded-xs">
                              {rec.aestheticMood}
                            </span>
                          </div>

                          <h4 className="font-serif text-base text-[#f5f0e6] mb-0.5">
                            {recTitle}
                          </h4>
                          {recSubtitle && (
                            <p className="text-xs text-[#8a919f] italic font-serif mb-2">
                              {recSubtitle}
                            </p>
                          )}
                          <p className="text-xs text-[#a2abb9] leading-relaxed mb-3">
                            {rec.reason}
                          </p>

                          <div className="text-[11px] font-mono text-[#717888] space-y-1 mb-4 bg-[#0d0f14] p-2 rounded-xs">
                            <div>{t.curatorModal.scaleLabel} <span className="text-[#f5f0e6]">{rec.recommendedSize}</span></div>
                            <div>{t.curatorModal.framingLabel} <span className="text-[#dfb871]">{rec.recommendedFrame}</span></div>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            onClose();
                            onSelectArtwork(rec.artwork);
                          }}
                          className="w-full py-2 bg-[#dfb871] hover:bg-[#c5a059] text-[#0b0c0e] font-sans text-xs tracking-wider uppercase font-bold rounded-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <span>{tr('Chọn mua ảnh này')}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
