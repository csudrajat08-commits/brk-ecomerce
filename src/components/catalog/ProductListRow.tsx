import { Heart } from 'lucide-react';
import { Link } from 'react-router';
import { useShop } from '../../context/ShopContext';
import { formatIDR, PRODUCT_PHOTO_RATIO } from '../../lib/format';
import type { Product } from '../../types/commerce';
import { Img } from '../ui/Img';
import { TileSlideshow } from './TileSlideshow';
import { quickViewClick } from '../product/openQuickView';

/** List-view presentation of a product: image left, editorial details right. */
export function ProductListRow({ product: p, cyclePhotos }: { product: Product; cyclePhotos?: boolean }) {
  const { toggleWishlist, isWishlisted, setQuickView, notify } = useShop();
  const wished = isWishlisted(p.id);
  const openQuick = quickViewClick(() => setQuickView(p));
  const photos = p.images.filter((im) => !im.pending);

  return (
    <article className="group grid grid-cols-[7.5rem_1fr] gap-5 border-b border-ink/10 py-6 sm:grid-cols-[11rem_1fr] sm:gap-8" data-touch-hover>
      <Link to={`/product/${p.slug}`} onClick={openQuick} className="relative block aspect-[2/3] overflow-hidden bg-sand" aria-label={p.name}>
        {cyclePhotos && photos.length > 1 ? (
          <TileSlideshow slides={photos} frameRatio={PRODUCT_PHOTO_RATIO} sizes="176px" effect="wipe" sync hideIndicator />
        ) : (
          <Img asset={p.images[0]} sizes="176px" className="transition-transform duration-[1.2s] ease-[var(--ease-editorial)] group-hover:scale-[1.04] group-inview:scale-[1.04]" />
        )}
      </Link>
      <div className="flex min-w-0 flex-col">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow text-[0.6rem] text-bronze">{p.motif}</p>
            <h3 className="mt-2 font-serif text-xl leading-tight sm:text-2xl">
              <Link to={`/product/${p.slug}`} onClick={openQuick} className="link-draw">
                {p.name}
              </Link>
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              toggleWishlist(p.id);
              notify(wished ? 'Removed from wishlist' : 'Saved to wishlist');
            }}
            aria-pressed={wished}
            aria-label={wished ? `Remove ${p.name} from wishlist` : `Save ${p.name} to wishlist`}
            className="-mt-1 -mr-2 flex h-9 w-9 shrink-0 items-center justify-center transition-transform active:scale-90"
          >
            <Heart size={18} strokeWidth={1.25} fill={wished ? 'currentColor' : 'none'} />
          </button>
        </div>
        <p className="mt-1 text-sm tabular-nums">{formatIDR(p.price)}</p>
        <p className="mt-3 hidden max-w-xl text-sm leading-relaxed text-stone sm:line-clamp-2">{p.description}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-stone">
          <span className="flex gap-1.5" aria-label={`Colours: ${p.colors.map((c) => c.name).join(', ')}`}>
            {p.colors.map((c) => (
              <span key={c.name} title={c.name} className="h-2.5 w-2.5 rounded-full border border-ink/15" style={{ background: c.hex }} />
            ))}
          </span>
          <span>{p.availableSizes.join(' · ')}</span>
          <span className="hidden sm:inline">{p.material}</span>
        </div>
        <div className="mt-auto flex flex-wrap gap-x-6 gap-y-3 pt-5">
          <button type="button" onClick={() => setQuickView(p)} className="btn-ink h-10 px-5 text-[0.65rem]">
            Add to bag
          </button>
          <Link to={`/product/${p.slug}`} className="link-under self-center text-[0.65rem] tracking-[0.16em] uppercase">
            View details
          </Link>
        </div>
      </div>
    </article>
  );
}
