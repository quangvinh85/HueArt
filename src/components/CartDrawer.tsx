import React from 'react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Truck } from 'lucide-react';

interface CartDrawerProps {
  onCheckout: () => void;
  onExplore: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onCheckout, onExplore }) => {
  const {
    cart,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    subtotalUSD,
    formatPrice,
    totalItems,
  } = useCart();
  const { language, t } = useLanguage();

  if (!isCartOpen) return null;

  const isFreeShipping = subtotalUSD >= 200 || cart.length === 0;
  const shippingThresholdDiff = Math.max(0, 200 - subtotalUSD);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="absolute inset-0 bg-[#07080a]/80 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#101218] border-l border-[#242936] text-[#f5f0e6] shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-5 border-b border-[#222633] flex items-center justify-between bg-[#131620]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#dfb871]" />
              <h3 className="font-serif text-lg tracking-wide">
                {t.cart.title} ({totalItems})
              </h3>
            </div>
            <button
              onClick={closeCart}
              className="p-1.5 text-[#8e96a4] hover:text-white rounded-full hover:bg-[#1f232e] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Shipping Meter */}
          <div className="px-5 py-2.5 bg-[#171b26] border-b border-[#242936] text-xs">
            {isFreeShipping ? (
              <div className="flex items-center gap-2 text-[#9de0ad]">
                <Truck className="w-4 h-4 shrink-0" />
                <span>{t.cart.freeShippingUnlocked}</span>
              </div>
            ) : (
              <div className="text-[#a2abb9]">
                {formatPrice(shippingThresholdDiff)} {t.cart.addMoreForFreeShipping}
              </div>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#181b24] border border-[#272c3a] flex items-center justify-center mx-auto text-[#6b7383]">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <h4 className="font-serif text-lg text-[#d2d7e0]">
                  {t.cart.emptyTitle}
                </h4>
                <p className="text-xs text-[#717888] max-w-xs mx-auto">
                  {t.cart.emptyText}
                </p>
                <button
                  onClick={() => {
                    closeCart();
                    onExplore();
                  }}
                  className="px-6 py-2.5 bg-[#dfb871] hover:bg-[#c5a059] text-[#0b0c0e] text-xs uppercase font-semibold tracking-wider rounded-xs cursor-pointer shadow-md"
                >
                  {t.cart.exploreCollectionBtn}
                </button>
              </div>
            ) : (
              cart.map((item) => {
                const itemTitle = item.artwork.titles?.[language] || item.artwork.title;

                return (
                  <div
                    key={item.id}
                    className="p-3.5 bg-[#141720] border border-[#222633] rounded-xs flex gap-3.5"
                  >
                    {/* Thumbnail */}
                    <div className="w-20 h-24 bg-[#0d0f14] rounded-xs overflow-hidden shrink-0 border border-[#2b303e] relative flex items-center justify-center">
                      <img
                        src={item.artwork.imageUrl}
                        alt={itemTitle}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between text-xs">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-serif text-sm text-[#f5f0e6] leading-tight line-clamp-1">
                            {itemTitle}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-[#6c7484] hover:text-[#e87082] transition-colors p-1"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-[11px] font-mono text-[#8a919f] mt-1 space-y-0.5">
                          <div>{item.size.names[language]} • {item.size.dimensionsCm}</div>
                          <div>{item.frame.names[language]}</div>
                          <div className="text-[#6f7786]">{item.paper.name}</div>
                        </div>

                        {item.customDedication && (
                          <p className="text-[10px] text-[#dfb871] italic mt-1 line-clamp-1">
                            "{item.customDedication}"
                          </p>
                        )}
                      </div>

                      {/* Quantity & Unit Price */}
                      <div className="flex items-center justify-between pt-2 border-t border-[#1e222d] mt-2">
                        <div className="flex items-center border border-[#2c3140] rounded-xs bg-[#11131a]">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-2 py-0.5 text-[#8a919f] hover:text-white"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-mono">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-2 py-0.5 text-[#8a919f] hover:text-white"
                          >
                            +
                          </button>
                        </div>

                        <span className="font-serif text-sm font-semibold text-[#f5f0e6]">
                          {formatPrice(item.unitPriceUSD * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Checkout Actions */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-[#222633] bg-[#141720] space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-[#8a919f]">
                  <span>{t.cart.subtotal}</span>
                  <span className="font-mono text-[#f5f0e6]">{formatPrice(subtotalUSD)}</span>
                </div>
                <div className="flex justify-between text-[#8a919f]">
                  <span>{t.cart.shipping}</span>
                  <span className="font-mono text-[#9de0ad]">
                    {isFreeShipping ? t.cart.complimentary : formatPrice(35)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-serif pt-2 border-t border-[#222633] text-[#f5f0e6] font-semibold">
                  <span>{t.cart.totalInvestment}</span>
                  <span className="text-[#dfb871]">
                    {formatPrice(subtotalUSD + (isFreeShipping ? 0 : 35))}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-[#788090]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#dfb871] shrink-0" />
                <span>{t.cart.guaranteeNote}</span>
              </div>

              <button
                onClick={() => {
                  closeCart();
                  onCheckout();
                }}
                className="w-full py-3.5 bg-[#dfb871] hover:bg-[#c5a059] text-[#0b0c0e] font-sans text-xs tracking-[0.2em] uppercase font-bold rounded-xs shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t.cart.proceedCheckoutBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
