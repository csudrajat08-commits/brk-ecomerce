/**
 * Commerce domain types.
 *
 * Field names intentionally mirror what an ERP-backed middleware (ECOUNT
 * product master + inventory) would return, so the mock catalogue can be
 * swapped for API responses without touching UI components.
 */

export interface ImageAsset {
  /** Path without width suffix, e.g. `/images/archive/imgl3540` → `-640.webp`, `-1200.webp` */
  src: string;
  alt: string;
  /** Intrinsic aspect ratio (width / height) — used to reserve layout space */
  ratio: number;
  /** CSS object-position, lets art direction shift the focal point per asset */
  focus?: string;
  /** Provenance note, surfaced in the asset registry, never in UI copy */
  credit: string;
  /** External URL override (e.g. CDN). When set, `src` is ignored. */
  url?: string;
  /** No photography yet — render an intentional, clearly-labelled placeholder */
  pending?: boolean;
  /** Placeholder tint (usually the product's main colour) */
  tone?: string;
  /** Exported widths when they differ from the default 640/1200 pair (e.g. wide banners) */
  widths?: number[];
}

export type CategorySlug = 'women' | 'men' | 'kebaya-traditional' | 'batik-fabrics' | 'shawls-accessories';

/**
 * Catalogue sub-category slug (URL segment under /women or /men).
 * Built-ins: batik-long-outer, batik-gown, … (women) and long-sleeve-shirt, … (men) —
 * the demo admin can add more, so this is an open string. Slugs are unique across both.
 */
export type WomenSubcategory = string;

/** Shopping segments with their own landing page, sub-categories and admin taxonomy. */
export type Segment = 'women' | 'men';

export type CollectionSlug = 'ifw-2026' | 'silk-atelier' | 'sogan-classics' | 'osaka-2025' | 'everyday-encim';

export interface ColorOption {
  name: string;
  hex: string;
}

/** A sellable unit — maps 1:1 to an ERP item code (SKU). */
export interface ProductVariant {
  sku: string;
  size: string;
  color: string;
  stock: number;
}

export interface Product {
  id: string;
  /** Parent item code in the ERP product master */
  sku: string;
  slug: string;
  name: string;
  category: CategorySlug;
  /** Set for everything shown in the Women's catalogue */
  subcategory?: WomenSubcategory;
  collection?: CollectionSlug;
  /** Price in IDR (integer rupiah) */
  price: number;
  compareAtPrice?: number;
  images: ImageAsset[];
  description: string;
  availableSizes: string[];
  colors: ColorOption[];
  motif: string;
  material: string;
  technique: string;
  /** Aggregate stock across variants */
  stock: number;
  featured: boolean;
  newArrival: boolean;
  variants: ProductVariant[];
  /** Epoch ms — set for products added in the admin, used by "Newest" sorting */
  createdAt?: number;
}

export interface Category {
  slug: CategorySlug;
  name: string;
  shortName: string;
  description: string;
  image: ImageAsset;
}

export interface Collection {
  slug: CollectionSlug;
  name: string;
  kicker: string;
  description: string;
  image: ImageAsset;
}

export interface CartLine {
  /** `${productId}:${size}:${color}` */
  key: string;
  productId: string;
  slug: string;
  sku: string;
  name: string;
  price: number;
  image: ImageAsset;
  size: string;
  color: string;
  quantity: number;
}

export type SortKey = 'featured' | 'newest' | 'price-asc' | 'price-desc' | 'name';

export interface ProductQuery {
  /** Every product placed in one of that segment's sub-categories */
  segment?: Segment;
  subcategory?: WomenSubcategory;
  category?: CategorySlug;
  collection?: CollectionSlug;
  search?: string;
  sizes?: string[];
  colors?: string[];
  motifs?: string[];
  minPrice?: number;
  maxPrice?: number;
  newArrival?: boolean;
  featured?: boolean;
  sort?: SortKey;
  limit?: number;
}

/** Shape of a sales order as it would be posted to the middleware. */
export interface SalesOrderDraft {
  customer: {
    fullName: string;
    email: string;
    phone: string;
  };
  shipping: {
    address: string;
    district: string;
    city: string;
    province: string;
    postalCode: string;
    method: 'standard' | 'express' | 'pickup';
    /** Courier service shown to the customer, e.g. "JNE / J&T Reguler" */
    service: string;
    /** Showroom id when method = pickup */
    pickupStore?: string;
  };
  payment: {
    /** va | qris | ewallet | card — demo only, nothing is charged */
    method: string;
    /** Bank or wallet, e.g. BCA, GoPay */
    channel?: string;
  };
  lines: Array<{ sku: string; name: string; size: string; color: string; quantity: number; unitPrice: number }>;
  giftWrap: boolean;
  promoCode?: string;
  totals: { subtotal: number; discount: number; shipping: number; giftWrap: number; total: number };
  notes?: string;
  /** Business buyers: details printed on the invoice for a Faktur Pajak */
  taxInvoice?: { companyName: string; npwp: string; address: string };
}

export interface SalesOrderResult {
  reference: string;
  status: 'demo-not-submitted' | 'pending' | 'confirmed';
  createdAt: string;
}

export interface InquiryDraft {
  type: 'uniform' | 'custom' | 'wholesale' | 'oem';
  name: string;
  company?: string;
  email: string;
  phone: string;
  quantity?: string;
  timeline?: string;
  message: string;
}
