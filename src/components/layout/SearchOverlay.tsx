import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { useShop } from '../../context/ShopContext';
import { useMainCategories } from '../../hooks/useCatalog';
import { useEscape, useLockBody } from '../../hooks/useUi';
import { formatIDR } from '../../lib/format';
import { getCatalogSnapshot, matchesSearch } from '../../services/catalog';
import { Img } from '../ui/Img';
import { categoryPath } from '../../data/catalog';

const SUGGESTIONS = ['Parang', 'Kawung', 'Sogan', 'Hibiscus', 'Kebaya', 'Silk', 'Indigo', 'Stole'];

export function SearchOverlay() {
  const { searchOpen, setSearchOpen } = useShop();
  const categories = useMainCategories();
  const [term, setTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const close = () => setSearchOpen(false);

  useLockBody(searchOpen);
  useEscape(searchOpen, close);

  useEffect(() => {
    if (searchOpen) {
      setTerm('');
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [searchOpen]);

  const results = useMemo(() => (term.trim().length < 2 ? [] : getCatalogSnapshot().filter((p) => matchesSearch(p, term)).slice(0, 6)), [term]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!term.trim()) return;
    close();
    navigate(`/shop?q=${encodeURIComponent(term.trim())}`);
  };

  return (
    <AnimatePresence>
      {searchOpen && (
        <motion.div className="fixed inset-0 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={close} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Search the collection"
            className="relative max-h-[100svh] overflow-y-auto bg-ivory text-ink"
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="container-brk pt-6 pb-10 md:pt-10 md:pb-14">
              <div className="flex items-center justify-between">
                <span className="eyebrow text-stone">Search the collection</span>
                <button type="button" onClick={close} className="-mr-2 p-2" aria-label="Close search">
                  <X size={20} strokeWidth={1.25} />
                </button>
              </div>
              <form onSubmit={submit} className="mt-6 flex items-center gap-4 border-b border-ink/30 pb-3 focus-within:border-ink">
                <Search size={22} strokeWidth={1.1} className="shrink-0 text-stone" />
                <input
                  ref={inputRef}
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder="Motif, fabric or piece…"
                  className="w-full bg-transparent font-serif text-3xl outline-none placeholder:text-ink/25 md:text-5xl"
                  aria-label="Search"
                />
                <button type="submit" className="shrink-0 p-2 disabled:opacity-30" disabled={!term.trim()} aria-label="See all results">
                  <ArrowRight size={22} strokeWidth={1.1} />
                </button>
              </form>

              {results.length === 0 ? (
                <div className="mt-8 grid gap-8 md:grid-cols-2">
                  <div>
                    <p className="eyebrow mb-4 text-stone">{term.trim().length >= 2 ? `No pieces match “${term}”. Try` : 'Popular searches'}</p>
                    <div className="flex flex-wrap gap-2">
                      {SUGGESTIONS.map((s) => (
                        <button key={s} type="button" onClick={() => setTerm(s)} className="border border-ink/20 px-4 py-2 text-sm transition-colors hover:border-ink hover:bg-ink hover:text-ivory">
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="eyebrow mb-4 text-stone">Categories</p>
                    <ul className="grid grid-cols-2 gap-y-2 text-sm">
                      {categories.map((c) => (
                        <li key={c.slug}>
                          <Link to={categoryPath(c.slug)} onClick={close} className="link-draw">
                            {c.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="mt-8">
                  <p className="eyebrow mb-5 text-stone">Pieces</p>
                  <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-6">
                    {results.map((p) => (
                      <li key={p.id}>
                        <Link to={`/product/${p.slug}`} onClick={close} className="group block">
                          <div className="relative aspect-[3/4] overflow-hidden bg-sand">
                            <Img asset={p.images[0]} sizes="200px" className="transition-transform duration-700 group-hover:scale-105" />
                          </div>
                          <p className="mt-3 text-sm leading-snug">{p.name}</p>
                          <p className="mt-1 text-xs text-stone">{formatIDR(p.price)}</p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <button type="button" onClick={submit} className="link-under mt-8 text-xs tracking-[0.16em] uppercase">
                    View all results for “{term}”
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
