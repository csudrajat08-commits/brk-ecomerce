/**
 * Women's catalogue taxonomy + filter vocabulary.
 *
 * Sub-categories, colour families and motif families are presentation-level
 * groupings layered over the product data, so the ERP can keep its own
 * colour/motif codes and the storefront still offers a short, curated list.
 */
import type { ImageAsset, Product, WomenSubcategory } from '../types/commerce';
import { catalogAssets } from './catalogAssets';
import { siteAssets } from './siteAssets';

export interface CatalogHeroConfig {
  eyebrow: string;
  title: string;
  description: string;
  /** Full-length look — rendered uncropped (arch layout) */
  main?: ImageAsset;
  /** Supporting studio image (arch layout) */
  detail?: ImageAsset;
  /**
   * Optional full-width campaign banner. When set, it replaces the arch layout;
   * `mobile` is a model-centred crop for small screens.
   */
  banner?: HeroBanner;
  /**
   * Hero slideshow. When set (2+ slides) the banner hero cycles through them;
   * `banner` is kept equal to the first slide for older data and previews.
   */
  banners?: HeroBanner[];
}

/** All hero slides for a category, oldest data (single `banner`) included. */
export const heroBanners = (hero: CatalogHeroConfig): HeroBanner[] => (hero.banners?.length ? hero.banners : hero.banner ? [hero.banner] : []);

export interface HeroBanner {
  desktop: ImageAsset;
  mobile: ImageAsset;
  /** Copy column position over the desktop banner, % of width (default 19 / 34) */
  copyLeft?: number;
  copyWidth?: number;
  /** Text colour for the overlaid copy — 'light' for dark imagery */
  tone?: 'dark' | 'light';
}

export interface WomenCategoryDef {
  slug: WomenSubcategory | 'all';
  label: string;
  hero: CatalogHeroConfig;
  /** Tile photo on the /women hub; falls back to the first product photo in the category */
  cover?: ImageAsset;
  /** Added in the demo admin (can be deleted there) */
  custom?: boolean;
}

const EYEBROW = "Women's Collection";

/** Catalogue shot from the BRK archive (4:5, label-free) used in arch heroes. */
const studio = (file: string, alt: string): ImageAsset => ({
  src: `/images/archive/${file}`,
  alt,
  ratio: 1080 / 1350,
  focus: '50% 22%',
  credit: 'BRK public catalogue (temporary placeholder)',
});

/**
 * `all` is the /women hub (and its /women/all product grid); the rest are the
 * women's categories in display order. Order, labels, heroes and cover photos
 * can all be changed in the admin.
 */
export const womenCategories: WomenCategoryDef[] = [
  {
    slug: 'all',
    label: 'All Women',
    hero: {
      eyebrow: 'Batik Riana Kesuma',
      title: "Women's Collection",
      description: 'Batik tulis dari Solo dalam siluet modern — pilih koleksi sesuai momen Anda, dari busana harian hingga perayaan istimewa.',
      main: studio('website-9', 'Black lace bodice gown with a batik silk skirt'),
      detail: siteAssets.womenCollection,
    },
  },
  {
    slug: 'batik-long-outer',
    label: 'Batik Long Outer',
    hero: {
      eyebrow: EYEBROW,
      title: 'Batik Long Outer',
      description: 'Perpaduan keanggunan batik dan desain modern untuk tampilan yang elegan dan timeless.',
      main: catalogAssets.batikLongOuterHero,
      detail: catalogAssets.batikLongOuterHeroDetail,
      banner: { desktop: catalogAssets.batikLongOuterBanner, mobile: catalogAssets.batikLongOuterBannerMobile },
    },
  },
  {
    slug: 'batik-gown',
    label: 'Batik Gown',
    hero: {
      eyebrow: EYEBROW,
      title: 'Batik Gown',
      description: 'Keanggunan batik dalam nuansa monokrom berbahan silk yang ringan, mewah, dan timeless dalam setiap kesempatan.',
      main: studio('website-9', 'Black lace bodice gown with a black, brown and cream batik silk skirt'),
      detail: studio('website-4', 'Silk V-neck maxi in black, brown and cream batik'),
      // Banner from the approved Silk Monochrome Batik Gown mockup (replace with a full-res file in the admin)
      banner: {
        desktop: catalogAssets.silkMonochromeGownBanner,
        mobile: catalogAssets.silkMonochromeGownBannerMobile,
        copyLeft: 6.8,
        copyWidth: 36,
      },
    },
  },
  {
    slug: 'batik-dress',
    label: 'Batik Dress',
    hero: {
      eyebrow: EYEBROW,
      title: 'Batik Dress',
      description: 'Dress sutra dan katun bermotif batik — dari prada emas hingga motif klasik Solo.',
      main: studio('website-28', 'Cream silk A-line dress with a gold and cobalt batik border'),
      detail: studio('website-27', 'Black silk dress with gold-foil batik florals'),
    },
  },
  {
    slug: 'batik-blouse',
    label: 'Batik Blouse',
    hero: {
      eyebrow: EYEBROW,
      title: 'Batik Blouse',
      description: 'Blus batik sutra dan katun yang ringan — mudah dipadukan untuk kantor maupun akhir pekan.',
      main: studio('website-19', 'Silk blouse with an olive parang panel and a cream batik panel'),
      detail: studio('website-3', 'Cream silk batwing blouse with brown and navy batik accents'),
    },
  },
  {
    slug: 'one-set',
    label: 'One Set',
    hero: {
      eyebrow: EYEBROW,
      title: 'One Set',
      description: 'Setelan atasan dan bawahan batik yang serasi — praktis, rapi, dan siap dikenakan.',
      main: studio('sutra-crep3', 'Sutra crepe batik outer with a tumpal border'),
      detail: studio('classic-sogan', 'Classic sogan batik blouse and skirt'),
    },
  },
];

/* ---------------- Filter vocabulary ---------------- */

export const WOMEN_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

export const COLOR_FAMILIES = [
  { name: 'Black', hex: '#1f1d1b' },
  { name: 'White', hex: '#f3efe7' },
  { name: 'Navy', hex: '#1f2a4a' },
  { name: 'Maroon', hex: '#6e2a2f' },
  { name: 'Beige', hex: '#d8c8ad' },
  { name: 'Pink', hex: '#d9a7a3' },
  { name: 'Olive', hex: '#6b6a3a' },
  { name: 'Grey', hex: '#a8a49d' },
] as const;

/** Product colour name → storefront colour family */
const COLOR_FAMILY_OF: Record<string, string> = {
  'Ink Black': 'Black',
  'Ivory White': 'White',
  Taupe: 'Beige',
  'Charcoal Grey': 'Grey',
  Navy: 'Navy',
  Indigo: 'Navy',
  Cobalt: 'Navy',
  Maroon: 'Maroon',
  'Lacquer Red': 'Maroon',
  Cream: 'Beige',
  Beige: 'Beige',
  'Sogan Brown': 'Beige',
  'Antique Gold': 'Beige',
  'Orchid Pink': 'Pink',
  'Dusty Rose': 'Pink',
  Blush: 'Pink',
  Olive: 'Olive',
  'Leaf Green': 'Olive',
  'Pearl Grey': 'Grey',
};

export const MOTIF_FAMILIES = ['Floral', 'Geometric', 'Parang', 'Mega Mendung', 'Modern'] as const;

/** Product motif → storefront motif family */
const MOTIF_FAMILY_OF: Record<string, string> = {
  Floral: 'Floral',
  Hibiscus: 'Floral',
  'Sogan Floral': 'Floral',
  'Tumpal Floral': 'Floral',
  'Prada Floral': 'Floral',
  'Sekar Jagad': 'Floral',
  Encim: 'Floral',
  'Lung-lungan': 'Floral',
  Kawung: 'Geometric',
  Ceplok: 'Geometric',
  'Kawung & Ceplok': 'Geometric',
  Garis: 'Geometric',
  Lereng: 'Geometric',
  Tumpal: 'Geometric',
  Parang: 'Parang',
  'Parang Rusak': 'Parang',
  'Sogan Parang': 'Parang',
  'Hibiscus & Parang': 'Parang',
  'Parang & Semen': 'Parang',
  'Mega Mendung': 'Mega Mendung',
  'Tumpal Monas': 'Modern',
  'Pinggiran (border)': 'Modern',
  'Sogan Semen': 'Modern',
  Sogan: 'Modern',
  Modern: 'Modern',
};

export const colorFamiliesOf = (p: Product) => [...new Set(p.colors.map((c) => COLOR_FAMILY_OF[c.name]).filter(Boolean))];
export const motifFamilyOf = (p: Product) => MOTIF_FAMILY_OF[p.motif] ?? 'Modern';

/* ---------------- Filtering ---------------- */

export type CatalogSort = 'newest' | 'price-asc' | 'price-desc' | 'name';

export const SORT_OPTIONS: Array<{ value: CatalogSort; label: string }> = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'name', label: 'Name A–Z' },
];

export interface CatalogFilters {
  sizes: string[];
  colors: string[];
  motifs: string[];
  price: [number, number] | null;
}

export const EMPTY_FILTERS: CatalogFilters = { sizes: [], colors: [], motifs: [], price: null };

export function filterCatalog(list: Product[], f: CatalogFilters, sort: CatalogSort): Product[] {
  const out = list.filter((p) => {
    if (f.sizes.length && !f.sizes.some((s) => p.availableSizes.includes(s))) return false;
    if (f.colors.length && !colorFamiliesOf(p).some((c) => f.colors.includes(c))) return false;
    if (f.motifs.length && !f.motifs.includes(motifFamilyOf(p))) return false;
    if (f.price && (p.price < f.price[0] || p.price > f.price[1])) return false;
    return true;
  });
  // "Newest": new arrivals first, then most recently added first
  const byNewest = (a: Product, b: Product) =>
    Number(b.newArrival) - Number(a.newArrival) || (b.createdAt ?? 0) - (a.createdAt ?? 0) || b.id.localeCompare(a.id);
  const sorters: Record<CatalogSort, (a: Product, b: Product) => number> = {
    newest: byNewest,
    'price-asc': (a, b) => a.price - b.price || a.name.localeCompare(b.name),
    'price-desc': (a, b) => b.price - a.price || a.name.localeCompare(b.name),
    name: (a, b) => a.name.localeCompare(b.name),
  };
  return [...out].sort(sorters[sort]);
}

export const activeFilterCount = (f: CatalogFilters) => f.sizes.length + f.colors.length + f.motifs.length + (f.price ? 1 : 0);
