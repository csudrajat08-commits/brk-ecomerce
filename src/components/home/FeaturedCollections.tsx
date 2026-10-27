import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { useCollections, useHomeContent } from '../../hooks/useCatalog';
import { catalogStore } from '../../services/catalogStore';
import { cn, pad2 } from '../../lib/format';
import { Img } from '../ui/Img';
import { RichTitle } from '../ui/RichTitle';
import { SectionHeading } from './SectionHeading';

const pieceCount = (slug: string) => catalogStore.products.filter((p) => p.collection === slug).length;

/**
 * Typographic index of collections. On desktop, hovering a row swaps the
 * sticky preview image; on mobile each row carries its own image.
 */
export function FeaturedCollections() {
  const [active, setActive] = useState(0);
  const collections = useCollections();
  const copy = useHomeContent().collections;
  const current = collections[active] ?? collections[0];

  return (
    <section className="py-20 md:py-28 lg:py-36" aria-labelledby="collections-title">
      <div className="container-brk">
        <SectionHeading
          index="04"
          eyebrow="Featured collections"
          title={
            <span id="collections-title">
              <RichTitle text={copy.title} />
            </span>
          }
          aside={
            <Link to="/collections" className="link-under text-xs tracking-[0.16em] uppercase">
              All collections
            </Link>
          }
        />

        <div className="mt-12 grid gap-10 md:mt-16 lg:grid-cols-12 lg:gap-16">
          <ol className="lg:col-span-7">
            {collections.map((c, i) => (
              <li key={c.slug} className="border-t border-ink/15 last:border-b">
                <Link
                  to={`/shop?collection=${c.slug}`}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  data-touch-hover
                  className="group grid grid-cols-[2.25rem_1fr_auto] items-center gap-x-4 py-6 md:grid-cols-[3rem_1fr_auto] md:py-8"
                >
                  <span className="self-start pt-2 text-xs text-stone tabular-nums">{pad2(i + 1)}</span>
                  <span>
                    <span className="eyebrow block text-[0.62rem] text-bronze">{c.kicker}</span>
                    <span
                      className={cn(
                        'mt-2 block font-serif text-[1.9rem] leading-[1.05] transition-all duration-500 md:text-5xl',
                        active === i ? 'lg:translate-x-3 lg:italic' : 'lg:text-ink/45',
                        'group-inview:translate-x-2 group-inview:italic',
                      )}
                    >
                      {c.name}
                    </span>
                    <span className="mt-2 block max-w-md text-sm text-stone lg:hidden">{c.description}</span>
                  </span>
                  <span className="flex items-center gap-3 self-start pt-2 text-xs text-stone">
                    <span className="hidden tabular-nums sm:inline">{pieceCount(c.slug)} pieces</span>
                    <ArrowUpRight size={18} strokeWidth={1} className={cn('transition-all duration-500', active === i ? 'text-ink lg:rotate-45' : '', 'group-inview:rotate-45 group-inview:text-ink')} />
                  </span>
                  {/* Mobile/tablet: inline image */}
                  <span className="col-span-3 mt-5 block lg:hidden">
                    <span className="relative block aspect-[4/3] overflow-hidden bg-sand sm:aspect-[16/9]">
                      <Img asset={c.image} sizes="100vw" className="transition-transform duration-[1.4s] ease-[var(--ease-editorial)] group-inview:scale-105" />
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>

          {/* Desktop sticky preview */}
          <div className="hidden lg:col-span-5 lg:block">
            <div className="sticky top-28">
              <div className="relative aspect-[4/5] overflow-hidden bg-sand">
                <AnimatePresence initial={false}>
                  <motion.div
                    key={current.slug}
                    className="absolute inset-0"
                    initial={{ clipPath: 'inset(0 0 100% 0)' }}
                    animate={{ clipPath: 'inset(0 0 0% 0)' }}
                    exit={{ opacity: 0, transition: { delay: 0.5, duration: 0.2 } }}
                    transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Img asset={current.image} sizes="40vw" />
                  </motion.div>
                </AnimatePresence>
              </div>
              <AnimatePresence mode="wait">
                <motion.p
                  key={current.slug}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mt-5 max-w-sm text-sm leading-relaxed text-stone"
                >
                  {current.description}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
