import { AnimatePresence, motion } from 'motion/react';
import { Heart, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useShop } from '../../context/ShopContext';
import { useEscape, useLockBody } from '../../hooks/useUi';
import { cn, formatIDR } from '../../lib/format';
import { Img } from '../ui/Img';
import { ProductGallery } from './ProductGallery';
import { ColorSwatches, SizeSelector } from './Selectors';

export function QuickView() {
  const { quickView: p, setQuickView, addToCart, setCartOpen, isWishlisted, toggleWishlist, notify } = useShop();
  const [img, setImg] = useState(0);
  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState<string>('');
  const [error, setError] = useState(false);

  const close = useCallback(() => setQuickView(null), [setQuickView]);
  useLockBody(!!p);
  useEscape(!!p, close);

  useEffect(() => {
    if (!p) return;
    setImg(0);
    setSize(p.availableSizes.length === 1 ? p.availableSizes[0] : null);
    setColor(p.colors[0]?.name ?? '');
    setError(false);
  }, [p]);

  const add = () => {
    if (!p) return;
    if (!size) {
      setError(true);
      return;
    }
    addToCart(p, { size, color });
    notify(`${p.name} added to your bag`);
    close();
    setCartOpen(true);
  };

  const wished = p ? isWishlisted(p.id) : false;

  const selectors = p && (
    <div className="space-y-4">
      <ColorSwatches compact colors={p.colors} value={color} onChange={setColor} />
      <SizeSelector
        compact
        sizes={p.availableSizes}
        value={size}
        onChange={(s) => {
          setSize(s);
          setError(false);
        }}
        error={error}
      />
    </div>
  );

  const actions = p && (
    <div className="flex gap-2.5">
      <button type="button" onClick={add} className="btn-ink h-11 flex-1">
        Add to Bag
      </button>
      <button
        type="button"
        onClick={() => toggleWishlist(p.id)}
        className="btn-outline h-11 w-11 px-0"
        aria-pressed={wished}
        aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <Heart size={16} strokeWidth={1.25} fill={wished ? 'currentColor' : 'none'} />
      </button>
    </div>
  );

  const gallery = (sizes: string, compact?: boolean) =>
    p && <ProductGallery key={p.id} images={p.images} index={img} onIndex={setImg} sizes={sizes} compact={compact} />;

  return (
    <AnimatePresence>
      {p && (
        <motion.div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-ink/50" onClick={close} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Quick view: ${p.name}`}
            className="relative w-full overflow-hidden bg-ivory text-ink md:w-[min(560px,92vw)] lg:w-auto"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <button type="button" onClick={close} className="absolute top-2 right-2 z-10 bg-ivory/85 p-2" aria-label="Close quick view">
              <X size={18} strokeWidth={1.25} />
            </button>

            {/* Phones & tablets: compact sheet — photo beside the name, everything above the fold */}
            <div className="max-h-[92svh] space-y-4 overflow-y-auto px-4 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] md:p-6 lg:hidden">
              <div className="mx-auto h-1 w-10 rounded-full bg-ink/15 md:hidden" aria-hidden />
              <div className="grid grid-cols-[32%_1fr] gap-4 pr-8 md:grid-cols-[36%_1fr]">
                <div className="relative aspect-[2/3] overflow-hidden bg-sand">
                  {gallery('40vw', true)}
                </div>
                <div className="flex min-w-0 flex-col">
                  <p className="eyebrow text-[0.6rem] text-bronze">{p.motif}</p>
                  <h2 className="mt-1.5 line-clamp-3 font-serif text-[1.15rem] leading-snug md:text-[1.35rem]">{p.name}</h2>
                  <p className="mt-1.5 text-[0.95rem] tabular-nums">{formatIDR(p.price)}</p>
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-stone md:line-clamp-3">{p.description}</p>
                </div>
              </div>
              {selectors}
              {actions}
            </div>

            {/* Desktop: height-bound panel — the photo takes the full height at 3:4, the details never scroll */}
            <div className="hidden h-[min(86svh,640px)] max-w-[min(1000px,94vw)] grid-cols-[auto_minmax(320px,390px)] lg:grid">
              <div className="flex h-[min(86svh,640px)] gap-2 bg-sand/40 p-2.5">
                {p.images.length > 1 && (
                  <div className="flex w-14 shrink-0 flex-col gap-2 overflow-y-auto">
                    {p.images.map((im, i) => (
                      <button
                        key={`${im.url ?? im.src}-${i}`}
                        type="button"
                        onClick={() => setImg(i)}
                        className={cn('relative aspect-[2/3] shrink-0 overflow-hidden transition-opacity', i === img ? 'opacity-100 ring-1 ring-ink' : 'opacity-60 hover:opacity-100')}
                        aria-label={`Show image ${i + 1}`}
                      >
                        <Img asset={im} sizes="56px" />
                      </button>
                    ))}
                  </div>
                )}
                <div className="relative aspect-[2/3] h-full overflow-hidden bg-sand">{gallery('440px')}</div>
              </div>

              <div className="flex min-h-0 flex-col p-7 pr-8 [@media(max-height:700px)]:p-5">
                <p className="eyebrow text-[0.62rem] text-bronze">{p.motif}</p>
                <h2 className="mt-2 font-serif text-[1.75rem] leading-tight lg:text-[2rem]">{p.name}</h2>
                <p className="mt-2 text-lg tabular-nums">{formatIDR(p.price)}</p>
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-stone [@media(max-height:700px)]:line-clamp-2">{p.description}</p>
                <div className="mt-5 [@media(max-height:700px)]:mt-3">{selectors}</div>
                <div className="mt-5 [@media(max-height:700px)]:mt-4">{actions}</div>
                <div className="mt-auto flex items-center justify-between gap-4 pt-4 text-xs text-stone">
                  <span className="truncate">
                    {p.material} · {p.technique}
                  </span>
                  <Link to={`/product/${p.slug}`} onClick={close} className="link-under shrink-0 tracking-[0.12em] text-ink uppercase">
                    Details
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
