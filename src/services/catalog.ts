/**
 * Catalogue data-access layer.
 *
 * UI code only talks to `catalog` (a CatalogRepository). Today it is backed by
 * the in-memory mock; later `createApiCatalogRepository` can point at a BRK
 * middleware that syncs the ECOUNT product master + inventory.
 *
 * Never call ECOUNT (or any ERP) directly from the browser: credentials would
 * be exposed. The middleware owns auth, caching and field mapping.
 */
import { catalogStore } from './catalogStore';
import type { Product, ProductQuery, ProductVariant } from '../types/commerce';

export interface CatalogRepository {
  listProducts(query?: ProductQuery): Promise<Product[]>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  getProductsByIds(ids: string[]): Promise<Product[]>;
  /** Live availability per variant SKU — ECOUNT inventory in production */
  getAvailability(sku: string): Promise<ProductVariant[]>;
  /** Facets for filter UIs */
  getFacets(): Promise<CatalogFacets>;
}

export interface CatalogFacets {
  sizes: string[];
  colors: Array<{ name: string; hex: string }>;
  motifs: string[];
  priceRange: [number, number];
}

/* ------------------------------------------------------------------ */
/* Pure query helpers (shared by mock + any client-side filtering)     */
/* ------------------------------------------------------------------ */

const norm = (s: string) => s.toLowerCase().normalize('NFKD');

export function matchesSearch(p: Product, term: string): boolean {
  const t = norm(term.trim());
  if (!t) return true;
  const hay = norm([p.name, p.motif, p.material, p.technique, p.category, p.collection ?? '', ...p.colors.map((c) => c.name)].join(' '));
  return t.split(/\s+/).every((w) => hay.includes(w));
}

export function applyQuery(list: Product[], q: ProductQuery = {}): Product[] {
  let out = list.filter((p) => {
    if (q.segment && catalogStore.segmentOf(p) !== q.segment) return false;
    if (q.subcategory && p.subcategory !== q.subcategory) return false;
    if (q.category && p.category !== q.category) return false;
    if (q.collection && p.collection !== q.collection) return false;
    if (q.newArrival && !p.newArrival) return false;
    if (q.featured && !p.featured) return false;
    if (q.search && !matchesSearch(p, q.search)) return false;
    if (q.sizes?.length && !q.sizes.some((s) => p.availableSizes.includes(s))) return false;
    if (q.colors?.length && !q.colors.some((c) => p.colors.some((pc) => pc.name === c))) return false;
    if (q.motifs?.length && !q.motifs.includes(p.motif)) return false;
    if (q.minPrice != null && p.price < q.minPrice) return false;
    if (q.maxPrice != null && p.price > q.maxPrice) return false;
    return true;
  });

  switch (q.sort) {
    case 'price-asc':
      out = [...out].sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      out = [...out].sort((a, b) => b.price - a.price);
      break;
    case 'name':
      out = [...out].sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'newest':
      out = [...out].sort((a, b) => Number(b.newArrival) - Number(a.newArrival));
      break;
    case 'featured':
    default:
      out = [...out].sort((a, b) => Number(b.featured) - Number(a.featured));
  }
  return q.limit ? out.slice(0, q.limit) : out;
}

/* ------------------------------------------------------------------ */
/* Mock repository                                                     */
/* ------------------------------------------------------------------ */

/** In-memory repository; `getSource` is read on every call so admin edits apply live. */
export function createMockCatalogRepository(getSource: () => Product[] = () => catalogStore.products): CatalogRepository {
  return {
    async listProducts(query) {
      return applyQuery(getSource(), query);
    },
    async getProductBySlug(slug) {
      return getSource().find((p) => p.slug === slug);
    },
    async getProductsByIds(ids) {
      const source = getSource();
      return ids.map((id) => source.find((p) => p.id === id)).filter((p): p is Product => !!p);
    },
    async getAvailability(sku) {
      const parent = getSource().find((p) => sku.startsWith(p.sku));
      return parent?.variants ?? [];
    },
    async getFacets() {
      const sizes = new Set<string>();
      const colors = new Map<string, string>();
      const motifs = new Set<string>();
      let min = Infinity;
      let max = 0;
      for (const p of getSource()) {
        p.availableSizes.forEach((s) => sizes.add(s));
        p.colors.forEach((c) => colors.set(c.name, c.hex));
        motifs.add(p.motif);
        min = Math.min(min, p.price);
        max = Math.max(max, p.price);
      }
      const sizeOrder = ['S', 'M', 'L', 'XL', 'XXL', 'One Size', '2 m', '2.5 m'];
      return {
        sizes: [...sizes].sort((a, b) => sizeOrder.indexOf(a) - sizeOrder.indexOf(b)),
        colors: [...colors].map(([name, hex]) => ({ name, hex })),
        motifs: [...motifs].sort(),
        priceRange: [min, max],
      };
    },
  };
}

/* ------------------------------------------------------------------ */
/* API repository (future) — talks to BRK middleware, not to ECOUNT    */
/* ------------------------------------------------------------------ */

export function createApiCatalogRepository(baseUrl: string): CatalogRepository {
  async function get<T>(path: string): Promise<T> {
    const res = await fetch(`${baseUrl}${path}`, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`Catalogue API ${res.status} on ${path}`);
    return res.json() as Promise<T>;
  }
  const toParams = (q: ProductQuery = {}) => {
    const p = new URLSearchParams();
    Object.entries(q).forEach(([k, v]) => {
      if (v == null || v === '') return;
      p.set(k, Array.isArray(v) ? v.join(',') : String(v));
    });
    return p.toString();
  };
  return {
    listProducts: (q) => get<Product[]>(`/products?${toParams(q)}`),
    getProductBySlug: (slug) => get<Product | undefined>(`/products/${encodeURIComponent(slug)}`),
    getProductsByIds: (ids) => get<Product[]>(`/products?ids=${ids.join(',')}`),
    getAvailability: (sku) => get<ProductVariant[]>(`/inventory/${encodeURIComponent(sku)}`),
    getFacets: () => get<CatalogFacets>('/products/facets'),
  };
}

const source = import.meta.env.VITE_CATALOG_SOURCE;
const apiUrl = import.meta.env.VITE_COMMERCE_API_URL;

export const catalog: CatalogRepository =
  source === 'api' && apiUrl ? createApiCatalogRepository(apiUrl) : createMockCatalogRepository();

/** Synchronous access for the mock-only prototype (search-as-you-type etc.) */
export const getCatalogSnapshot = () => catalogStore.products;
