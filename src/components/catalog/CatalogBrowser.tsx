import { AnimatePresence, motion } from 'motion/react';
import { LayoutGrid, List, SlidersHorizontal, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { activeFilterCount, colorFamiliesOf, EMPTY_FILTERS, filterCatalog, WOMEN_SIZES, type CatalogFilters, type CatalogSort } from '../../data/womenCatalog';
import { useRail } from '../../hooks/useRail';
import { useEscape, useLockBody } from '../../hooks/useUi';
import { cn, formatIDR } from '../../lib/format';
import type { Product } from '../../types/commerce';
import { ProductCard } from '../product/ProductCard';
import { CatalogHeader } from './CatalogHeader';
import { FilterPanel, type CatalogNavItem } from './FilterPanel';
import { ProductListRow } from './ProductListRow';
import { SortMenu } from './SortMenu';

const VIEW_KEY = 'brk.catalog.view';
const STEP = 50_000;
const SIZE_ORDER = ['S', 'M', 'L', 'XL', 'XXL', 'One Size', '2 m', '2.5 m'];

function readView(): 'grid' | 'list' {
  try {
    return localStorage.getItem(VIEW_KEY) === 'list' ? 'list' : 'grid';
  } catch {
    return 'grid';
  }
}

interface Props {
  /** Changes when the listing changes — resets filters and replays the header */
  id: string;
  header: { eyebrow: string; title: string; description?: string };
  crumbs: Array<{ label: string; to?: string }>;
  /** Products in this listing (already scoped to the category / collection / search) */
  products: Product[];
  /** Wider set the price slider spans (e.g. the whole segment), so bounds stay stable while browsing */
  priceScope?: Product[];
  nav: CatalogNavItem[];
  navTitle?: string;
  activeKey: string;
  loading?: boolean;
  /** Shown instead of the grid when the listing itself is empty */
  empty?: ReactNode;
}

/**
 * Shared catalogue listing: compact header, category chips (phones/tablets),
 * filter sidebar or drawer, sort, grid/list toggle and synced photo cycling.
 * Used by the women's catalogue and the general /shop pages.
 */
export function CatalogBrowser({ id, header, crumbs, products, priceScope, nav, navTitle, activeKey, loading, empty }: Props) {
  const chipRail = useRail<HTMLElement>();
  const [filters, setFilters] = useState<CatalogFilters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<CatalogSort>('newest');
  const [view, setView] = useState<'grid' | 'list'>(readView);
  const [drawer, setDrawer] = useState(false);
  const closeDrawer = useCallback(() => setDrawer(false), []);
  useLockBody(drawer);
  useEscape(drawer, closeDrawer);

  useEffect(() => {
    try {
      localStorage.setItem(VIEW_KEY, view);
    } catch {
      /* ignore */
    }
  }, [view]);

  useEffect(() => {
    document.title = `${header.title} — Batik Riana Kesuma`;
  }, [header.title]);

  const priceBounds = useMemo<[number, number]>(() => {
    const scope = priceScope?.length ? priceScope : products;
    if (!scope.length) return [0, 1_000_000];
    const prices = scope.map((p) => p.price);
    return [Math.floor(Math.min(...prices) / STEP) * STEP, Math.ceil(Math.max(...prices) / STEP) * STEP];
  }, [priceScope, products]);

  const sizes = useMemo(() => {
    const set = new Set(products.flatMap((p) => p.availableSizes));
    const list = SIZE_ORDER.filter((s) => set.has(s));
    return list.length ? list : WOMEN_SIZES;
  }, [products]);

  const results = useMemo(() => filterCatalog(products, filters, sort), [products, filters, sort]);
  const availableColors = useMemo(() => [...new Set(products.flatMap(colorFamiliesOf))], [products]);
  const activeCount = activeFilterCount(filters);

  const chips = [
    ...filters.sizes.map((v) => ({ label: `Size ${v}`, remove: () => setFilters({ ...filters, sizes: filters.sizes.filter((x) => x !== v) }) })),
    ...filters.colors.map((v) => ({ label: v, remove: () => setFilters({ ...filters, colors: filters.colors.filter((x) => x !== v) }) })),
    ...filters.motifs.map((v) => ({ label: v, remove: () => setFilters({ ...filters, motifs: filters.motifs.filter((x) => x !== v) }) })),
    ...(filters.price ? [{ label: `${formatIDR(filters.price[0])} – ${formatIDR(filters.price[1])}`, remove: () => setFilters({ ...filters, price: null }) }] : []),
  ];
  const clearAll = () => setFilters(EMPTY_FILTERS);

  const panel = (onNavigate?: () => void) => (
    <FilterPanel
      filters={filters}
      onChange={setFilters}
      priceBounds={priceBounds}
      nav={nav}
      navTitle={navTitle}
      activeKey={activeKey}
      sizes={sizes}
      availableColors={availableColors}
      onNavigate={onNavigate}
    />
  );

  return (
    <>
      {/* No hero here — products come straight after the title */}
      <CatalogHeader id={id} eyebrow={header.eyebrow} title={header.title} description={header.description} count={products.length} crumbs={crumbs} />

      {/* Mobile / tablet: category chips under the title */}
      <nav ref={chipRail.ref} aria-label="Categories" className="scrollbar-none container-brk mt-5 flex cursor-grab gap-2 overflow-x-auto overscroll-x-contain select-none lg:hidden">
        {nav.map((c) => (
          <Link
            key={c.key}
            to={c.to}
            aria-current={activeKey === c.key ? 'page' : undefined}
            className={cn(
              'shrink-0 border px-4 py-2 text-xs whitespace-nowrap transition-colors active:scale-95',
              activeKey === c.key ? 'border-ink bg-ink text-ivory' : 'border-ink/20 text-ink/75',
            )}
          >
            {c.label}
          </Link>
        ))}
      </nav>

      <div className="container-brk grid gap-10 pt-6 pb-24 lg:grid-cols-[220px_1fr] lg:gap-14 lg:pt-10">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block" aria-label="Filters">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2 pb-8">
            <div className="mb-6 flex items-baseline justify-between">
              <h2 className="font-serif text-2xl">Filter</h2>
              {activeCount > 0 && (
                <button type="button" onClick={clearAll} className="text-xs text-stone underline underline-offset-4 hover:text-ink">
                  Clear all
                </button>
              )}
            </div>
            {panel()}
          </div>
        </aside>

        <div className="min-w-0">
          {/* Toolbar — Filter and Sort side by side on every screen */}
          <div className="flex items-center justify-between gap-3 border-b border-ink/10 pb-4">
            <div className="flex min-w-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setDrawer(true)}
                className="inline-flex h-10 shrink-0 items-center gap-2 border border-ink/25 px-3 text-xs tracking-[0.12em] uppercase transition-transform active:scale-95 lg:hidden"
              >
                <SlidersHorizontal size={14} strokeWidth={1.25} /> Filter
                {activeCount > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[0.6rem] text-ivory">{activeCount}</span>}
              </button>
              <SortMenu value={sort} onChange={setSort} className="lg:hidden" />
              <p className="hidden text-sm text-stone lg:block" aria-live="polite">
                <span className="text-ink tabular-nums">{results.length}</span> {results.length === 1 ? 'product' : 'products'}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <SortMenu value={sort} onChange={setSort} className="hidden lg:block" />
              <div className="flex" role="group" aria-label="View">
                {(['grid', 'list'] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setView(v)}
                    aria-pressed={view === v}
                    aria-label={v === 'grid' ? 'Grid view' : 'List view'}
                    className={cn('-ml-px flex h-10 w-10 items-center justify-center border transition-colors', view === v ? 'border-ink bg-ink text-ivory' : 'border-ink/20 hover:border-ink')}
                  >
                    {v === 'grid' ? <LayoutGrid size={15} strokeWidth={1.25} /> : <List size={15} strokeWidth={1.25} />}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <p className="pt-3 text-xs text-stone lg:hidden">
            <span className="text-ink tabular-nums">{results.length}</span> {results.length === 1 ? 'product' : 'products'}
          </p>

          {/* Active filters */}
          {chips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-4">
              {chips.map((c) => (
                <button key={c.label} type="button" onClick={c.remove} className="inline-flex items-center gap-1.5 bg-mist px-3 py-1.5 text-xs transition-colors hover:bg-sand" aria-label={`Remove filter ${c.label}`}>
                  {c.label} <X size={12} strokeWidth={1.5} />
                </button>
              ))}
              <button type="button" onClick={clearAll} className="ml-1 text-xs text-stone underline underline-offset-4 hover:text-ink">
                Clear all
              </button>
            </div>
          )}

          {/* Results */}
          {!loading && products.length === 0 && empty ? (
            empty
          ) : !loading && results.length === 0 ? (
            <div className="py-24 text-center">
              <p className="font-serif text-3xl">No pieces match these filters.</p>
              <p className="mt-3 text-sm text-stone">Try removing a filter, or browse all of {header.title}.</p>
              <button type="button" onClick={clearAll} className="btn-outline mt-8">
                Clear all filters
              </button>
            </div>
          ) : view === 'grid' ? (
            <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 md:grid-cols-3 xl:grid-cols-4 xl:gap-x-6 xl:gap-y-14 3xl:grid-cols-5">
              {results.map((p, i) => (
                <motion.div key={p.id} layout="position" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: Math.min(i, 8) * 0.04 }}>
                  <ProductCard product={p} sizes="(min-width:1280px) 22vw, (min-width:768px) 30vw, 50vw" priority={i < 4} cyclePhotos />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="mt-2">
              {results.map((p) => (
                <ProductListRow key={p.id} product={p} cyclePhotos />
              ))}
            </div>
          )}

          <p className="mt-16 text-center text-[0.68rem] tracking-[0.06em] text-stone">
            Sample catalogue for presentation — names, prices and stock are demonstration data, not verified BRK inventory.
          </p>
        </div>
      </div>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {drawer && (
          <motion.div className="fixed inset-0 z-50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-ink/40" onClick={closeDrawer} />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Filters"
              className="absolute inset-y-0 left-0 flex w-full max-w-[400px] flex-col bg-ivory"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex h-16 shrink-0 items-center justify-between border-b border-ink/10 px-5">
                <h2 className="font-serif text-2xl">Filter</h2>
                <button type="button" onClick={closeDrawer} className="-mr-2 p-2" aria-label="Close filters">
                  <X size={20} strokeWidth={1.25} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-6">{panel(closeDrawer)}</div>
              <div className="grid shrink-0 grid-cols-2 gap-3 border-t border-ink/10 p-5">
                <button type="button" onClick={clearAll} disabled={activeCount === 0} className="btn-outline px-3">
                  Clear all
                </button>
                <button type="button" onClick={closeDrawer} className="btn-ink px-3">
                  Show {results.length}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
