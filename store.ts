export type ClothingCategorySlug =
  | 'all-clothing'
  | 'new-arrivals'
  | 't-shirts'
  | 'hoodies-sweatshirts'
  | 'jackets'
  | 'shirts'
  | 'trousers'
  | 'co-ord-sets';

export type ClothingGender = 'Men' | 'Women' | 'Unisex';

export interface ProductColorOption {
  name: string;
  hex: string;
}

export interface ProductVariant {
  id: string;
  title: string;
  size: 'XS' | 'S' | 'M' | 'L' | 'XL';
  color: string;
  price: number;
  compareAtPrice?: number;
  currencyCode: string;
  availableForSale: boolean;
  sku?: string;
}

export interface ClothingProduct {
  id: string;
  handle: string;
  title: string;
  subtitle: string;
  description: string;
  category: Exclude<ClothingCategorySlug, 'all-clothing' | 'new-arrivals'>;
  categoryLabel: string;
  gender: ClothingGender;
  isNewArrival: boolean;
  createdAt: string;
  price: number;
  compareAtPrice?: number;
  currencyCode: string;
  availableForSale: boolean;
  images: {
    url: string;
    altText: string;
    cropStyle?: 'default' | 'top-focus';
  }[];
  colors: ProductColorOption[];
  sizes: ('XS' | 'S' | 'M' | 'L' | 'XL')[];
  variants: ProductVariant[];
  materialAndCare?: string[];
  fitNotes?: string;
  garment3DProfile: {
    silhouette: 'tshirt' | 'hoodie' | 'jacket' | 'shirt' | 'trousers' | 'coord';
    primaryColorHex: string;
    fabricRoughness: number;
    fabricMetalness: number;
    gsmWeightLabel: string;
  };
  source: 'shopify' | 'development_catalog';
}

export interface CartLineItem {
  id: string;
  variantId: string;
  productId: string;
  productHandle: string;
  title: string;
  categoryLabel: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
  compareAtPrice?: number;
  currencyCode: string;
  imageUrl: string;
}

export interface StoreCart {
  id: string;
  lines: CartLineItem[];
  subtotalAmount: number;
  currencyCode: string;
  checkoutUrl: string | null;
  source: 'shopify' | 'development_catalog';
}

export type ShopifyConnectionMode =
  | 'unconfigured'
  | 'connecting'
  | 'connected_tokenless'
  | 'connected_authenticated'
  | 'connection_error';

export interface ShopifyDiagnostics {
  mode: ShopifyConnectionMode;
  storeDomain: string;
  apiVersion: string;
  endpoint: string;
  hasPublicToken: boolean;
  lastCheckedAt: string | null;
  statusMessage: string;
  errorDetails?: string;
  productsLoadedCount: number;
  filteredFootwearCount: number;
}
