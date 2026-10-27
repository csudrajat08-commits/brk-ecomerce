import { ArrowRight, Heart, Lock } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { Link } from 'react-router';
import { OrderSummary } from '../components/checkout/OrderSummary';
import { PageTop } from '../components/layout/Layout';
import { Img } from '../components/ui/Img';
import { QuantityStepper } from '../components/ui/QuantityStepper';
import { useShop } from '../context/ShopContext';
import { computeTotals, SHIPPING_OPTIONS } from '../data/checkout';
import { commerceRules } from '../data/site';
import { formatIDR } from '../lib/format';

export default function BagPage() {
  const { cart, cartCount, subtotal, updateQuantity, removeFromCart, toggleWishlist, isWishlisted, notify } = useShop();
  // shipping is chosen at checkout, so the bag totals exclude it
  const totals = useMemo(() => computeTotals(subtotal, SHIPPING_OPTIONS.find((o) => o.method === 'pickup')!, null, false), [subtotal]);
  const remaining = Math.max(0, commerceRules.freeShippingThreshold - subtotal);

  useEffect(() => {
    document.title = 'Shopping Bag — Batik Riana Kesuma';
  }, []);

  if (cart.length === 0)
    return (
      <PageTop>
        <section className="container-brk flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
          <p className="eyebrow text-bronze">Shopping bag</p>
          <h1 className="display mt-5 text-5xl md:text-6xl">Your bag is empty.</h1>
          <p className="mt-5 max-w-sm text-sm text-stone">Browse the women’s collection or the newest pieces from the runway.</p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link to="/women" className="btn-ink">
              Shop Women
            </Link>
            <Link to="/shop?new=1" className="btn-outline">
              New Arrivals
            </Link>
          </div>
        </section>
      </PageTop>
    );

  return (
    <PageTop>
      <section className="container-brk pt-8 pb-24 md:pt-12">
        <div className="flex items-baseline justify-between gap-4">
          <h1 className="display text-5xl md:text-6xl">Shopping Bag</h1>
          <p className="text-sm text-stone tabular-nums">
            {cartCount} {cartCount === 1 ? 'item' : 'items'}
          </p>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_400px] lg:gap-14">
          <div>
            {/* Free-shipping progress */}
            <div className="bg-mist px-4 py-3 text-xs">
              {remaining > 0 ? (
                <>
                  Add <span className="font-medium">{formatIDR(remaining)}</span> more for free regular shipping.
                </>
              ) : (
                'Your order qualifies for free regular shipping.'
              )}
              <div className="mt-2 h-px bg-ink/10">
                <div className="h-px bg-bronze transition-[width] duration-700" style={{ width: `${Math.min(100, (subtotal / commerceRules.freeShippingThreshold) * 100)}%` }} />
              </div>
            </div>

            <ul className="mt-4 divide-y divide-ink/10 border-b border-ink/10">
              {cart.map((l) => (
                <li key={l.key} className="grid grid-cols-[6.5rem_1fr] gap-4 py-6 sm:grid-cols-[8rem_1fr] sm:gap-6">
                  <div className="relative aspect-[3/4] overflow-hidden bg-sand">
                    <Img asset={l.image} sizes="128px" />
                  </div>
                  <div className="flex min-w-0 flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-serif text-lg leading-snug sm:text-xl">{l.name}</p>
                        <p className="mt-1 text-xs text-stone">
                          {l.color} · Size {l.size}
                        </p>
                        <p className="mt-1 text-[0.68rem] text-stone/80">SKU {l.sku}</p>
                      </div>
                      <p className="shrink-0 text-sm tabular-nums">{formatIDR(l.price * l.quantity)}</p>
                    </div>
                    <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
                      <QuantityStepper size="sm" value={l.quantity} onChange={(q) => updateQuantity(l.key, q)} label={`Quantity for ${l.name}`} />
                      <div className="flex items-center gap-4 text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            if (!isWishlisted(l.productId)) toggleWishlist(l.productId);
                            removeFromCart(l.key);
                            notify('Moved to wishlist');
                          }}
                          className="inline-flex items-center gap-1.5 text-stone hover:text-ink"
                        >
                          <Heart size={13} strokeWidth={1.25} /> Save for later
                        </button>
                        <button type="button" onClick={() => removeFromCart(l.key)} className="text-stone underline underline-offset-4 hover:text-ink">
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <Link to="/women" className="group mt-6 inline-flex items-center gap-2 text-xs tracking-[0.14em] uppercase">
              <span className="link-under">Continue shopping</span>
              <ArrowRight size={14} strokeWidth={1.25} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <OrderSummary lines={[]} totals={totals} shippingPending>
              <Link to="/checkout" className="btn-ink mt-6 w-full">
                Checkout <ArrowRight size={15} strokeWidth={1.25} />
              </Link>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-[0.68rem] text-stone">
                <Lock size={11} strokeWidth={1.5} /> Prototype checkout — no payment is taken
              </p>
            </OrderSummary>
          </aside>
        </div>
      </section>
    </PageTop>
  );
}
