import React, { createContext, useContext, useState, useEffect } from 'react';
import { Artwork, PrintSize, PaperType, FrameType, MatType, CartItem, Currency } from '../types';

interface CartContextType {
  cart: CartItem[];
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatPrice: (amountUSD: number) => string;
  calculateItemPrice: (artwork: Artwork, size: PrintSize, paper: PaperType, frame: FrameType, mat: MatType) => number;
  addToCart: (artwork: Artwork, size: PrintSize, paper: PaperType, frame: FrameType, mat: MatType, quantity?: number, customDedication?: string) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  subtotalUSD: number;
  totalItems: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CURRENCY_RATES: Record<Currency, { rate: number; symbol: string; decimals: number; prefix: boolean }> = {
  USD: { rate: 1.0, symbol: '$', decimals: 0, prefix: true },
  EUR: { rate: 0.92, symbol: '€', decimals: 0, prefix: true },
  GBP: { rate: 0.79, symbol: '£', decimals: 0, prefix: true },
  VND: { rate: 25400, symbol: '₫', decimals: 0, prefix: false },
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('hueart_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [currency, setCurrency] = useState<Currency>(() => {
    try {
      const saved = localStorage.getItem('hueart_currency') as Currency;
      return saved && CURRENCY_RATES[saved] ? saved : 'USD';
    } catch {
      return 'USD';
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('hueart_cart', JSON.stringify(cart));
    } catch (e) {
      console.warn('Could not save cart to localStorage', e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('hueart_currency', currency);
    } catch (e) {
      console.warn('Could not save currency to localStorage', e);
    }
  }, [currency]);

  const calculateItemPrice = (artwork: Artwork, size: PrintSize, paper: PaperType, frame: FrameType, mat: MatType): number => {
    const printPrice = Math.round(artwork.basePriceUSD * size.priceMultiplier);
    const paperCost = paper.surchargeUSD;
    const frameCost = Math.round(frame.surchargeUSD * (size.priceMultiplier > 1 ? (1 + (size.priceMultiplier - 1) * 0.45) : 1));
    const matCost = mat.surchargeUSD;
    return printPrice + paperCost + frameCost + matCost;
  };

  const formatPrice = (amountUSD: number): string => {
    const config = CURRENCY_RATES[currency];
    const converted = amountUSD * config.rate;

    if (currency === 'VND') {
      const rounded = Math.round(converted / 10000) * 10000;
      return `${rounded.toLocaleString('vi-VN')} ${config.symbol}`;
    }

    const formatted = Math.round(converted).toLocaleString('en-US');
    return config.prefix ? `${config.symbol}${formatted}` : `${formatted} ${config.symbol}`;
  };

  const addToCart = (
    artwork: Artwork,
    size: PrintSize,
    paper: PaperType,
    frame: FrameType,
    mat: MatType,
    quantity = 1,
    customDedication = ''
  ) => {
    const unitPriceUSD = calculateItemPrice(artwork, size, paper, frame, mat);

    setCart((prevCart) => {
      // Check for exact matching configuration
      const existingIndex = prevCart.findIndex(
        (item) =>
          item.artwork.id === artwork.id &&
          item.size.id === size.id &&
          item.paper.id === paper.id &&
          item.frame.id === frame.id &&
          item.mat.id === mat.id &&
          (item.customDedication || '') === customDedication
      );

      if (existingIndex > -1) {
        const next = [...prevCart];
        next[existingIndex].quantity += quantity;
        return next;
      }

      const newItem: CartItem = {
        id: `${artwork.id}-${size.id}-${frame.id}-${paper.id}-${Date.now()}`,
        artwork,
        size,
        paper,
        frame,
        mat,
        quantity,
        unitPriceUSD,
        customDedication: customDedication.trim() || undefined,
      };

      return [...prevCart, newItem];
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const subtotalUSD = cart.reduce((sum, item) => sum + item.unitPriceUSD * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        currency,
        setCurrency,
        formatPrice,
        calculateItemPrice,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotalUSD,
        totalItems,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
