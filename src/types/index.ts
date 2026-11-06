import { Language } from '../i18n/translations';

export type Orientation = 'landscape' | 'portrait' | 'panoramic';

export type Collection =
  | 'all'
  | 'imperial-echoes'
  | 'perfume-river'
  | 'living-traditions'
  | 'poetic-monochrome';

export interface CameraMetadata {
  camera: string;
  lens: string;
  settings: string;
  locationName: string;
  coordinates: string;
  capturedAt: string;
}

export interface Artwork {
  id: string;
  title: string; // fallback / default title
  vietnameseTitle: string;
  titles: Record<Language, string>;
  stories: Record<Language, string>;
  historicalNotes: Record<Language, string>;
  locations: Record<Language, string>;
  collection: 'imperial-echoes' | 'perfume-river' | 'living-traditions' | 'poetic-monochrome';
  year: number;
  orientation: Orientation;
  aspectRatio: string;
  location: string;
  story: string;
  historicalNote: string;
  editionTotal: number;
  editionsRemaining: number;
  camera: CameraMetadata;
  imageUrl: string;
  highResUrl: string;
  basePriceUSD: number;
  mood: 'imperial' | 'misty' | 'serene' | 'vibrant' | 'nocturnal';
  palette: string[];
  featured?: boolean;
  photographer?: string;
}

export interface PrintSize {
  id: string;
  name: string;
  names: Record<Language, string>;
  dimensionsCm: string;
  dimensionsInches: string;
  priceMultiplier: number;
  shippingClass: 'standard' | 'express' | 'oversized';
}

export interface PaperType {
  id: string;
  name: string;
  subname: string;
  subnames: Record<Language, string>;
  weightGsm: number;
  finish: string;
  finishes: Record<Language, string>;
  description: string;
  descriptions: Record<Language, string>;
  surchargeUSD: number;
}

export interface FrameType {
  id: string;
  name: string;
  names: Record<Language, string>;
  colorName: string;
  material: string;
  materials: Record<Language, string>;
  borderHex: string;
  surchargeUSD: number;
  description: string;
  descriptions: Record<Language, string>;
  frameWidthPx: number;
}

export interface MatType {
  id: string;
  name: string;
  names: Record<Language, string>;
  colorHex: string;
  surchargeUSD: number;
}

export interface CartItem {
  id: string;
  artwork: Artwork;
  size: PrintSize;
  paper: PaperType;
  frame: FrameType;
  mat: MatType;
  quantity: number;
  unitPriceUSD: number;
  customDedication?: string;
}

export type Currency = 'USD' | 'EUR' | 'GBP' | 'VND';

export interface RoomEnvironment {
  id: string;
  name: string;
  names: Record<Language, string>;
  sceneImage: string;
  wallColor: string;
  accentNote: string;
}
