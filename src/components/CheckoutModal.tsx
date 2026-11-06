import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import confetti from 'canvas-confetti';
import {
  X,
  CheckCircle,
  Truck,
  CreditCard,
  Lock,
  Download,
  Building2,
  Smartphone,
  Copy,
  Check,
  QrCode,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewCertificateForOrder: (orderNumber: string, collectorName: string) => void;
}

type PaymentMethod = 'bank_transfer' | 'momo' | 'zalopay' | 'card';

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onViewCertificateForOrder,
}) => {
  const { cart, subtotalUSD, formatPrice, clearCart, currency } = useCart();
  const { language, t } = useLanguage();

  const [step, setStep] = useState<'details' | 'success'>('details');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer');

  const [formData, setFormData] = useState({
    fullName: language === 'vi' ? 'Nguyễn Hoàng Minh' : 'Lord & Lady Collector',
    email: 'collector@hueartprints.com',
    country: language === 'vi' ? 'Việt Nam' : 'United States',
    street: language === 'vi' ? '68 Lê Lợi, Phường Phú Nhuận' : '742 Evergreen Terrace',
    city: language === 'vi' ? 'Huế' : 'San Francisco',
    postalCode: language === 'vi' ? '53000' : '94102',
    notes: '',
    giftBox: true,
  });

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  if (!isOpen) return null;

  const isFreeShipping = subtotalUSD >= 200;
  const shippingFee = isFreeShipping ? 0 : 35;
  const totalAmountUSD = subtotalUSD + shippingFee;
  const totalAmountVND = Math.round(totalAmountUSD * 25400 / 1000) * 1000;

  // Temporary mock transfer reference code
  const tempOrderRef = `HUE${Math.floor(100000 + Math.random() * 900000)}`;

  const bankInfo = {
    bankName: 'Vietcombank (VCB) — Chi nhánh Thừa Thiên Huế',
    accountNumber: '0161000042240',
    accountName: 'VINH HUONG',
    amountVND: totalAmountVND.toLocaleString('vi-VN') + ' ₫',
    content: `${tempOrderRef} ${formData.fullName.replace(/\s+/g, '').slice(0, 10).toUpperCase()}`,
  };

  const momoInfo = {
    phone: '0778480911',
    accountName: 'VINH HUONG',
    amount: formatPrice(totalAmountUSD),
    content: tempOrderRef,
  };

  const zalopayInfo = {
    partnerCode: 'ZALOPAY-0778480911',
    accountName: 'VINH HUONG',
    amount: formatPrice(totalAmountUSD),
    content: tempOrderRef,
  };

  const handleCopy = (text: string, fieldId: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // ignore
    }
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      const generatedOrder = tempOrderRef;
      setOrderNumber(generatedOrder);
      setIsProcessing(false);
      setStep('success');

      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#dfb871', '#c5a059', '#e8ded0', '#a50064', '#0068ff'],
        });
      } catch {
        // Safe fallback
      }

      clearCart();
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#07080b]/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#111319] border border-[#272c3a] rounded-sm shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#141822] border-b border-[#222633]">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#dfb871]" />
            <h3 className="font-serif text-lg text-[#f5f0e6]">
              {step === 'details' ? t.checkout.title : t.checkout.confirmedTitle}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#8e96a4] hover:text-white rounded-full hover:bg-[#1f232e] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {step === 'details' ? (
            <form onSubmit={handleSubmitOrder} className="space-y-6">
              {/* Summary of Prints in acquisition */}
              <div className="p-4 bg-[#151821] border border-[#232734] rounded-xs space-y-3">
                <span className="text-xs uppercase font-mono tracking-wider text-[#8a919f] block">
                  {t.checkout.editionsInAcquisition} ({cart.length})
                </span>

                <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                  {cart.map((item) => {
                    const itemTitle = item.artwork.titles?.[language] || item.artwork.title;
                    return (
                      <div key={item.id} className="flex justify-between text-xs text-[#c5cbd6]">
                        <span className="truncate pr-4">
                          {item.quantity}× {itemTitle} ({item.size.names[language]}, {item.frame.names[language]})
                        </span>
                        <span className="font-mono shrink-0 text-[#f5f0e6]">
                          {formatPrice(item.unitPriceUSD * item.quantity)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-[#232734] pt-2 flex justify-between text-xs font-serif font-semibold text-[#f5f0e6]">
                  <span>{t.checkout.totalAmount}</span>
                  <div className="text-right">
                    <span className="text-[#dfb871] text-base font-bold">{formatPrice(totalAmountUSD)}</span>
                    {currency !== 'VND' && (
                      <span className="text-[11px] font-mono text-[#8a92a0] block">
                        ≈ {bankInfo.amountVND}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Collector Delivery Details */}
              <div className="space-y-4">
                <span className="text-xs uppercase font-mono tracking-wider text-[#8a919f] block">
                  {t.checkout.detailsHeader}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-[#717888] block mb-1">
                      {t.checkout.fullNameLabel}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full bg-[#151821] border border-[#282d3b] rounded-xs px-3 py-2 text-xs text-[#f5f0e6] focus:outline-none focus:border-[#dfb871]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-[#717888] block mb-1">
                      {t.checkout.emailLabel}
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-[#151821] border border-[#282d3b] rounded-xs px-3 py-2 text-xs text-[#f5f0e6] focus:outline-none focus:border-[#dfb871]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-[11px] text-[#717888] block mb-1">{t.checkout.streetLabel}</label>
                    <input
                      type="text"
                      required
                      value={formData.street}
                      onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                      className="w-full bg-[#151821] border border-[#282d3b] rounded-xs px-3 py-2 text-xs text-[#f5f0e6] focus:outline-none focus:border-[#dfb871]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-[#717888] block mb-1">{t.checkout.countryLabel}</label>
                    <input
                      type="text"
                      required
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full bg-[#151821] border border-[#282d3b] rounded-xs px-3 py-2 text-xs text-[#f5f0e6] focus:outline-none focus:border-[#dfb871]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="giftbox"
                    checked={formData.giftBox}
                    onChange={(e) => setFormData({ ...formData, giftBox: e.target.checked })}
                    className="accent-[#dfb871] cursor-pointer"
                  />
                  <label htmlFor="giftbox" className="text-xs text-[#b8c0cf] cursor-pointer">
                    {t.checkout.giftBoxOption}
                  </label>
                </div>
              </div>

              {/* PAYMENT METHOD SELECTOR: MOMO, ZALOPAY, CHUYỂN KHOẢN NGÂN HÀNG, THẺ QUỐC TẾ */}
              <div className="space-y-4 pt-3 border-t border-[#232734]">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-mono tracking-wider text-[#dfb871] font-bold">
                    {t.checkout.paymentMethodLabel}
                  </span>
                  <span className="text-[10px] text-[#9de0ad] font-mono flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>VietQR & Napas 24/7 Verified</span>
                  </span>
                </div>

                {/* 4 Interactive Payment Tabs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {/* Option 1: Chuyển khoản ngân hàng (VietQR) */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bank_transfer')}
                    className={`p-3 text-left border rounded-xs transition-all cursor-pointer flex flex-col justify-between ${
                      paymentMethod === 'bank_transfer'
                        ? 'bg-[#1b2230] border-[#dfb871] text-white shadow-md ring-1 ring-[#dfb871]/40'
                        : 'bg-[#141720] border-[#252936] text-[#8e96a4] hover:border-[#384155]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Building2 className={`w-4 h-4 ${paymentMethod === 'bank_transfer' ? 'text-[#dfb871]' : 'text-[#8e96a4]'}`} />
                      <span className="text-[11px] font-bold text-[#f5f0e6]">VietQR / Banking</span>
                    </div>
                    <span className="text-[10px] text-[#8a919f] leading-tight">
                      {language === 'vi' ? 'Chuyển khoản 24/7' : 'Bank Transfer'}
                    </span>
                  </button>

                  {/* Option 2: Ví MoMo */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('momo')}
                    className={`p-3 text-left border rounded-xs transition-all cursor-pointer flex flex-col justify-between ${
                      paymentMethod === 'momo'
                        ? 'bg-[#261320] border-[#d82d8b] text-white shadow-md ring-1 ring-[#d82d8b]/40'
                        : 'bg-[#141720] border-[#252936] text-[#8e96a4] hover:border-[#384155]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className="w-4 h-4 rounded-xs bg-[#a50064] text-white text-[8px] font-bold flex items-center justify-center font-mono">
                        M
                      </div>
                      <span className="text-[11px] font-bold text-[#f5f0e6]">Ví MoMo</span>
                    </div>
                    <span className="text-[10px] text-[#d82d8b] font-medium leading-tight">
                      {language === 'vi' ? 'Quét MoMo QR' : 'MoMo E-Wallet'}
                    </span>
                  </button>

                  {/* Option 3: Ví ZaloPay */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('zalopay')}
                    className={`p-3 text-left border rounded-xs transition-all cursor-pointer flex flex-col justify-between ${
                      paymentMethod === 'zalopay'
                        ? 'bg-[#0f1d2e] border-[#0068ff] text-white shadow-md ring-1 ring-[#0068ff]/40'
                        : 'bg-[#141720] border-[#252936] text-[#8e96a4] hover:border-[#384155]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className="w-4 h-4 rounded-xs bg-[#0068ff] text-white text-[8px] font-bold flex items-center justify-center font-mono">
                        Z
                      </div>
                      <span className="text-[11px] font-bold text-[#f5f0e6]">ZaloPay</span>
                    </div>
                    <span className="text-[10px] text-[#3b8eff] font-medium leading-tight">
                      {language === 'vi' ? 'Ví ZaloPay / Zalo' : 'ZaloPay E-Wallet'}
                    </span>
                  </button>

                  {/* Option 4: Thẻ Quốc Tế Visa/Mastercard */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 text-left border rounded-xs transition-all cursor-pointer flex flex-col justify-between ${
                      paymentMethod === 'card'
                        ? 'bg-[#1e222d] border-[#dfb871] text-white shadow-md ring-1 ring-[#dfb871]/40'
                        : 'bg-[#141720] border-[#252936] text-[#8e96a4] hover:border-[#384155]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <CreditCard className={`w-4 h-4 ${paymentMethod === 'card' ? 'text-[#dfb871]' : 'text-[#8e96a4]'}`} />
                      <span className="text-[11px] font-bold text-[#f5f0e6]">Visa / Master</span>
                    </div>
                    <span className="text-[10px] text-[#8a919f] leading-tight">
                      {language === 'vi' ? 'Thẻ quốc tế' : 'Credit Card'}
                    </span>
                  </button>
                </div>

                {/* PAYMENT METHOD DETAILS PANELS */}

                {/* 1. BANK TRANSFER (VIETQR) PANEL */}
                {paymentMethod === 'bank_transfer' && (
                  <div className="p-4 sm:p-5 bg-[#141822] border border-[#2b3345] rounded-xs space-y-4 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between pb-3 border-b border-[#252c3c]">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-[#dfb871]" />
                        <div>
                          <div className="text-xs font-bold text-[#f5f0e6]">{t.checkout.bankTransfer}</div>
                          <div className="text-[10px] text-[#8a92a0]">{t.checkout.bankTransferSub}</div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 bg-[#dfb871]/15 text-[#dfb871] text-[10px] font-mono rounded-xs border border-[#dfb871]/30">
                        VietQR 24/7
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                      {/* Left: Dynamic QR Code Box */}
                      <div className="sm:col-span-5 flex flex-col items-center justify-center p-3 bg-white rounded-xs shadow-md">
                        {/* Interactive VietQR visual box */}
                        <div className="w-40 h-40 relative flex items-center justify-center bg-white p-1">
                          <img
                            src={`https://api.vietqr.io/image/970436-0161000042240-compact2.jpg?amount=${totalAmountVND}&addInfo=${tempOrderRef}&accountName=VINH%20HUONG`}
                            alt="Mã QR Chuyển Khoản Ngân Hàng VietQR"
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              // If api.vietqr.io is unreachable in environment, fallback to styled QR SVG
                              e.currentTarget.style.display = 'none';
                              const nextSibling = e.currentTarget.nextElementSibling as HTMLElement;
                              if (nextSibling) nextSibling.style.display = 'flex';
                            }}
                          />
                          <div style={{ display: 'none' }} className="w-full h-full flex-col items-center justify-center bg-[#0d0f14] text-[#dfb871] p-3 text-center border-2 border-dashed border-[#dfb871]">
                            <QrCode className="w-12 h-12 mb-1" />
                            <span className="text-[10px] font-mono uppercase font-bold text-white">VietQR 24/7</span>
                            <span className="text-[9px] font-mono text-[#dfb871]">{bankInfo.accountNumber}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-sans text-neutral-800 font-semibold mt-1">
                          {t.checkout.scanToPay}
                        </span>
                      </div>

                      {/* Right: Banking Information with 1-Click Copy */}
                      <div className="sm:col-span-7 space-y-2.5 text-xs font-mono">
                        {/* Ngân hàng */}
                        <div className="bg-[#10131b] p-2.5 rounded-xs border border-[#232938]">
                          <span className="text-[10px] text-[#717888] uppercase block">{t.checkout.bankName}</span>
                          <span className="text-[#f5f0e6] font-semibold text-[11px]">{bankInfo.bankName}</span>
                        </div>

                        {/* Số tài khoản */}
                        <div className="bg-[#10131b] p-2.5 rounded-xs border border-[#232938] flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-[#717888] uppercase block">{t.checkout.accountNumber}</span>
                            <span className="text-[#dfb871] font-bold text-sm tracking-wider">{bankInfo.accountNumber}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy(bankInfo.accountNumber.replace(/\s+/g, ''), 'accNum')}
                            className="px-2.5 py-1 bg-[#1c2230] hover:bg-[#252e42] text-[#f5f0e6] rounded-xs text-[10px] font-sans flex items-center gap-1 border border-[#333e54] cursor-pointer"
                          >
                            {copiedField === 'accNum' ? (
                              <>
                                <Check className="w-3 h-3 text-[#9de0ad]" />
                                <span className="text-[#9de0ad]">{t.checkout.copied}</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-[#dfb871]" />
                                <span>{t.checkout.copy}</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Chủ tài khoản */}
                        <div className="bg-[#10131b] p-2.5 rounded-xs border border-[#232938] flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-[#717888] uppercase block">{t.checkout.accountName}</span>
                            <span className="text-[#f5f0e6] font-semibold text-[11px]">{bankInfo.accountName}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy(bankInfo.accountName, 'accName')}
                            className="px-2.5 py-1 bg-[#1c2230] hover:bg-[#252e42] text-[#f5f0e6] rounded-xs text-[10px] font-sans flex items-center gap-1 border border-[#333e54] cursor-pointer"
                          >
                            {copiedField === 'accName' ? (
                              <>
                                <Check className="w-3 h-3 text-[#9de0ad]" />
                                <span className="text-[#9de0ad]">{t.checkout.copied}</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-[#dfb871]" />
                                <span>{t.checkout.copy}</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Nội dung chuyển khoản */}
                        <div className="bg-[#10131b] p-2.5 rounded-xs border border-[#232938] flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-[#717888] uppercase block">{t.checkout.transferContent}</span>
                            <span className="text-[#f5f0e6] font-bold text-xs">{bankInfo.content}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy(bankInfo.content, 'content')}
                            className="px-2.5 py-1 bg-[#1c2230] hover:bg-[#252e42] text-[#f5f0e6] rounded-xs text-[10px] font-sans flex items-center gap-1 border border-[#333e54] cursor-pointer"
                          >
                            {copiedField === 'content' ? (
                              <>
                                <Check className="w-3 h-3 text-[#9de0ad]" />
                                <span className="text-[#9de0ad]">{t.checkout.copied}</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-[#dfb871]" />
                                <span>{t.checkout.copy}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] text-[#8a92a0] bg-[#0f121a] p-2.5 rounded-xs border border-[#1f2533] flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-[#dfb871] shrink-0 mt-0.5" />
                      <span>{t.checkout.paymentNote}</span>
                    </div>
                  </div>
                )}

                {/* 2. MOMO PANEL */}
                {paymentMethod === 'momo' && (
                  <div className="p-4 sm:p-5 bg-[#1b1219] border border-[#d82d8b]/40 rounded-xs space-y-4 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between pb-3 border-b border-[#35192c]">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-xs bg-[#a50064] text-white text-xs font-bold flex items-center justify-center font-mono">
                          M
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#f5f0e6]">{t.checkout.momo}</div>
                          <div className="text-[10px] text-[#d82d8b] font-medium">{t.checkout.momoSub}</div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 bg-[#a50064]/20 text-[#f581bc] text-[10px] font-mono rounded-xs border border-[#a50064]/40">
                        MoMo Official
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                      {/* Left: MoMo QR code */}
                      <div className="sm:col-span-5 flex flex-col items-center justify-center p-4 bg-white rounded-xs shadow-md">
                        <div className="w-36 h-36 flex flex-col items-center justify-center bg-[#a50064] text-white p-3 rounded-xs text-center shadow-inner">
                          <QrCode className="w-16 h-16 text-white mb-1" />
                          <span className="text-[9px] font-mono tracking-wider font-bold">MOMO ONE-TOUCH</span>
                          <span className="text-[8px] opacity-80">{momoInfo.phone}</span>
                        </div>
                        <span className="text-[10px] font-sans text-neutral-800 font-semibold mt-2">
                          {language === 'vi' ? 'Quét Mã Bằng Ứng Dụng MoMo' : 'Scan With MoMo App'}
                        </span>
                      </div>

                      {/* Right: MoMo phone & account */}
                      <div className="sm:col-span-7 space-y-2.5 text-xs font-mono">
                        <div className="bg-[#120b12] p-2.5 rounded-xs border border-[#301627] flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-[#a57395] uppercase block">
                              {language === 'vi' ? 'Số Điện Thoại Ví MoMo' : 'MoMo Phone'}
                            </span>
                            <span className="text-[#f581bc] font-bold text-sm tracking-wider">{momoInfo.phone}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy(momoInfo.phone.replace(/\s+/g, ''), 'momoPhone')}
                            className="px-2.5 py-1 bg-[#2b1423] hover:bg-[#381a2e] text-[#f5f0e6] rounded-xs text-[10px] font-sans flex items-center gap-1 border border-[#4d1f3e] cursor-pointer"
                          >
                            {copiedField === 'momoPhone' ? (
                              <>
                                <Check className="w-3 h-3 text-[#9de0ad]" />
                                <span className="text-[#9de0ad]">{t.checkout.copied}</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-[#f581bc]" />
                                <span>{t.checkout.copy}</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div className="bg-[#120b12] p-2.5 rounded-xs border border-[#301627]">
                          <span className="text-[10px] text-[#a57395] uppercase block">{t.checkout.accountName}</span>
                          <span className="text-[#f5f0e6] font-semibold text-xs">{momoInfo.accountName}</span>
                        </div>

                        <div className="bg-[#120b12] p-2.5 rounded-xs border border-[#301627] flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-[#a57395] uppercase block">{t.checkout.transferContent}</span>
                            <span className="text-[#f5f0e6] font-bold text-xs">{momoInfo.content}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy(momoInfo.content, 'momoContent')}
                            className="px-2.5 py-1 bg-[#2b1423] hover:bg-[#381a2e] text-[#f5f0e6] rounded-xs text-[10px] font-sans flex items-center gap-1 border border-[#4d1f3e] cursor-pointer"
                          >
                            {copiedField === 'momoContent' ? (
                              <>
                                <Check className="w-3 h-3 text-[#9de0ad]" />
                                <span className="text-[#9de0ad]">{t.checkout.copied}</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-[#f581bc]" />
                                <span>{t.checkout.copy}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. ZALOPAY PANEL */}
                {paymentMethod === 'zalopay' && (
                  <div className="p-4 sm:p-5 bg-[#0c1626] border border-[#0068ff]/40 rounded-xs space-y-4 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between pb-3 border-b border-[#182842]">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-xs bg-[#0068ff] text-white text-xs font-bold flex items-center justify-center font-mono">
                          Z
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#f5f0e6]">{t.checkout.zalopay}</div>
                          <div className="text-[10px] text-[#3b8eff] font-medium">{t.checkout.zalopaySub}</div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 bg-[#0068ff]/20 text-[#60a5fa] text-[10px] font-mono rounded-xs border border-[#0068ff]/40">
                        ZaloPay Merchant
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                      {/* Left: ZaloPay QR code */}
                      <div className="sm:col-span-5 flex flex-col items-center justify-center p-4 bg-white rounded-xs shadow-md">
                        <div className="w-36 h-36 flex flex-col items-center justify-center bg-[#0068ff] text-white p-3 rounded-xs text-center shadow-inner">
                          <QrCode className="w-16 h-16 text-white mb-1" />
                          <span className="text-[9px] font-mono tracking-wider font-bold">ZALOPAY QR</span>
                          <span className="text-[8px] opacity-80">{zalopayInfo.partnerCode}</span>
                        </div>
                        <span className="text-[10px] font-sans text-neutral-800 font-semibold mt-2">
                          {language === 'vi' ? 'Quét Mã Bằng ZaloPay Hoặc Zalo' : 'Scan With ZaloPay Or Zalo'}
                        </span>
                      </div>

                      {/* Right: ZaloPay account info */}
                      <div className="sm:col-span-7 space-y-2.5 text-xs font-mono">
                        <div className="bg-[#09101c] p-2.5 rounded-xs border border-[#1b2a44] flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-[#6b8dbd] uppercase block">
                              {language === 'vi' ? 'Mã Đối Tác ZaloPay' : 'ZaloPay Merchant Code'}
                            </span>
                            <span className="text-[#60a5fa] font-bold text-sm tracking-wider">{zalopayInfo.partnerCode}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy(zalopayInfo.partnerCode, 'zaloCode')}
                            className="px-2.5 py-1 bg-[#14233a] hover:bg-[#1a2f4e] text-[#f5f0e6] rounded-xs text-[10px] font-sans flex items-center gap-1 border border-[#2b446c] cursor-pointer"
                          >
                            {copiedField === 'zaloCode' ? (
                              <>
                                <Check className="w-3 h-3 text-[#9de0ad]" />
                                <span className="text-[#9de0ad]">{t.checkout.copied}</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-[#60a5fa]" />
                                <span>{t.checkout.copy}</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div className="bg-[#09101c] p-2.5 rounded-xs border border-[#1b2a44]">
                          <span className="text-[10px] text-[#6b8dbd] uppercase block">{t.checkout.accountName}</span>
                          <span className="text-[#f5f0e6] font-semibold text-xs">{zalopayInfo.accountName}</span>
                        </div>

                        <div className="bg-[#09101c] p-2.5 rounded-xs border border-[#1b2a44] flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-[#6b8dbd] uppercase block">{t.checkout.transferContent}</span>
                            <span className="text-[#f5f0e6] font-bold text-xs">{zalopayInfo.content}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy(zalopayInfo.content, 'zaloContent')}
                            className="px-2.5 py-1 bg-[#14233a] hover:bg-[#1a2f4e] text-[#f5f0e6] rounded-xs text-[10px] font-sans flex items-center gap-1 border border-[#2b446c] cursor-pointer"
                          >
                            {copiedField === 'zaloContent' ? (
                              <>
                                <Check className="w-3 h-3 text-[#9de0ad]" />
                                <span className="text-[#9de0ad]">{t.checkout.copied}</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-[#60a5fa]" />
                                <span>{t.checkout.copy}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. INTERNATIONAL CREDIT CARD PANEL */}
                {paymentMethod === 'card' && (
                  <div className="p-4 sm:p-5 bg-[#141822] border border-[#2b3345] rounded-xs space-y-3 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between pb-2 border-b border-[#252c3c]">
                      <div className="text-xs font-bold text-[#f5f0e6] flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-[#dfb871]" />
                        <span>{t.checkout.card}</span>
                      </div>
                      <span className="text-[10px] font-mono text-[#9de0ad]">256-Bit SSL</span>
                    </div>

                    <div>
                      <label className="text-[11px] text-[#717888] block mb-1">
                        {language === 'vi' ? 'Số Thẻ (16 chữ số)' : 'Card Number'}
                      </label>
                      <input
                        type="text"
                        placeholder="4111 2222 3333 4444"
                        defaultValue="4111 5678 9012 3456"
                        className="w-full bg-[#10131b] border border-[#282d3b] rounded-xs px-3 py-2 text-xs text-[#f5f0e6] font-mono focus:outline-none focus:border-[#dfb871]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-[#717888] block mb-1">
                          {language === 'vi' ? 'Hạn Thẻ (MM/YY)' : 'Expiry'}
                        </label>
                        <input
                          type="text"
                          placeholder="12/28"
                          defaultValue="10/28"
                          className="w-full bg-[#10131b] border border-[#282d3b] rounded-xs px-3 py-2 text-xs text-[#f5f0e6] font-mono focus:outline-none focus:border-[#dfb871]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-[#717888] block mb-1">CVV / CVC</label>
                        <input
                          type="password"
                          placeholder="•••"
                          defaultValue="888"
                          maxLength={4}
                          className="w-full bg-[#10131b] border border-[#282d3b] rounded-xs px-3 py-2 text-xs text-[#f5f0e6] font-mono focus:outline-none focus:border-[#dfb871]"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 bg-[#dfb871] hover:bg-[#c5a059] disabled:opacity-50 text-[#0b0c0e] font-sans text-xs tracking-[0.2em] uppercase font-bold rounded-xs shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <span>{t.checkout.processing}</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>{t.checkout.confirmAcquisitionBtn} • {formatPrice(totalAmountUSD)}</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Order Success State */
            <div className="py-8 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-[#dfb871]/10 border-2 border-[#dfb871] flex items-center justify-center mx-auto text-[#dfb871]">
                <CheckCircle className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs uppercase font-mono tracking-widest text-[#dfb871] block mb-1">
                  {t.checkout.confirmedTitle}
                </span>
                <h3 className="text-2xl font-serif text-[#f5f0e6]">
                  {t.checkout.thankYou}, {formData.fullName}
                </h3>
                <p className="text-xs font-mono text-[#8a919f] mt-1">
                  {t.checkout.orderReference} <strong className="text-[#f5f0e6]">{orderNumber}</strong>
                </p>
              </div>

              {/* Payment Method Badge in Confirmation */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#181c26] border border-[#2e374a] text-xs font-mono text-[#dfb871]">
                {paymentMethod === 'bank_transfer' && <Building2 className="w-3.5 h-3.5" />}
                {paymentMethod === 'momo' && <Smartphone className="w-3.5 h-3.5 text-[#d82d8b]" />}
                {paymentMethod === 'zalopay' && <Smartphone className="w-3.5 h-3.5 text-[#0068ff]" />}
                {paymentMethod === 'card' && <CreditCard className="w-3.5 h-3.5" />}
                <span>
                  {t.checkout.selectedMethod}:{' '}
                  {paymentMethod === 'bank_transfer'
                    ? 'Chuyển Khoản VietQR 24/7'
                    : paymentMethod === 'momo'
                    ? 'Ví Điện Tử MoMo'
                    : paymentMethod === 'zalopay'
                    ? 'Ví Điện Tử ZaloPay'
                    : 'Thẻ Quốc Tế'}
                </span>
              </div>

              <div className="p-4 bg-[#151821] border border-[#262b37] rounded-xs text-xs text-[#a2abb9] max-w-md mx-auto text-left space-y-2">
                <div className="flex items-center gap-2 text-[#dfb871] font-semibold">
                  <Truck className="w-4 h-4 shrink-0" />
                  <span>{t.checkout.dispatchTitle}</span>
                </div>
                <p>
                  {t.checkout.dispatchText}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => onViewCertificateForOrder(orderNumber, formData.fullName)}
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#dfb871] hover:bg-[#c5a059] text-[#0b0c0e] text-xs font-mono uppercase font-bold rounded-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{t.checkout.viewCertificateBtn}</span>
                </button>

                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#171b24] hover:bg-[#202532] border border-[#2f3545] text-[#f5f0e6] text-xs uppercase tracking-wider rounded-xs cursor-pointer"
                >
                  {t.checkout.returnGalleryBtn}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
