import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { useEffect, useMemo, type CSSProperties } from 'react';
import { Link } from 'react-router';
import { CatalogHero } from '../components/catalog/CatalogHero';
import { TileSlideshow } from '../components/catalog/TileSlideshow';
import { SectionHeading } from '../components/home/SectionHeading';
import { PageTop } from '../components/layout/Layout';
import { ProductCard } from '../components/product/ProductCard';
import { ImagePlaceholder } from '../components/ui/Img';
import { Reveal } from '../components/ui/Reveal';
import { RichTitle } from '../components/ui/RichTitle';
import { SEGMENTS } from '../data/segments';
import { EMPTY_FILTERS, filterCatalog, type WomenCategoryDef } from '../data/womenCatalog';
import type { ImageAsset, Segment } from '../types/commerce';
import { useProducts, useSegmentCategories } from '../hooks/useCatalog';
import { useRail } from '../hooks/useRail';
import { cn, pad2 } from '../lib/format';
import { catalogStore } from '../services/catalogStore';

/**
 * /women and /men — a segment's landing page. Lets shoppers choose a category
 * (Long Outer, Gown, … / Long Sleeve Shirt, …) before entering its catalogue.
 */
export default function SegmentHubPage({ segment }: { segment: Segment }) {
  const seg = SEGMENTS[segment];
  const categories = useSegmentCategories(segment);
  const hub = categories.find((c) => c.slug === 'all')!;
  const tiles = categories.filter((c) => c.slug !== 'all');
  const rail = useRail<HTMLDivElement>();
  const { data: women } = useProducts({ segment });

  const count = (slug: string) => women.filter((p) => p.subcategory === slug).length;

  /** Each tile cycles through the main photo of every product in its category (newest first). */
  const slidesFor = (c: WomenCategoryDef): ImageAsset[] => {
    const productPhotos = filterCatalog(
      women.filter((p) => p.subcategory === c.slug),
      EMPTY_FILTERS,
      'newest',
    )
      .map((p) => p.images[0])
      .filter((im): im is ImageAsset => !!im && !im.pending);
    const slides = [...(c.cover ? [c.cover] : []), ...productPhotos];
    if (slides.length) return slides;
    const fallback = catalogStore.coverOf(c, segment);
    return fallback ? [fallback] : [];
  };
  const newIn = useMemo(() => filterCatalog(women, EMPTY_FILTERS, 'newest').slice(0, 4), [women]);

  useEffect(() => {
    document.title = `${seg.documentTitle} — Batik Riana Kesuma`;
  }, [seg]);

  return (
    <PageTop>
      <CatalogHero hero={hub.hero} id={`${segment}-hub`} crumbs={[{ label: 'Home', to: '/' }, { label: seg.label }]} count={women.length} />

      {/* Categories */}
      <section className="py-16 md:py-24" aria-labelledby={`${segment}-categories`}>
        <div className="container-brk">
          <SectionHeading
            eyebrow="Shop by category"
            title={
              <span id={`${segment}-categories`}>
                <RichTitle text={seg.tilesTitle} />
              </span>
            }
            aside={
              <Link to={`${seg.path}/all`} className="group inline-flex items-center gap-2 text-xs tracking-[0.16em] uppercase">
                <span className="link-under whitespace-nowrap">{seg.shopAll}</span>
                <ArrowRight size={14} strokeWidth={1.25} className="transition-transform group-hover:translate-x-1" />
              </Link>
            }
          />

        </div>

        <div
          ref={rail.ref}
          aria-label={`${seg.label} categories`}
          className="scrollbar-none container-brk mt-12 flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto overscroll-x-contain pb-2 select-none md:mt-16 md:scroll-px-10 md:gap-5 lg:grid lg:grid-cols-(--tile-cols) lg:gap-x-6 lg:gap-y-14 lg:overflow-visible"
          style={{ '--tile-cols': `repeat(${Math.min(Math.max(tiles.length, 3), 5)}, minmax(0, 1fr))` } as CSSProperties}
        >
          {tiles.map((c, i) => (
            <CategoryTile key={c.slug} c={c} i={i} count={count(c.slug)} slides={slidesFor(c)} path={seg.path} />
          ))}
        </div>

        {/* Rail controls — phones & tablets */}
        {tiles.length > 1 && (
          <div className="container-brk mt-6 flex items-center gap-5 lg:hidden">
            <span className="text-xs tabular-nums">{pad2(Math.round(rail.progress * (tiles.length - 1)) + 1)}</span>
            <div className="relative h-px flex-1 bg-ink/15" aria-hidden>
              <div
                className="absolute inset-y-0 left-0 bg-ink transition-[width] duration-200"
                style={{ width: `${(1 / tiles.length) * 100 + rail.progress * (1 - 1 / tiles.length) * 100}%` }}
              />
            </div>
            <span className="text-xs text-stone tabular-nums">{pad2(tiles.length)}</span>
            <div className="flex">
              <button
                type="button"
                onClick={() => rail.step(-1)}
                disabled={!rail.canPrev}
                className="flex h-10 w-10 items-center justify-center border border-ink/25 transition-[transform,opacity] active:scale-90 disabled:opacity-30"
                aria-label="Previous category"
              >
                <ArrowLeft size={15} strokeWidth={1.25} />
              </button>
              <button
                type="button"
                onClick={() => rail.step(1)}
                disabled={!rail.canNext}
                className="-ml-px flex h-10 w-10 items-center justify-center border border-ink/25 transition-[transform,opacity] active:scale-90 disabled:opacity-30"
                aria-label="Next category"
              >
                <ArrowRight size={15} strokeWidth={1.25} />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* New in */}
      {newIn.length > 0 && (
        <section className="bg-paper py-16 md:py-24" aria-labelledby={`${segment}-new-in`}>
          <div className="container-brk">
            <SectionHeading
              eyebrow="Just in"
              title={<span id={`${segment}-new-in`}>{seg.newIn}</span>}
              aside={
                <Link to={`${seg.path}/all`} className="btn-outline group">
                  View all <ArrowRight size={15} strokeWidth={1.25} className="transition-transform group-hover:translate-x-1" />
                </Link>
              }
            />
            <div className="mt-12 grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-4 md:gap-x-5 lg:gap-x-6">
              {newIn.map((p, i) => (
                <Reveal key={p.id} delay={i * 0.06}>
                  <ProductCard product={p} sizes="(min-width:1024px) 25vw, 50vw" />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </PageTop>
  );
}

/** Same frame for every tile, so any cover photo — uploaded or automatic — sits consistently. */
const TILE_RATIO = 2 / 3;

/** Category tile — uniform 2:3 portrait frames cycling the category's products; alternate tiles dropped slightly on desktop. */
function CategoryTile({ c, i, count, slides, path }: { c: WomenCategoryDef; i: number; count: number; slides: ImageAsset[]; path: string }) {
  return (
    <Reveal delay={i * 0.06} className={cn('w-[44vw] max-w-[260px] shrink-0 snap-start md:w-[30vw] lg:w-auto lg:max-w-none', i % 2 === 1 && 'lg:mt-12')}>
      <Link to={`${path}/${c.slug}`} className="group block" data-touch-hover>
        <div className="relative aspect-[2/3] overflow-hidden bg-sand">
          {slides.length ? (
            <TileSlideshow
              slides={slides}
              frameRatio={TILE_RATIO}
              offset={i * 700}
              sizes="(min-width:1024px) 20vw, (min-width:768px) 30vw, 44vw"
              className="transition-transform duration-[1.4s] ease-[var(--ease-editorial)] group-hover:scale-[1.045] group-inview:scale-[1.045]"
            />
          ) : (
            <ImagePlaceholder label={c.label} />
          )}
          <div className="pointer-events-none absolute inset-0 bg-ink/0 transition-colors duration-700 group-hover:bg-ink/10 group-inview:bg-ink/10" />
        </div>
        <div className="mt-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-[0.65rem] tracking-[0.2em] text-stone tabular-nums">{pad2(i + 1)}</p>
            <h3 className="mt-1 font-serif text-lg leading-tight sm:text-xl md:text-2xl">
              <span className="link-draw">{c.label}</span>
            </h3>
            <p className="mt-1 text-xs text-stone">
              {count} {count === 1 ? 'piece' : 'pieces'}
            </p>
          </div>
          <ArrowUpRight size={18} strokeWidth={1} className="mt-5 shrink-0 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </Link>
    </Reveal>
  );
}
