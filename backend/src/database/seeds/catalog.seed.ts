import catalog from './viofun-catalog.json';

export interface CategorySeed {
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  color: string;
  sortOrder: number;
}

export interface ProductSeed {
  externalId: number;
  name: string;
  description: string;
  categorySlug: string;
  price: number | null;
  currency: string | null;
  city: string;
  district: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
  durationMinutes: number;
  tags: string[];
  imageUrl: string | null;
  bookingUrl: string | null;
  venue: string | null;
  provider: string | null;
  isFeatured: boolean;
  approximateLocation: boolean;
  isAiRecommendable: boolean;
}

export interface Catalog {
  source: string;
  fetchedAt: string;
  note: string;
  categories: CategorySeed[];
  products: ProductSeed[];
}

export const viofunCatalog = catalog as Catalog;
