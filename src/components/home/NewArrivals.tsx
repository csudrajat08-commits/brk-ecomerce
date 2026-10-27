import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { useCatalogVersion, useHomeContent, useProducts } from '../../hooks/useCatalog';
import { useRail } from '../../hooks/useRail';
import { cn } from '../../lib/format';
import { catalogStore, NEW_ARRIVALS_MAX, newestFirst } from '../../services/catalogStore';
import type { CategorySlug } from '../../types/commerce';
import { ProductCard } from '../product/ProductCard';
import { Reveal } from '../ui/Reveal';
import { RichTitle } from '../ui/RichTitle';
import { SectionHeading } from './SectionHeading';

const tabs: Array<{ label: string; value?: CategorySlug }> = [
  { label: 'All' },
  { label: 'Women', value: 'women' },
  { label: 'Kebaya', value: 'kebaya-traditional' },
  { label: 'Men', value: 'men' },
  { label: 'Accessories', value: 'shawls-accessories' },
];

export function NewArrivals() {
  const tabRail = useRail<HTMLDivElement>();
  const [tab, setTab] = useState<CategorySlug | undefined>(undefined);
  const { data: auto, loading } = useProducts({ newArrival: true, category: tab, sort: 'featured' });
  useCatalogVersion();
  const copy = useHomeContent().newArrivals;
  // Hand-picked in the admin (Homepage tab) wins; otherwise newest-added first, then featured
  const picked = catalogStore.newArrivalPicks.filter((p) => !tab || p.category === tab);
  const items = picked.length ? picked : newestFirst(auto).slice(0, NEW_ARRIVALS_MAX);

  return (
    <section className="bg-paper py-20 md:py-28" aria-labelledby="new-arrivals">
      <div className="container-brk">
        <SectionHeading
          index="02"
          eyebrow="Just in"
          title={
            <span id="new-arrivals">
              <RichTitle text={copy.title} />
            </span>
          }
          aside={
            <div className="flex flex-col items-start gap-5 md:items-end">
              {/* Phones: the row scrolls (drag or swipe); the faded right edge shows there is more */}
              <div
                ref={tabRail.ref}
                role="tablist"
                aria-label="Filter new arrivals"
                className={cn(
                  'scrollbar-none -mx-5 flex max-w-[100vw] cursor-grab gap-1 overflow-x-auto overscroll-x-contain px-5 select-none md:mx-0 md:cursor-auto md:px-0',
                  tabRail.canNext && 'max-md:[mask-image:linear-gradient(to_right,black_80%,transparent)]',
                )}
              >
                {tabs.map((t) => (
                  <button
                    key={t.label}
                    role="tab"
                    type="button"
                    aria-selected={tab === t.value}
                    onClick={() => setTab(t.value)}
                    className={cn(
                      'h-9 shrink-0 px-4 text-xs tracking-[0.12em] uppercase transition-colors',
                      tab === t.value ? 'bg-ink text-ivory' : 'text-ink/70 hover:text-ink',
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          }
        />

        <div className={cn('mt-12 grid grid-cols-2 gap-x-3 gap-y-12 transition-opacity duration-300 md:gap-x-6 lg:grid-cols-4 lg:gap-y-16', loading && 'opacity-50')}>
          {items.map((p, i) => (
            <Reveal key={p.id} delay={(i % 4) * 0.07} className={cn(i % 4 === 1 && 'lg:mt-14', i % 4 === 3 && 'lg:mt-7')}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
        {!loading && items.length === 0 && <p className="mt-12 text-sm text-stone">No new pieces in this category yet — explore the full collection instead.</p>}

        <div className="mt-16 flex justify-center">
          <Link to={tab ? `/shop/${tab}?new=1` : '/shop?new=1'} className="btn-outline group">
            View all new arrivals <ArrowRight size={15} strokeWidth={1.25} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
