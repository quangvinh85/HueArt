import React, { createContext, useContext, useState, useEffect } from 'react';

interface WishlistContextType {
  favorites: string[]; // Artwork IDs
  toggleFavorite: (artworkId: string) => void;
  isFavorite: (artworkId: string) => boolean;
  totalFavorites: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('hueart_favorites');
      return saved ? JSON.parse(saved) : ['meridian-gate-twilight', 'thuy-xuan-incense-symphony'];
    } catch {
      return ['meridian-gate-twilight', 'thuy-xuan-incense-symphony'];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('hueart_favorites', JSON.stringify(favorites));
    } catch (e) {
      console.warn('Could not save favorites to localStorage', e);
    }
  }, [favorites]);

  const toggleFavorite = (artworkId: string) => {
    setFavorites((prev) =>
      prev.includes(artworkId) ? prev.filter((id) => id !== artworkId) : [...prev, artworkId]
    );
  };

  const isFavorite = (artworkId: string) => favorites.includes(artworkId);

  return (
    <WishlistContext.Provider
      value={{
        favorites,
        toggleFavorite,
        isFavorite,
        totalFavorites: favorites.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
