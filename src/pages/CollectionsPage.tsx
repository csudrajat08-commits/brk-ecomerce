import { ArrowUpRight } from 'lucide-react';
import { useEffect } from 'react';
import { Link } from 'react-router';
import { CatalogHeader } from '../components/catalog/CatalogHeader';
import { PageTop } from '../components/layout/Layout';
import { Img } from '../components/ui/Img';
import { Reveal } from '../components/ui/Reveal';

import { useProducts, useCollections } from '../hooks/useCatalog';
import { cn, pad2 } from '../lib/format';

/** /collections — every curated collection, alternating editorial rows. */
export default function CollectionsPage() {
  const { data: all } = useProducts({});
  const collections = useCollections();
  const count = (slug: string) => all.filter((p) => p.collection === slug).length;

  useEffect(() => {
    document.title = 'Collections — Batik Riana Kesuma';
  }, []);

  return (
    <PageTop>
      <CatalogHeader
        id="collections"
        eyebrow="Curated chapters"
        title="Collections"
        description="From the Indonesia Fashion Week runway to everyday encim — each collection tells one part of the BRK story."
        count={collections.length}
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Collections' }]}
      />
      <div className="container-brk space-y-16 pt-10 pb-24 md:space-y-24 md:pt-16">
        {collections.map((c, i) => (
          <Reveal key={c.slug}>
            <Link to={`/shop?collection=${c.slug}`} className="group grid items-center gap-6 md:grid-cols-12 md:gap-10" data-touch-hover>
              <div className={cn('relative aspect-[4/5] overflow-hidden bg-sand md:col-span-6 lg:col-span-5', i % 2 === 1 && 'md:order-2 md:col-start-7 lg:col-start-8')}>
                <Img
                  asset={c.image}
                  sizes="(min-width:1024px) 40vw, (min-width:768px) 50vw, 100vw"
                  className="transition-transform duration-[1.4s] ease-[var(--ease-editorial)] group-hover:scale-[1.04] group-inview:scale-[1.04]"
                />
              </div>
              <div className={cn('md:col-span-6 lg:col-span-6', i % 2 === 1 ? 'md:order-1 lg:col-start-1' : 'lg:col-start-7')}>
                <p className="flex items-center gap-3 text-xs text-stone tabular-nums">
                  {pad2(i + 1)} <span className="h-px w-8 bg-ink/25" /> <span className="eyebrow text-bronze">{c.kicker}</span>
                </p>
                <h2 className="display mt-4 text-4xl md:text-5xl xl:text-6xl">
                  <span className="link-draw">{c.name}</span>
                </h2>
                <p className="mt-5 max-w-md text-[0.95rem] leading-relaxed text-ink/75">{c.description}</p>
                <p className="mt-7 inline-flex items-center gap-2 text-xs tracking-[0.14em] uppercase">
                  Shop {count(c.slug)} {count(c.slug) === 1 ? 'piece' : 'pieces'}
                  <ArrowUpRight size={15} strokeWidth={1.25} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </PageTop>
  );
}
