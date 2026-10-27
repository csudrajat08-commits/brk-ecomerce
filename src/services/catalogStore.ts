/**
 * Catalogue state for the prototype.
 *
 * Base data = the mock catalogue in src/data. The demo admin (/admin) layers
 * edits on top:
 *   - products: added, edited (copy of a base product) and deleted ids
 *   - women & men categories: hero/label overrides and newly added categories
 *   - homepage: hero slides, "Shop by category" tiles, the New Arrivals list,
 *     collections, and the copy/photos of every other section (homeContent.ts)
 *   - images: uploaded files
 *
 * Storage modes
 *   server — the Vite dev server is reachable (/__admin, see vite-plugins/adminSync.ts):
 *            edits are written to ./admin-data in the project, so every device on
 *            the dev server (laptop + phones) sees the same catalogue.
 *   local  — no dev server (e.g. static hosting): edits fall back to IndexedDB in
 *            this browser only, layered on any published admin-data snapshot.
 *
 * Every page reads through this store, so admin changes show up site-wide
 * immediately. In production this is replaced by the CMS / ERP middleware.
 */
import { categories as baseMainCategories, collections as baseCollections } from '../data/catalog';
import { defaultHomeContent, type HomeContent, type HomeSectionKey } from '../data/homeContent';
import { defaultHeroSlides, type HeroSlide } from '../data/homeHero';
import { makeVariants, products as baseProducts } from '../data/products';
import { menCategories as baseMenCategories } from '../data/menCatalog';
import { womenCategories as baseWomenCategories, type WomenCategoryDef } from '../data/womenCatalog';
import type { Category, Collection, ImageAsset, Product, Segment } from '../types/commerce';
import { idb } from './adminDb';

interface ProductOverrides {
  added: Product[];
  edited: Record<string, Product>;
  deleted: string[];
}
interface CategoryOverrides {
  /** Overrides for built-in categories, keyed by slug */
  edited: Record<string, WomenCategoryDef>;
  /** Categories created in the admin (appended after the built-ins) */
  added: WomenCategoryDef[];
  /** Display order of category slugs set in the admin ('all' always stays first) */
  order?: string[];
}
/** Homepage "Shop by category" tiles: per-slug overrides of the built-in main categories */
export type HomeTileEdit = Partial<Pick<Category, 'name' | 'shortName' | 'description' | 'image'>>;
interface HomeOverrides {
  tiles: Record<string, HomeTileEdit>;
  /** Product ids shown in the homepage New Arrivals, in order; empty = automatic */
  newArrivals?: string[];
  /** Homepage hero slides; undefined = the built-in slides */
  hero?: HeroSlide[];
  /** Edited homepage sections (each saved whole); missing = built-in */
  sections?: Partial<HomeContent>;
  /** Collection name / kicker / description / photo edits, by slug */
  collections?: Record<string, CollectionEdit>;
}
export type CollectionEdit = Partial<Pick<Collection, 'name' | 'kicker' | 'description' | 'image'>>;
interface SavedState {
  products: ProductOverrides;
  /** Women's categories (key kept from before Men existed) */
  categories: CategoryOverrides;
  menCategories?: CategoryOverrides;
  home?: HomeOverrides;
}

const BASE_CATEGORIES: Record<Segment, WomenCategoryDef[]> = { women: baseWomenCategories, men: baseMenCategories };

const EMPTY_PRODUCTS: ProductOverrides = { added: [], edited: {}, deleted: [] };
const EMPTY_CATEGORIES: CategoryOverrides = { edited: {}, added: [] };
const EMPTY_HOME: HomeOverrides = { tiles: {} };
/** Products shown in the homepage New Arrivals grid */
export const NEW_ARRIVALS_MAX = 8;
/** Automatic New Arrivals order: products added in the admin first (newest first), otherwise unchanged. */
export const newestFirst = (list: Product[]) => [...list].sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));

const SNAPSHOT_URL = '/admin-data/catalog.json';
const uploadUrl = (id: string) => `/admin-data/uploads/${id}.webp`;
/** Matches every stored image reference: `idb:<id>` or `/admin-data/uploads/<id>.webp` */
const IMAGE_REF = /idb:(img-[a-z0-9-]+)|\/admin-data\/uploads\/(img-[a-z0-9-]+)\.webp/g;

export interface ExportBundle {
  format: 'brk-admin-export';
  version: 1;
  exportedAt: string;
  products: ProductOverrides;
  categories: CategoryOverrides;
  menCategories?: CategoryOverrides;
  home?: HomeOverrides;
  images: Record<string, string>; // id -> data URL
}

type Listener = () => void;

const newImageId = () => `img-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

/** Rewrite every image reference inside a JSON-able value. */
function mapImageRefs<T>(value: T, to: (id: string) => string): T {
  return JSON.parse(JSON.stringify(value).replace(IMAGE_REF, (_m, a, b) => to(a ?? b)));
}
function imageIdsIn(value: unknown): string[] {
  return [...new Set([...JSON.stringify(value).matchAll(IMAGE_REF)].map((m) => m[1] ?? m[2]))];
}

function mergeProducts(a: ProductOverrides, b: ProductOverrides): ProductOverrides {
  return {
    added: [...a.added.filter((x) => !b.added.some((y) => y.id === x.id)), ...b.added],
    edited: { ...a.edited, ...b.edited },
    deleted: [...new Set([...a.deleted, ...b.deleted])],
  };
}
function mergeCategories(a: CategoryOverrides, b: CategoryOverrides): CategoryOverrides {
  return {
    edited: { ...a.edited, ...b.edited },
    added: [...a.added.filter((x) => !b.added.some((y) => y.slug === x.slug)), ...b.added],
  };
}

class CatalogStore {
  products: Product[] = baseProducts;
  /** Categories per segment (women, men), with admin edits and order applied */
  categoriesBy: Record<Segment, WomenCategoryDef[]> = { ...BASE_CATEGORIES };
  /** Women's categories (most of the site predates Men) */
  get categories() {
    return this.categoriesBy.women;
  }
  /** Main categories as shown on the homepage, with admin tile edits applied */
  mainCategories: Category[] = baseMainCategories;
  /** Collections with admin edits applied */
  collections: Collection[] = baseCollections;
  /** Homepage copy and photos with admin edits applied */
  homeContent: HomeContent = defaultHomeContent;
  version = 0;
  mode: 'server' | 'local' = 'local';
  /** True when no storage is usable (no dev server and no IndexedDB) */
  unavailable = false;
  /** Edits still sitting in this browser's IndexedDB while in server mode */
  localPending: { products: number; categories: number } | null = null;

  private po: ProductOverrides = EMPTY_PRODUCTS;
  /** Category overrides per segment */
  private co: Record<Segment, CategoryOverrides> = { women: EMPTY_CATEGORIES, men: EMPTY_CATEGORIES };
  private ho: HomeOverrides = EMPTY_HOME;
  private idbUrls = new Map<string, string>();
  private listeners = new Set<Listener>();

  async init() {
    const [ping, snapshot] = await Promise.all([
      fetch('/__admin/ping', { cache: 'no-store' })
        .then((r) => r.ok)
        .catch(() => false),
      fetch(SNAPSHOT_URL, { cache: 'no-store' })
        .then((r) => (r.ok ? (r.json() as Promise<SavedState>) : null))
        .catch(() => null),
    ]);
    this.mode = ping ? 'server' : 'local';
    if (snapshot) this.applyState(snapshot);

    // Browser-side data: the working copy in local mode, a migration candidate in server mode
    try {
      const [po, co, cm, ho, images] = await Promise.all([
        idb.get<ProductOverrides>('kv', 'products'),
        idb.get<CategoryOverrides>('kv', 'categories'),
        idb.get<CategoryOverrides>('kv', 'menCategories'),
        idb.get<HomeOverrides>('kv', 'home'),
        idb.entries<Blob>('images'),
      ]);
      for (const [id, blob] of images) this.idbUrls.set(id, URL.createObjectURL(blob));
      const local = { products: { ...EMPTY_PRODUCTS, ...po }, categories: { ...EMPTY_CATEGORIES, ...co }, menCategories: { ...EMPTY_CATEGORIES, ...cm }, home: { ...EMPTY_HOME, ...ho } };
      const count = {
        products: local.products.added.length + Object.keys(local.products.edited).length + local.products.deleted.length,
        categories: local.categories.added.length + Object.keys(local.categories.edited).length + local.menCategories.added.length + Object.keys(local.menCategories.edited).length + Object.keys(local.home.tiles).length + (local.home.newArrivals?.length ? 1 : 0) + (local.home.hero ? 1 : 0) + Object.keys(local.home.sections ?? {}).length + Object.keys(local.home.collections ?? {}).length,
      };
      if (this.mode === 'local') {
        if (po || co || cm || ho) this.applyState(local);
      } else if (count.products + count.categories > 0) {
        this.localPending = count;
      }
    } catch {
      if (this.mode === 'local') this.unavailable = true;
    }
    this.rebuild();
  }

  /* ---------------- reads ---------------- */

  subscribe = (fn: Listener) => {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  };
  getVersion = () => this.version;

  /** Resolve a stored image reference to something an <img> can load */
  resolveUrl(url: string): string | undefined {
    return url.startsWith('idb:') ? this.idbUrls.get(url.slice(4)) : url;
  }

  categoryBySlug(slug: string | undefined, seg: Segment = 'women') {
    return this.categoriesBy[seg].find((c) => c.slug === (slug ?? 'all'));
  }

  /** Which segment a product's sub-category belongs to (undefined = not on /women or /men) */
  segmentOf(p: Product): Segment | undefined {
    if (!p.subcategory) return undefined;
    if (this.categoriesBy.men.some((c) => c.slug === p.subcategory)) return 'men';
    return 'women';
  }

  /**
   * Tile photo for a category, best first:
   * chosen cover → a product photo uploaded in the admin → any product photo → the hero imagery.
   */
  coverOf(c: WomenCategoryDef, seg: Segment = 'women'): ImageAsset | undefined {
    if (c.cover) return c.cover;
    const inCat = c.slug === 'all' ? this.products.filter((p) => this.segmentOf(p) === seg) : this.products.filter((p) => p.subcategory === c.slug);
    const photos = inCat.map((p) => p.images[0]).filter((im) => im && !im.pending);
    return photos.find((im) => im.url) ?? photos[0] ?? c.hero.banner?.mobile ?? c.hero.main;
  }

  /** Where a product came from — shown in the admin list */
  originOf(id: string): 'base' | 'edited' | 'added' {
    if (this.po.added.some((p) => p.id === id)) return 'added';
    return this.po.edited[id] ? 'edited' : 'base';
  }
  isCategoryEdited(slug: string, seg: Segment = 'women') {
    return !!this.co[seg].edited[slug];
  }
  isHomeTileEdited(slug: string) {
    return !!this.ho.tiles[slug];
  }
  get deletedCount() {
    return this.po.deleted.length;
  }

  /* ---------------- writes ---------------- */

  async saveImage(blob: Blob): Promise<string> {
    const id = newImageId();
    return this.storeImage(id, blob);
  }

  /** `base`, or `base-2`, `base-3`… — whichever is free among products (or categories). */
  uniqueSlug(base: string, kind: 'product' | 'category' = 'product') {
    const taken = new Set(kind === 'product' ? this.products.map((p) => p.slug) : [...this.categoriesBy.women, ...this.categoriesBy.men].map((c) => c.slug));
    if (!taken.has(base)) return base;
    let n = 2;
    while (taken.has(`${base}-${n}`)) n += 1;
    return `${base}-${n}`;
  }

  /** A new, unsaved copy of a product (fresh id, slug, SKU and variant SKUs; same photos). */
  cloneProduct(p: Product, patch: Partial<Product> = {}, reserved: string[] = []): Product {
    let slug = this.uniqueSlug(`${p.slug}-copy`);
    for (let n = 2; reserved.includes(slug); n++) slug = this.uniqueSlug(`${p.slug}-copy-${n}`);
    const stamp = Date.now().toString(36);
    const sku = `${p.sku.split('-').slice(0, 2).join('-')}-C${stamp.slice(-4).toUpperCase()}${Math.random().toString(36).slice(2, 4).toUpperCase()}`;
    return {
      ...p,
      id: `c-${stamp}-${Math.random().toString(36).slice(2, 6)}`,
      slug,
      sku,
      name: `${p.name} (Copy)`,
      variants: makeVariants(sku, p.availableSizes, p.colors, p.stock),
      createdAt: Date.now(),
      ...patch,
    };
  }

  /** Add several new products in one write (used by "duplicate category with its products"). */
  async addProducts(list: Product[]) {
    this.po = { ...this.po, added: [...this.po.added, ...list] };
    await this.persist();
  }

  async saveProduct(p: Product) {
    const origin = this.originOf(p.id);
    if (origin === 'added') this.po = { ...this.po, added: this.po.added.map((x) => (x.id === p.id ? p : x)) };
    else if (baseProducts.some((b) => b.id === p.id)) this.po = { ...this.po, edited: { ...this.po.edited, [p.id]: p } };
    else this.po = { ...this.po, added: [...this.po.added, p] };
    await this.persist();
  }

  async deleteProduct(id: string) {
    if (this.originOf(id) === 'added') this.po = { ...this.po, added: this.po.added.filter((p) => p.id !== id) };
    else {
      const { [id]: _drop, ...rest } = this.po.edited;
      void _drop;
      this.po = { ...this.po, edited: rest, deleted: [...new Set([...this.po.deleted, id])] };
    }
    await this.persist();
  }

  /** Undo an edit to a built-in product */
  async resetProduct(id: string) {
    const { [id]: _drop, ...rest } = this.po.edited;
    void _drop;
    this.po = { ...this.po, edited: rest };
    await this.persist();
  }

  async restoreDeleted() {
    this.po = { ...this.po, deleted: [] };
    await this.persist();
  }

  private setCo(seg: Segment, next: CategoryOverrides) {
    this.co = { ...this.co, [seg]: next };
  }

  async saveCategory(def: WomenCategoryDef, seg: Segment = 'women') {
    const co = this.co[seg];
    if (BASE_CATEGORIES[seg].some((c) => c.slug === def.slug)) this.setCo(seg, { ...co, edited: { ...co.edited, [def.slug]: def } });
    else if (co.added.some((c) => c.slug === def.slug)) this.setCo(seg, { ...co, added: co.added.map((c) => (c.slug === def.slug ? def : c)) });
    else this.setCo(seg, { ...co, added: [...co.added, { ...def, custom: true }] });
    await this.persist();
  }

  async resetCategory(slug: string, seg: Segment = 'women') {
    const co = this.co[seg];
    const { [slug]: _drop, ...rest } = co.edited;
    void _drop;
    this.setCo(seg, { ...co, edited: rest });
    await this.persist();
  }

  async deleteCategory(slug: string, seg: Segment = 'women') {
    const co = this.co[seg];
    this.setCo(seg, { ...co, added: co.added.filter((c) => c.slug !== slug) });
    await this.persist();
  }

  /** Move a category one step up (-1) or down (+1) in the display order. */
  async moveCategory(slug: string, dir: -1 | 1, seg: Segment = 'women') {
    const order = this.categoriesBy[seg].filter((c) => c.slug !== 'all').map((c) => c.slug);
    const i = order.indexOf(slug);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= order.length) return;
    [order[i], order[j]] = [order[j], order[i]];
    this.setCo(seg, { ...this.co[seg], order });
    await this.persist();
  }

  /** Save the homepage tile for a main category (only the given fields override the built-in). */
  async saveHomeTile(slug: string, edit: HomeTileEdit) {
    this.ho = { ...this.ho, tiles: { ...this.ho.tiles, [slug]: edit } };
    await this.persist();
  }

  async resetHomeTile(slug: string) {
    const { [slug]: _drop, ...rest } = this.ho.tiles;
    void _drop;
    this.ho = { ...this.ho, tiles: rest };
    await this.persist();
  }

  isHomeSectionEdited(key: HomeSectionKey) {
    return !!this.ho.sections?.[key];
  }

  async saveHomeSection<K extends HomeSectionKey>(key: K, value: HomeContent[K]) {
    this.ho = { ...this.ho, sections: { ...this.ho.sections, [key]: value } };
    await this.persist();
  }

  async resetHomeSection(key: HomeSectionKey) {
    const { [key]: _drop, ...rest } = this.ho.sections ?? {};
    void _drop;
    this.ho = { ...this.ho, sections: rest };
    await this.persist();
  }

  isCollectionEdited(slug: string) {
    return !!this.ho.collections?.[slug];
  }

  async saveCollection(slug: string, edit: CollectionEdit) {
    this.ho = { ...this.ho, collections: { ...this.ho.collections, [slug]: edit } };
    await this.persist();
  }

  async resetCollection(slug: string) {
    const { [slug]: _drop, ...rest } = this.ho.collections ?? {};
    void _drop;
    this.ho = { ...this.ho, collections: rest };
    await this.persist();
  }

  /** Homepage hero slides, with admin edits */
  get heroSlides(): HeroSlide[] {
    return this.ho.hero?.length ? this.ho.hero : defaultHeroSlides;
  }
  get isHeroEdited() {
    return !!this.ho.hero?.length;
  }

  async saveHero(slides: HeroSlide[]) {
    this.ho = { ...this.ho, hero: slides };
    await this.persist();
  }

  async resetHero() {
    const { hero: _drop, ...rest } = this.ho;
    void _drop;
    this.ho = rest;
    await this.persist();
  }

  /** Hand-picked New Arrivals (still existing products only), in display order. */
  get newArrivalPicks(): Product[] {
    return (this.ho.newArrivals ?? []).map((id) => this.products.find((p) => p.id === id)).filter((p): p is Product => !!p);
  }

  /** Set the homepage New Arrivals; an empty list switches back to automatic. */
  async saveNewArrivals(ids: string[]) {
    this.ho = { ...this.ho, newArrivals: ids.slice(0, NEW_ARRIVALS_MAX) };
    await this.persist();
  }

  /** Move edits left in this browser (IndexedDB) to the shared dev-server storage. */
  async migrateLocalToServer() {
    if (this.mode !== 'server') return;
    const [po, co, cm, ho, images] = await Promise.all([
      idb.get<ProductOverrides>('kv', 'products'),
      idb.get<CategoryOverrides>('kv', 'categories'),
      idb.get<CategoryOverrides>('kv', 'menCategories'),
      idb.get<HomeOverrides>('kv', 'home'),
      idb.entries<Blob>('images'),
    ]);
    const blobs = new Map(images);
    const local: SavedState = { products: { ...EMPTY_PRODUCTS, ...po }, categories: { ...EMPTY_CATEGORIES, ...co }, menCategories: { ...EMPTY_CATEGORIES, ...cm }, home: { ...EMPTY_HOME, ...ho } };
    for (const id of imageIdsIn(local)) {
      const blob = blobs.get(id);
      if (blob) await this.uploadToServer(id, blob);
    }
    const moved = mapImageRefs(local, uploadUrl);
    this.po = mergeProducts(this.po, moved.products);
    this.co = { women: mergeCategories(this.co.women, moved.categories), men: mergeCategories(this.co.men, moved.menCategories ?? EMPTY_CATEGORIES) };
    this.ho = { tiles: { ...this.ho.tiles, ...moved.home?.tiles }, newArrivals: this.ho.newArrivals?.length ? this.ho.newArrivals : moved.home?.newArrivals,
      hero: this.ho.hero ?? moved.home?.hero,
      sections: { ...moved.home?.sections, ...this.ho.sections },
      collections: { ...moved.home?.collections, ...this.ho.collections },
    };
    await this.persist();
    await Promise.all([idb.clear('kv'), idb.clear('images')]);
    this.localPending = null;
    this.rebuild();
  }

  async exportBundle(): Promise<ExportBundle> {
    const images: Record<string, string> = {};
    const state = { products: this.po, categories: this.co.women, menCategories: this.co.men, home: this.ho };
    for (const id of imageIdsIn(state)) {
      const href = this.idbUrls.get(id) ?? uploadUrl(id);
      try {
        images[id] = await blobToDataUrl(await (await fetch(href)).blob());
      } catch {
        /* missing image — skip */
      }
    }
    return { format: 'brk-admin-export', version: 1, exportedAt: new Date().toISOString(), ...mapImageRefs(state, (id) => `idb:${id}`), images };
  }

  async importBundle(bundle: ExportBundle) {
    if (bundle?.format !== 'brk-admin-export') throw new Error('Not a BRK admin export file');
    await this.resetAll(false);
    for (const [id, dataUrl] of Object.entries(bundle.images ?? {})) await this.storeImage(id, await (await fetch(dataUrl)).blob());
    const raw: SavedState = { products: bundle.products, categories: bundle.categories, menCategories: bundle.menCategories, home: bundle.home };
    const state = this.mode === 'server' ? mapImageRefs(raw, uploadUrl) : raw;
    this.applyState(state);
    await this.persist();
  }

  async resetAll(rebuild = true) {
    if (this.mode === 'server') await fetch('/__admin/reset', { method: 'POST' });
    await Promise.all([idb.clear('kv'), idb.clear('images')]).catch(() => undefined);
    this.idbUrls.forEach((u) => URL.revokeObjectURL(u));
    this.idbUrls.clear();
    this.po = EMPTY_PRODUCTS;
    this.co = { women: EMPTY_CATEGORIES, men: EMPTY_CATEGORIES };
    this.ho = EMPTY_HOME;
    this.localPending = null;
    if (rebuild) this.rebuild();
  }

  /* ---------------- internals ---------------- */

  private applyState(s: Partial<SavedState>) {
    this.po = { ...EMPTY_PRODUCTS, ...s.products };
    this.co = { women: { ...EMPTY_CATEGORIES, ...s.categories }, men: { ...EMPTY_CATEGORIES, ...s.menCategories } };
    this.ho = { ...EMPTY_HOME, ...s.home };
  }

  private async storeImage(id: string, blob: Blob): Promise<string> {
    if (this.mode === 'server') return this.uploadToServer(id, blob);
    await idb.set('images', id, blob);
    this.idbUrls.set(id, URL.createObjectURL(blob));
    return `idb:${id}`;
  }

  private async uploadToServer(id: string, blob: Blob): Promise<string> {
    const res = await fetch(`/__admin/images/${id}`, { method: 'PUT', body: blob, headers: { 'Content-Type': 'image/webp' } });
    if (!res.ok) throw new Error(`Upload failed (${res.status})`);
    return uploadUrl(id);
  }

  private async persist() {
    const state: SavedState = { products: this.po, categories: this.co.women, menCategories: this.co.men, home: this.ho };
    if (this.mode === 'server') {
      const res = await fetch('/__admin/data', { method: 'PUT', body: JSON.stringify(state), headers: { 'Content-Type': 'application/json' } });
      if (!res.ok) throw new Error(`Save failed (${res.status})`);
    } else {
      await idb.set('kv', 'products', this.po);
      await idb.set('kv', 'categories', this.co.women);
      await idb.set('kv', 'menCategories', this.co.men);
      await idb.set('kv', 'home', this.ho);
    }
    this.rebuild();
  }

  private rebuild() {
    const deleted = new Set(this.po.deleted);
    this.products = [...baseProducts.filter((p) => !deleted.has(p.id)).map((p) => this.po.edited[p.id] ?? p), ...this.po.added];
    for (const seg of ['women', 'men'] as const) {
      const co = this.co[seg];
      const cats = [...BASE_CATEGORIES[seg].map((c) => co.edited[c.slug] ?? c), ...co.added];
      const order = co.order ?? [];
      const rank = (slug: string) => (slug === 'all' ? -1 : order.includes(slug) ? order.indexOf(slug) : order.length + cats.findIndex((c) => c.slug === slug));
      this.categoriesBy = { ...this.categoriesBy, [seg]: [...cats].sort((a, b) => rank(a.slug) - rank(b.slug)) };
    }
    this.mainCategories = baseMainCategories.map((c) => ({ ...c, ...this.ho.tiles[c.slug] }));
    this.collections = baseCollections.map((c) => ({ ...c, ...this.ho.collections?.[c.slug] }));
    this.homeContent = { ...defaultHomeContent, ...this.ho.sections };
    this.version += 1;
    this.listeners.forEach((l) => l());
  }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}

export const catalogStore = new CatalogStore();
