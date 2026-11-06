import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Camera,
  CheckCircle,
  Copy,
  Check,
  Mail,
  Phone,
  MapPin,
  Eye,
  Sparkles,
  Info,
  Sliders,
  DollarSign,
  User,
  Image as ImageIcon,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Artwork, Orientation } from '../types';

interface SubmitArtworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPreviewOnWall?: (artwork: Artwork) => void;
}

export const SubmitArtworkModal: React.FC<SubmitArtworkModalProps> = ({
  isOpen,
  onClose,
  onPreviewOnWall,
}) => {
  const { language, t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string>('');
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);

  const [titleVi, setTitleVi] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [collection, setCollection] = useState<'imperial-echoes' | 'perfume-river' | 'living-traditions' | 'poetic-monochrome'>('imperial-echoes');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [locationName, setLocationName] = useState('Đại Nội Huế, Thừa Thiên Huế');
  const [coordinates, setCoordinates] = useState('16.4698° N, 107.5794° E');
  const [story, setStory] = useState('');
  const [historicalNote, setHistoricalNote] = useState('');

  // Camera & EXIF
  const [cameraBody, setCameraBody] = useState('Sony A7R V');
  const [lens, setLens] = useState('FE 24-70mm f/2.8 GM II');
  const [exposureSettings, setExposureSettings] = useState('35mm • f/8.0 • 1/250s • ISO 100');
  const [orientation, setOrientation] = useState<Orientation>('landscape');
  const [mood, setMood] = useState<'imperial' | 'misty' | 'serene' | 'vibrant' | 'nocturnal'>('imperial');

  // Editions & Price
  const [basePriceVND, setBasePriceVND] = useState('4500000');
  const [editionTotal, setEditionTotal] = useState('30');

  // Photographer Contact Info
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [authorPhone, setAuthorPhone] = useState('');
  const [authorSocial, setAuthorSocial] = useState('');

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submissionRef, setSubmissionRef] = useState('');
  const [copiedDossier, setCopiedDossier] = useState(false);

  if (!isOpen) return null;

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    processImageFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    processImageFile(file);
  };

  const processImageFile = (file: File) => {
    setImageFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setImagePreview(dataUrl);

      // Measure dimensions
      const img = new Image();
      img.onload = () => {
        setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
        if (img.naturalWidth > img.naturalHeight * 1.3) {
          setOrientation('landscape');
        } else if (img.naturalHeight > img.naturalWidth * 1.1) {
          setOrientation('portrait');
        } else if (img.naturalWidth > img.naturalHeight * 2) {
          setOrientation('panoramic');
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!imagePreview) {
      alert(language === 'vi' ? 'Vui lòng chọn hoặc tải lên một hình ảnh tác phẩm!' : 'Please select or upload an artwork image!');
      return;
    }

    if (!titleVi || !authorName || !authorEmail) {
      alert(language === 'vi' ? 'Vui lòng điền đầy đủ tên tác phẩm, họ tên và email của bạn!' : 'Please fill in required fields (title, author name, and email)!');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const ref = `HUE-SUBMIT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      setSubmissionRef(ref);
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1200);
  };

  const generatedArtwork: Artwork = {
    id: submissionRef || 'sub-preview',
    title: titleEn || titleVi,
    vietnameseTitle: titleVi,
    titles: {
      vi: titleVi,
      en: titleEn || titleVi,
      fr: titleEn || titleVi,
    },
    stories: {
      vi: story || 'Tác phẩm nhiếp ảnh mỹ thuật ghi lại khoảnh khắc di sản xứ Huế.',
      en: story || 'Fine-art photograph capturing the timeless heritage of Hue.',
      fr: story || 'Photographie d\'art capturant l\'héritage intemporel de Hué.',
    },
    historicalNotes: {
      vi: historicalNote || 'Ghi chép di sản văn hóa Thừa Thiên Huế.',
      en: historicalNote || 'Cultural heritage documentation of Hue.',
      fr: historicalNote || 'Documentation patrimoniale et culturelle de Hué.',
    },
    locations: {
      vi: locationName,
      en: locationName,
      fr: locationName,
    },
    collection,
    year: parseInt(year, 10) || new Date().getFullYear(),
    orientation,
    aspectRatio: orientation === 'portrait' ? '3:4' : orientation === 'panoramic' ? '16:9' : '4:3',
    location: locationName,
    story,
    historicalNote,
    editionTotal: parseInt(editionTotal, 10) || 30,
    editionsRemaining: parseInt(editionTotal, 10) || 30,
    camera: {
      camera: cameraBody,
      lens,
      settings: exposureSettings,
      locationName,
      coordinates,
      capturedAt: year,
    },
    imageUrl: imagePreview || '',
    highResUrl: imagePreview || '',
    basePriceUSD: Math.round((parseInt(basePriceVND, 10) || 4500000) / 25400),
    mood,
    palette: ['#dfb871', '#3b2f2f', '#7d8695', '#0f1117'],
  };

  const getDossierSummaryText = () => {
    return `========================================
HỒ SƠ GỬI ẢNH TÁC PHẨM NHIẾP ẢNH CỐ ĐÔ HUẾ
Hội Nhiếp Ảnh Huế — Tiếp nhận: vinhhuong119@gmail.com
Mã hồ sơ: ${submissionRef}
========================================

[1. THÔNG TIN TÁC PHẨM]
• Tên tiếng Việt: ${titleVi}
• Tên tiếng Anh: ${titleEn || '(Chưa điền)'}
• Bộ sưu tập: ${collection}
• Năm sáng tác: ${year}
• Địa danh: ${locationName}
• Tọa độ GPS: ${coordinates}
• Bố cục: ${orientation}
• Sắc thái mỹ thuật: ${mood}
• Giá bản in đề xuất: ${parseInt(basePriceVND || '0').toLocaleString('vi-VN')} VND (~$${Math.round((parseInt(basePriceVND, 10) || 4500000) / 25400)} USD)
• Giới hạn ấn bản: ${editionTotal} bản

[2. CÂU CHUYỆN & DI SẢN]
• Cảm hứng sáng tác: ${story || '(Chưa ghi)'}
• Ghi chú di sản/lịch sử: ${historicalNote || '(Chưa ghi)'}

[3. THÔNG SỐ KỸ THUẬT EXIF]
• Máy ảnh: ${cameraBody}
• Ống kính: ${lens}
• Phơi sáng: ${exposureSettings}
• File ảnh: ${imageFileName} ${imageDimensions ? `(${imageDimensions.width}x${imageDimensions.height}px)` : ''}

[4. THÔNG TIN TÁC GIẢ]
• Họ và tên: ${authorName}
• Email: ${authorEmail}
• Điện thoại / Zalo: ${authorPhone}
• Liên kết Portfolio/MXH: ${authorSocial || '(Không có)'}

Gửi tới quản trị viên: vinhhuong119@gmail.com
Hotline: +(84)778480911
Trụ sở: 273 Điện Biên Phủ, Thành Phố Huế
========================================`;
  };

  const handleCopyDossier = () => {
    try {
      navigator.clipboard.writeText(getDossierSummaryText());
      setCopiedDossier(true);
      setTimeout(() => setCopiedDossier(false), 2500);
    } catch {
      // ignore
    }
  };

  const getMailtoUrl = () => {
    const subject = encodeURIComponent(`[Gửi Ảnh Nghệ Thuật Huế] Tác phẩm: ${titleVi} - Tác giả: ${authorName} (${submissionRef})`);
    const body = encodeURIComponent(getDossierSummaryText() + '\n\n*Lưu ý: Tác giả vui lòng đính kèm file ảnh gốc độ phân giải cao vào email này để Admin kiểm tra chất lượng in ấn.*');
    return `mailto:vinhhuong119@gmail.com?subject=${subject}&body=${body}`;
  };

  const handleResetForm = () => {
    setIsSuccess(false);
    setImagePreview(null);
    setImageFileName('');
    setImageDimensions(null);
    setTitleVi('');
    setTitleEn('');
    setStory('');
    setHistoricalNote('');
    setSubmissionRef('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#07080c]/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#111319] border border-[#272c3a] rounded-sm shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-[#e2e8f0]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#141822] border-b border-[#222633] shrink-0">
          <div className="flex items-center gap-2.5">
            <Camera className="w-5 h-5 text-[#dfb871]" />
            <div>
              <h3 className="font-serif text-lg text-[#f5f0e6]">
                {t.submitModal.modalTitle}
              </h3>
              <p className="text-[11px] font-mono text-[#8e96a4]">
                Hội Nhiếp Ảnh Huế • Tiếp nhận: <span className="text-[#dfb871]">vinhhuong119@gmail.com</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#8e96a4] hover:text-white rounded-full hover:bg-[#1f232e] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-7">
              {/* Intro Banner */}
              <div className="p-3.5 bg-[#171b26] border border-[#2b3345] rounded-xs text-xs text-[#a2abb9] flex items-start gap-3">
                <Info className="w-4 h-4 text-[#dfb871] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#f5f0e6] font-medium block mb-0.5">
                    {t.submitModal.modalSubtitle}
                  </span>
                  <span className="text-[11px] text-[#7d8695]">
                    {t.submitModal.requiredFieldsNote}
                  </span>
                </div>
              </div>

              {/* IMAGE DROPZONE / PREVIEW SECTION */}
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-[#dfb871] block">
                  {language === 'vi' ? 'Ảnh Tác Phẩm Độ Phân Giải Cao (*)' : 'High-Resolution Artwork Image (*)'}
                </label>

                {!imagePreview ? (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#343b4e] hover:border-[#dfb871] bg-[#12151e] p-8 text-center rounded-xs cursor-pointer transition-all hover:bg-[#151924] group"
                  >
                    <div className="w-14 h-14 rounded-full bg-[#1b202c] group-hover:bg-[#dfb871]/20 border border-[#2a3142] group-hover:border-[#dfb871]/50 flex items-center justify-center mx-auto mb-3 transition-colors text-[#dfb871]">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium text-[#f5f0e6] mb-1">
                      {t.submitModal.dropzoneTitle}
                    </p>
                    <p className="text-xs text-[#7d8695]">
                      {t.submitModal.dropzoneSubtitle}
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="p-4 bg-[#141822] border border-[#293144] rounded-xs flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative w-full sm:w-48 h-36 bg-black rounded-xs overflow-hidden border border-[#3b435a] flex items-center justify-center shrink-0">
                      <img
                        src={imagePreview}
                        alt="Uploaded preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-1.5 flex-1 text-xs">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-[#dfb871]" />
                        <span className="font-mono text-sm text-[#f5f0e6] truncate font-semibold">
                          {imageFileName || 'artwork.jpg'}
                        </span>
                      </div>
                      {imageDimensions && (
                        <p className="text-[#8e96a4] font-mono text-[11px]">
                          Kích thước: {imageDimensions.width} x {imageDimensions.height} px • Bố cục gợi ý: {orientation}
                        </p>
                      )}
                      <p className="text-[11px] text-[#9de0ad] flex items-center gap-1 font-mono">
                        <Check className="w-3.5 h-3.5" /> Ảnh đã sẵn sàng gửi tới admin
                      </p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs text-[#dfb871] hover:underline cursor-pointer pt-1 block"
                      >
                        {t.submitModal.changeImage}
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 1. ARTWORK DETAILS */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 pb-2 border-b border-[#242b3b]">
                  <Sparkles className="w-4 h-4 text-[#dfb871]" />
                  <h4 className="text-xs font-mono uppercase tracking-widest text-[#f5f0e6]">
                    {t.submitModal.artworkDetailsTitle}
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-[11px] text-[#8e96a4] uppercase font-mono block mb-1">
                      {t.submitModal.titleViLabel} (*)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Hoàng Thành Trong Sương Khói"
                      value={titleVi}
                      onChange={(e) => setTitleVi(e.target.value)}
                      className="w-full bg-[#151822] border border-[#2a3142] rounded-xs px-3 py-2 text-[#f5f0e6] focus:border-[#dfb871] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-[#8e96a4] uppercase font-mono block mb-1">
                      {t.submitModal.titleEnLabel}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Imperial Citadel in the Mist"
                      value={titleEn}
                      onChange={(e) => setTitleEn(e.target.value)}
                      className="w-full bg-[#151822] border border-[#2a3142] rounded-xs px-3 py-2 text-[#f5f0e6] focus:border-[#dfb871] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-[#8e96a4] uppercase font-mono block mb-1">
                      {t.submitModal.collectionLabel}
                    </label>
                    <select
                      value={collection}
                      onChange={(e) => setCollection(e.target.value as any)}
                      className="w-full bg-[#151822] border border-[#2a3142] rounded-xs px-3 py-2 text-[#f5f0e6] focus:border-[#dfb871] focus:outline-none"
                    >
                      <option value="imperial-echoes">{t.filter.imperialEchoes} (Đại Nội & Lăng Tẩm)</option>
                      <option value="perfume-river">{t.filter.perfumeRiver} (Sông Hương & Đầm Chuồn)</option>
                      <option value="living-traditions">{t.filter.livingTraditions} (Làng Nghề & Nét Đẹp Huế)</option>
                      <option value="poetic-monochrome">{t.filter.poeticMonochrome} (Trắng Đen Hoài Niệm)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-[#8e96a4] uppercase font-mono block mb-1">
                      {t.submitModal.yearLabel}
                    </label>
                    <input
                      type="number"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full bg-[#151822] border border-[#2a3142] rounded-xs px-3 py-2 text-[#f5f0e6] focus:border-[#dfb871] focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-[#8e96a4] uppercase font-mono block mb-1">
                      {t.submitModal.locationLabel} (*)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Cổng Ngọ Môn, Đại Nội Huế"
                      value={locationName}
                      onChange={(e) => setLocationName(e.target.value)}
                      className="w-full bg-[#151822] border border-[#2a3142] rounded-xs px-3 py-2 text-[#f5f0e6] focus:border-[#dfb871] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-[#8e96a4] uppercase font-mono block mb-1">
                      {t.submitModal.coordinatesLabel}
                    </label>
                    <input
                      type="text"
                      placeholder="16.4698° N, 107.5794° E"
                      value={coordinates}
                      onChange={(e) => setCoordinates(e.target.value)}
                      className="w-full bg-[#151822] border border-[#2a3142] rounded-xs px-3 py-2 text-[#f5f0e6] focus:border-[#dfb871] focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-[11px] text-[#8e96a4] uppercase font-mono block mb-1">
                      {t.submitModal.storyLabel}
                    </label>
                    <textarea
                      rows={3}
                      placeholder={t.submitModal.storyPlaceholder}
                      value={story}
                      onChange={(e) => setStory(e.target.value)}
                      className="w-full bg-[#151822] border border-[#2a3142] rounded-xs px-3 py-2 text-[#f5f0e6] focus:border-[#dfb871] focus:outline-none resize-none leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-[#8e96a4] uppercase font-mono block mb-1">
                      {t.submitModal.historyLabel}
                    </label>
                    <textarea
                      rows={2}
                      placeholder={t.submitModal.historyPlaceholder}
                      value={historicalNote}
                      onChange={(e) => setHistoricalNote(e.target.value)}
                      className="w-full bg-[#151822] border border-[#2a3142] rounded-xs px-3 py-2 text-[#f5f0e6] focus:border-[#dfb871] focus:outline-none resize-none leading-relaxed"
                    />
                  </div>
                </div>
              </div>

              {/* 2. CAMERA EXIF & TECHNICAL DETAILS */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 pb-2 border-b border-[#242b3b]">
                  <Sliders className="w-4 h-4 text-[#dfb871]" />
                  <h4 className="text-xs font-mono uppercase tracking-widest text-[#f5f0e6]">
                    {t.submitModal.cameraSectionTitle}
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="text-[11px] text-[#8e96a4] uppercase font-mono block mb-1">
                      {t.submitModal.cameraBodyLabel}
                    </label>
                    <input
                      type="text"
                      placeholder="Sony A7R V / Leica M11 / Canon R5..."
                      value={cameraBody}
                      onChange={(e) => setCameraBody(e.target.value)}
                      className="w-full bg-[#151822] border border-[#2a3142] rounded-xs px-3 py-2 text-[#f5f0e6] focus:border-[#dfb871] focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-[#8e96a4] uppercase font-mono block mb-1">
                      {t.submitModal.lensLabel}
                    </label>
                    <input
                      type="text"
                      placeholder="FE 24-70mm f/2.8 GM II..."
                      value={lens}
                      onChange={(e) => setLens(e.target.value)}
                      className="w-full bg-[#151822] border border-[#2a3142] rounded-xs px-3 py-2 text-[#f5f0e6] focus:border-[#dfb871] focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-[#8e96a4] uppercase font-mono block mb-1">
                      {t.submitModal.exposureSettingsLabel}
                    </label>
                    <input
                      type="text"
                      placeholder="35mm • f/8.0 • 1/250s • ISO 100"
                      value={exposureSettings}
                      onChange={(e) => setExposureSettings(e.target.value)}
                      className="w-full bg-[#151822] border border-[#2a3142] rounded-xs px-3 py-2 text-[#f5f0e6] focus:border-[#dfb871] focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-[#8e96a4] uppercase font-mono block mb-1">
                      {t.submitModal.orientationLabel}
                    </label>
                    <select
                      value={orientation}
                      onChange={(e) => setOrientation(e.target.value as Orientation)}
                      className="w-full bg-[#151822] border border-[#2a3142] rounded-xs px-3 py-2 text-[#f5f0e6] focus:border-[#dfb871] focus:outline-none"
                    >
                      <option value="landscape">{t.filter.landscape} (Khổ Ngang)</option>
                      <option value="portrait">{t.filter.portrait} (Khổ Dọc)</option>
                      <option value="panoramic">{t.filter.panoramic} (Toàn Cảnh)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] text-[#8e96a4] uppercase font-mono block mb-1">
                      {t.submitModal.moodLabel}
                    </label>
                    <select
                      value={mood}
                      onChange={(e) => setMood(e.target.value as any)}
                      className="w-full bg-[#151822] border border-[#2a3142] rounded-xs px-3 py-2 text-[#f5f0e6] focus:border-[#dfb871] focus:outline-none"
                    >
                      <option value="imperial">{t.filter.imperialGold} (Hoàng Gia Cổ Kính)</option>
                      <option value="misty">{t.filter.etherealMist} (Sương Khói Mơ Màng)</option>
                      <option value="serene">{t.filter.meditative} (Thiền Tịnh Sâu Lắng)</option>
                      <option value="vibrant">{t.filter.vibrantSun} (Rực Rỡ Hương Trầm)</option>
                      <option value="nocturnal">{t.filter.nocturne} (Đêm Huyền Diệu)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 3. PROPOSED EDITION & PRICING */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 pb-2 border-b border-[#242b3b]">
                  <DollarSign className="w-4 h-4 text-[#dfb871]" />
                  <h4 className="text-xs font-mono uppercase tracking-widest text-[#f5f0e6]">
                    {t.submitModal.pricingSectionTitle}
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-[11px] text-[#8e96a4] uppercase font-mono block mb-1">
                      {t.submitModal.basePriceLabel}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="50000"
                        value={basePriceVND}
                        onChange={(e) => setBasePriceVND(e.target.value)}
                        className="w-full bg-[#151822] border border-[#2a3142] rounded-xs px-3 py-2 text-[#dfb871] font-mono font-bold focus:border-[#dfb871] focus:outline-none"
                      />
                      <span className="absolute right-3 top-2 text-[#8e96a4] text-xs font-mono">
                        ~${Math.round((parseInt(basePriceVND, 10) || 0) / 25400)} USD
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-[#8e96a4] uppercase font-mono block mb-1">
                      {t.submitModal.editionLimitLabel}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={editionTotal}
                      onChange={(e) => setEditionTotal(e.target.value)}
                      className="w-full bg-[#151822] border border-[#2a3142] rounded-xs px-3 py-2 text-[#f5f0e6] focus:border-[#dfb871] focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* 4. PHOTOGRAPHER CONTACT INFO */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 pb-2 border-b border-[#242b3b]">
                  <User className="w-4 h-4 text-[#dfb871]" />
                  <h4 className="text-xs font-mono uppercase tracking-widest text-[#f5f0e6]">
                    {t.submitModal.authorSectionTitle}
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-[11px] text-[#8e96a4] uppercase font-mono block mb-1">
                      {t.submitModal.authorNameLabel} (*)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Nguyễn Văn Hưng"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      className="w-full bg-[#151822] border border-[#2a3142] rounded-xs px-3 py-2 text-[#f5f0e6] focus:border-[#dfb871] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-[#8e96a4] uppercase font-mono block mb-1">
                      {t.submitModal.authorEmailLabel} (*)
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="email@example.com"
                      value={authorEmail}
                      onChange={(e) => setAuthorEmail(e.target.value)}
                      className="w-full bg-[#151822] border border-[#2a3142] rounded-xs px-3 py-2 text-[#f5f0e6] focus:border-[#dfb871] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-[#8e96a4] uppercase font-mono block mb-1">
                      {t.submitModal.authorPhoneLabel}
                    </label>
                    <input
                      type="tel"
                      placeholder="+(84) 905 123 456"
                      value={authorPhone}
                      onChange={(e) => setAuthorPhone(e.target.value)}
                      className="w-full bg-[#151822] border border-[#2a3142] rounded-xs px-3 py-2 text-[#f5f0e6] focus:border-[#dfb871] focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-[#8e96a4] uppercase font-mono block mb-1">
                      {t.submitModal.authorSocialLabel}
                    </label>
                    <input
                      type="text"
                      placeholder="https://facebook.com/... hoặc @instagram"
                      value={authorSocial}
                      onChange={(e) => setAuthorSocial(e.target.value)}
                      className="w-full bg-[#151822] border border-[#2a3142] rounded-xs px-3 py-2 text-[#f5f0e6] focus:border-[#dfb871] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-[#222736] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-[11px] text-[#717b8c] font-mono">
                  Gửi tới: <span className="text-[#dfb871]">vinhhuong119@gmail.com</span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full sm:w-auto px-5 py-2.5 bg-[#171b24] hover:bg-[#202532] text-[#8e96a4] hover:text-white text-xs uppercase tracking-wider rounded-xs cursor-pointer border border-[#2b3142]"
                  >
                    {t.submitModal.closeBtn}
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-6 py-2.5 bg-[#dfb871] hover:bg-[#c5a059] disabled:opacity-50 text-[#0b0c0e] font-bold text-xs uppercase tracking-wider rounded-xs cursor-pointer shadow-lg flex items-center justify-center gap-2 transition-all"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{isSubmitting ? t.submitModal.submitting : t.submitModal.submitButton}</span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* SUCCESS STATE */
            <div className="py-6 text-center space-y-6 animate-in fade-in duration-200">
              <div className="w-16 h-16 rounded-full bg-[#dfb871]/10 border-2 border-[#dfb871] flex items-center justify-center mx-auto text-[#dfb871]">
                <CheckCircle className="w-8 h-8" />
              </div>

              <div className="space-y-2 max-w-lg mx-auto">
                <span className="text-xs uppercase font-mono tracking-widest text-[#dfb871] block">
                  {t.submitModal.submissionRef} <strong className="text-white">{submissionRef}</strong>
                </span>
                <h3 className="text-2xl font-serif text-[#f5f0e6]">
                  {t.submitModal.successTitle}
                </h3>
                <p className="text-xs text-[#9aa2b1] leading-relaxed">
                  {t.submitModal.successDesc}
                </p>
              </div>

              {/* Admin Contact Box */}
              <div className="p-4 bg-[#141822] border border-[#283042] rounded-xs max-w-md mx-auto text-left space-y-2 text-xs font-mono">
                <div className="text-[10px] uppercase tracking-wider text-[#dfb871] font-bold">
                  Thông Tin Ban Quản Trị Nhận Hồ Sơ:
                </div>
                <div className="flex items-center gap-2 text-[#f5f0e6]">
                  <Mail className="w-3.5 h-3.5 text-[#dfb871]" />
                  <span>Email: <strong>vinhhuong119@gmail.com</strong></span>
                </div>
                <div className="flex items-center gap-2 text-[#f5f0e6]">
                  <Phone className="w-3.5 h-3.5 text-[#dfb871]" />
                  <span>Hotline / Zalo: <strong>+(84)778480911</strong></span>
                </div>
                <div className="flex items-center gap-2 text-[#a2abb9]">
                  <MapPin className="w-3.5 h-3.5 text-[#dfb871]" />
                  <span>Hội Nhiếp Ảnh Huế • 273 Điện Biên Phủ, TP. Huế</span>
                </div>
              </div>

              {/* Actions: Mailto, Copy dossier, Preview on room wall */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <a
                  href={getMailtoUrl()}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#dfb871] hover:bg-[#c5a059] text-[#0b0c0e] font-bold text-xs uppercase font-mono rounded-xs flex items-center justify-center gap-2 shadow-md"
                >
                  <Mail className="w-4 h-4" />
                  <span>Gửi Thư Kèm File Ảnh Gốc</span>
                </a>

                <button
                  onClick={handleCopyDossier}
                  className="w-full sm:w-auto px-4 py-2.5 bg-[#1b202c] hover:bg-[#252c3c] text-[#f5f0e6] text-xs font-mono uppercase rounded-xs flex items-center justify-center gap-2 border border-[#374157] cursor-pointer"
                >
                  {copiedDossier ? <Check className="w-4 h-4 text-[#9de0ad]" /> : <Copy className="w-4 h-4 text-[#dfb871]" />}
                  <span>{copiedDossier ? 'Đã Sao Chép Hồ Sơ!' : 'Sao Chép Hồ Sơ Để Nhắn Zalo'}</span>
                </button>

                {onPreviewOnWall && imagePreview && (
                  <button
                    onClick={() => {
                      onClose();
                      onPreviewOnWall(generatedArtwork);
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 bg-[#252b39] hover:bg-[#30384a] text-[#dfb871] text-xs font-mono uppercase rounded-xs flex items-center justify-center gap-2 border border-[#dfb871]/40 cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    <span>{t.submitModal.previewOnWall}</span>
                  </button>
                )}
              </div>

              <div className="pt-4 border-t border-[#202533] flex justify-center gap-4 text-xs">
                <button
                  onClick={handleResetForm}
                  className="text-[#8e96a4] hover:text-[#dfb871] cursor-pointer"
                >
                  Nộp thêm tác phẩm khác
                </button>
                <span className="text-[#3a4253]">•</span>
                <button
                  onClick={onClose}
                  className="text-[#8e96a4] hover:text-white cursor-pointer"
                >
                  {t.submitModal.closeBtn}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
