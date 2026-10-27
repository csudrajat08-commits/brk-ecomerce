import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router';
import { useHomeContent, useMainCategories } from '../../hooks/useCatalog';
import { useRail } from '../../hooks/useRail';
import { cn, pad2 } from '../../lib/format';
import type { Category } from '../../types/commerce';
import { Img } from '../ui/Img';
import { RichTitle } from '../ui/RichTitle';
import { Reveal } from '../ui/Reveal';
import { SectionHeading } from './SectionHeading';
import { categoryPath } from '../../data/catalog';

/**
 * Desktop: asymmetric 12-col mosaic — one dominant portrait, two tall
 * companions, then a wide fabric panel and a square accessory tile.
 * Mobile: a swipeable rail of tall tiles (not a shrunken mosaic).
 */
const layout: Record<string, { cell: string; aspect: string; sizes: string }> = {
  women: { cell: 'lg:col-span-5 lg:row-span-2', aspect: 'lg:aspect-auto lg:h-full', sizes: '(min-width:1024px) 40vw, 80vw' },
  men: { cell: 'lg:col-span-3', aspect: 'lg:aspect-[3/4]', sizes: '(min-width:1024px) 24vw, 80vw' },
  'kebaya-traditional': { cell: 'lg:col-span-4 lg:mt-20', aspect: 'lg:aspect-[3/4]', sizes: '(min-width:1024px) 32vw, 80vw' },
  'batik-fabrics': { cell: 'lg:col-span-4', aspect: 'lg:aspect-[5/4]', sizes: '(min-width:1024px) 32vw, 80vw' },
  'shawls-accessories': { cell: 'lg:col-span-3 lg:mt-14', aspect: 'lg:aspect-[4/5]', sizes: '(min-width:1024px) 24vw, 80vw' },
};

/** Approximate desktop frame of each tile (women fills two rows) — used by the admin preview. */
export const DESKTOP_TILE_ASPECT: Record<string, string> = {
  women: '3 / 5',
  men: '3 / 4',
  'kebaya-traditional': '3 / 4',
  'batik-fabrics': '5 / 4',
  'shawls-accessories': '4 / 5',
};

function Tile({ c, i }: { c: Category; i: number }) {
  const l = layout[c.slug];
  return (
    <Reveal delay={i * 0.06} className={cn('w-[78vw] shrink-0 snap-start sm:w-[46vw] lg:w-auto', l.cell)}>
      <Link to={categoryPath(c.slug)} className="group flex h-full flex-col" data-touch-hover>
        <div className={cn('relative aspect-[3/4] flex-1 overflow-hidden bg-sand', l.aspect)}>
          <Img asset={c.image} sizes={l.sizes} className="transition-transform duration-[1.4s] ease-[var(--ease-editorial)] group-hover:scale-[1.045] group-inview:scale-[1.045]" />
          <div className="absolute inset-0 bg-ink/0 transition-colors duration-700 group-hover:bg-ink/10 group-inview:bg-ink/10" />
        </div>
        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-[0.65rem] tracking-[0.2em] text-stone tabular-nums">{pad2(i + 1)}</p>
            <h3 className="mt-1 font-serif text-2xl leading-tight md:text-[1.75rem]">
              <span className="link-draw">{c.name}</span>
            </h3>
            <p className="mt-1 text-sm text-stone">{c.description}</p>
          </div>
          <ArrowUpRight size={20} strokeWidth={1} className="mt-5 shrink-0 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-inview:translate-x-0.5 group-inview:-translate-y-0.5" />
        </div>
      </Link>
    </Reveal>
  );
}

export function CategoryShowcase() {
  const rail = useRail<HTMLDivElement>();
  const categories = useMainCategories();
  const copy = useHomeContent().categories;
  return (
    <section className="py-20 md:py-28 lg:py-36" aria-labelledby="shop-by-category">
      <div className="container-brk">
        <SectionHeading
          index="01"
          eyebrow="Shop by category"
          title={
            <span id="shop-by-category">
              <RichTitle text={copy.title} breakFrom="md" />
            </span>
          }
          aside={
            <p className="max-w-xs text-sm leading-relaxed text-stone">{copy.intro}</p>
          }
        />
      </div>

      <div className="mt-12 md:mt-16">
        <div
          ref={rail.ref}
          className="scrollbar-none container-brk flex cursor-grab snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto overscroll-x-contain pb-2 select-none md:scroll-px-10 lg:grid lg:cursor-auto lg:grid-cols-12 lg:gap-x-6 lg:gap-y-16 lg:overflow-visible"
          aria-label="Categories"
        >
          {categories.map((c, i) => (
            <Tile key={c.slug} c={c} i={i} />
          ))}
        </div>

        {/* Rail controls — mobile & tablet only */}
        <div className="container-brk mt-6 flex items-center gap-5 lg:hidden">
          <span className="text-xs tabular-nums">{pad2(Math.round(rail.progress * (categories.length - 1)) + 1)}</span>
          <div className="relative h-px flex-1 bg-ink/15" aria-hidden>
            <div
              className="absolute inset-y-0 left-0 bg-ink transition-[width] duration-200"
              style={{ width: `${(1 / categories.length) * 100 + rail.progress * (1 - 1 / categories.length) * 100}%` }}
            />
          </div>
          <span className="text-xs text-stone tabular-nums">{pad2(categories.length)}</span>
          <div className="flex">
            <button
              type="button"
              onClick={() => rail.step(-1)}
              disabled={!rail.canPrev}
              className="flex h-10 w-10 items-center justify-center border border-ink/25 transition-[background-color,color,transform,opacity] active:scale-90 disabled:opacity-30 [@media(hover:hover)]:hover:bg-ink [@media(hover:hover)]:hover:text-ivory"
              aria-label="Previous category"
            >
              <ArrowLeft size={15} strokeWidth={1.25} />
            </button>
            <button
              type="button"
              onClick={() => rail.step(1)}
              disabled={!rail.canNext}
              className="-ml-px flex h-10 w-10 items-center justify-center border border-ink/25 transition-[background-color,color,transform,opacity] active:scale-90 disabled:opacity-30 [@media(hover:hover)]:hover:bg-ink [@media(hover:hover)]:hover:text-ivory"
              aria-label="Next category"
            >
              <ArrowRight size={15} strokeWidth={1.25} />
            </button>
          </div>
        </div>
        <p className="container-brk mt-3 text-[0.68rem] tracking-[0.08em] text-stone lg:hidden">Swipe or drag to see all five categories →</p>
      </div>
    </section>
  );
}
