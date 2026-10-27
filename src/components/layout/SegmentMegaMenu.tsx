import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { SEGMENTS } from '../../data/segments';
import { useProducts, useSegmentCategories } from '../../hooks/useCatalog';
import { catalogStore } from '../../services/catalogStore';
import type { Segment } from '../../types/commerce';
import { FitImg } from '../ui/FitImg';

/** Desktop dropdown under "Women" / "Men": jump straight to a category. */
export function SegmentMegaMenu({ segment, onNavigate }: { segment: Segment | null; onNavigate: () => void }) {
  const open = !!segment;
  const seg = SEGMENTS[segment ?? 'women'];
  const tiles = useSegmentCategories(segment ?? 'women').filter((c) => c.slug !== 'all');
  const { data: women } = useProducts({ segment: segment ?? 'women' });
  const count = (slug: string) => women.filter((p) => p.subcategory === slug).length;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key={segment}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-x-0 top-full border-y border-ink/10 bg-ivory text-ink shadow-[0_24px_40px_-24px_rgba(36,36,36,.25)]"
        >
          <div className="container-brk grid grid-cols-[220px_1fr] gap-10 py-8">
            <div className="flex flex-col">
              <p className="eyebrow text-bronze">{seg.collection}</p>
              <ul className="mt-5 space-y-2.5 text-sm">
                {tiles.map((c) => (
                  <li key={c.slug}>
                    <Link to={`${seg.path}/${c.slug}`} onClick={onNavigate} className="group flex justify-between gap-4 hover:text-bronze">
                      <span className="link-draw">{c.label}</span>
                      <span className="text-xs text-stone tabular-nums">{count(c.slug)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link to={seg.path} onClick={onNavigate} className="mt-auto inline-flex items-center gap-2 pt-6 text-xs tracking-[0.14em] uppercase hover:text-bronze">
                Explore {seg.label} <ArrowRight size={13} strokeWidth={1.25} />
              </Link>
            </div>
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.max(4, Math.min(tiles.length, 5))}, minmax(0, 1fr))` }}>
              {tiles.slice(0, 5).map((c) => {
                const cover = catalogStore.coverOf(c, segment ?? 'women');
                return (
                  <Link key={c.slug} to={`${seg.path}/${c.slug}`} onClick={onNavigate} className="group block">
                    <div className="relative aspect-[3/4] overflow-hidden bg-sand">
                      {cover && <FitImg asset={cover} frameRatio={3 / 4} sizes="200px" className="transition-transform duration-700 group-hover:scale-[1.04]" />}
                    </div>
                    <p className="mt-2.5 text-sm">{c.label}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
