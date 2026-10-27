import { Heart, Plus, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router';
import { useShop } from '../../context/ShopContext';
import { formatIDR, PRODUCT_PHOTO_RATIO } from '../../lib/format';
import type { Product } from '../../types/commerce';
import { TileSlideshow } from '../catalog/TileSlideshow';
import { Img } from '../ui/Img';
import { quickViewClick } from './openQuickView';

interface Props {
  product: Product;
  /** `sizes` hint for the image */
  sizes?: string;
  priority?: boolean;
  /** Auto-cycle the product's photos in step with every other card (category catalogue) */
  cyclePhotos?: boolean;
}

export function ProductCard({ product: p, sizes = '(min-width: 1024px) 25vw, 50vw', priority, cyclePhotos }: Props) {
  const { addToCart, toggleWishlist, isWishlisted, setQuickView, notify, setCartOpen } = useShop();
  const wished = isWishlisted(p.id);
  const lowStock = p.stock > 0 && p.stock <= 5;

  const openQuick = quickViewClick(() => setQuickView(p));
  const photos = p.images.filter((im) => !im.pending);
  const cycling = !!cyclePhotos && photos.length > 1;

  const quickAdd = (size: string) => {
    addToCart(p, { size });
    notify(`${p.name} — ${size} added to your bag`);
    setCartOpen(true);
  };

  return (
    <article className="group @container relative" data-touch-hover>
      <div className="relative aspect-[2/3] overflow-hidden bg-sand">
        <Link to={`/product/${p.slug}`} onClick={openQuick} aria-label={p.name} className="absolute inset-0 block">
          {cycling ? (
            <TileSlideshow
              slides={photos}
              frameRatio={PRODUCT_PHOTO_RATIO}
              sizes={sizes}
              effect="wipe"
              sync
              indicatorClassName="left-3 right-3 bottom-3 [@media(hover:none)]:right-14"
              className="transition-transform duration-[1.2s] ease-[var(--ease-editorial)] group-hover:scale-[1.035]"
            />
          ) : (
            <>
              <Img asset={p.images[0]} sizes={sizes} priority={priority} className="transition-[transform,opacity] duration-[1.2s] ease-[var(--ease-editorial)] group-hover:scale-[1.035] group-inview:scale-[1.035]" />
              {p.images[1] && (
                <Img
                  asset={p.images[1]}
                  sizes={sizes}
                  alt=""
                  className="opacity-0 transition-opacity duration-700 ease-[var(--ease-editorial)] group-hover:opacity-100 group-inview:opacity-100"
                />
              )}
            </>
          )}
        </Link>

        {/* Labels */}
        <div className="pointer-events-none absolute top-3 left-3 flex flex-col items-start gap-1.5">
          {p.newArrival && <span className="bg-ivory/90 px-2 py-1 text-[0.6rem] font-medium tracking-[0.18em] uppercase">New</span>}
          {lowStock && <span className="bg-ink/85 px-2 py-1 text-[0.6rem] font-medium tracking-[0.18em] text-ivory uppercase">Few left</span>}
        </div>

        <button
          type="button"
          onClick={() => {
            toggleWishlist(p.id);
            notify(wished ? 'Removed from wishlist' : 'Saved to wishlist');
          }}
          aria-pressed={wished}
          aria-label={wished ? `Remove ${p.name} from wishlist` : `Save ${p.name} to wishlist`}
          className="absolute top-2 right-2 flex h-9 w-9 items-center justify-center text-ink transition-transform hover:scale-110 active:scale-90"
        >
          <Heart size={18} strokeWidth={1.25} fill={wished ? 'currentColor' : 'rgba(246,243,237,.55)'} />
        </button>

        {/* Desktop hover actions */}
        <div className="absolute inset-x-2 bottom-2 hidden translate-y-3 bg-ivory/95 opacity-0 backdrop-blur-sm transition-all duration-500 ease-[var(--ease-editorial)] group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 [@media(hover:hover)]:block">
          {/* Narrow cards: one tidy action — sizes are picked in the add-to-bag sheet */}
          <button
            type="button"
            onClick={() => setQuickView(p)}
            className="flex h-10 w-full items-center justify-center gap-2 text-[0.62rem] font-medium tracking-[0.16em] whitespace-nowrap uppercase transition-colors hover:bg-ink hover:text-ivory @min-[15rem]:hidden"
          >
            <ShoppingBag size={13} strokeWidth={1.5} /> Choose size
          </button>
          {/* Wide cards: quick add by size, always on one row */}
          <div className="hidden @min-[15rem]:block">
            <div className="flex items-center justify-between gap-3 px-3 pt-2.5 whitespace-nowrap">
              <span className="text-[0.6rem] font-medium tracking-[0.18em] text-stone uppercase">Quick add</span>
              <button type="button" onClick={() => setQuickView(p)} className="text-[0.6rem] font-medium tracking-[0.18em] uppercase underline-offset-4 hover:underline">
                Quick view
              </button>
            </div>
            <div className="flex gap-1 p-2">
              {p.availableSizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => quickAdd(s)}
                  className="h-8 min-w-0 flex-1 px-1 text-xs whitespace-nowrap transition-colors hover:bg-ink hover:text-ivory"
                  aria-label={`Add size ${s} to bag`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Touch: open the add-to-bag sheet (size, colour, quantity) */}
        <button
          type="button"
          onClick={() => setQuickView(p)}
          className="absolute right-2 bottom-2 flex h-9 w-9 items-center justify-center rounded-full bg-ivory/90 text-ink shadow-[0_2px_10px_-4px_rgba(36,36,36,.4)] backdrop-blur-sm transition-transform duration-200 active:scale-90 [@media(hover:hover)]:hidden"
          aria-label={`Choose size and add ${p.name} to bag`}
        >
          <ShoppingBag size={15} strokeWidth={1.4} />
          <Plus size={9} strokeWidth={2.5} className="absolute top-[0.55rem] right-[0.5rem] rounded-full bg-ivory" />
        </button>
      </div>

      <div className="mt-3 flex flex-col gap-1 sm:mt-4 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <h3 className="line-clamp-2 text-[0.82rem] leading-snug sm:text-[0.9rem]">
          <Link to={`/product/${p.slug}`} onClick={openQuick} className="link-draw">
            {p.name}
          </Link>
        </h3>
        <p className="shrink-0 text-[0.85rem] tabular-nums sm:text-[0.9rem]">{formatIDR(p.price)}</p>
      </div>
      <p className="mt-1 truncate text-[0.7rem] text-stone sm:text-xs">
        {p.motif} · {p.material}
      </p>
      <div className="mt-2.5 flex items-center justify-between gap-3 sm:mt-3">
        <div className="flex gap-1.5" aria-label={`Colours: ${p.colors.map((c) => c.name).join(', ')}`}>
          {p.colors.map((c) => (
            <span key={c.name} title={c.name} className="h-2.5 w-2.5 rounded-full border border-ink/15" style={{ background: c.hex }} />
          ))}
        </div>
        <p className="truncate text-[0.65rem] tracking-[0.08em] text-stone sm:text-[0.68rem]">
          <span className="sm:hidden">{p.availableSizes.length > 2 ? `${p.availableSizes[0]}–${p.availableSizes.at(-1)}` : p.availableSizes.join(' · ')}</span>
          <span className="hidden sm:inline">{p.availableSizes.join(' · ')}</span>
        </p>
      </div>
    </article>
  );
}
