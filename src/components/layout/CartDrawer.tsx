import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { useCallback } from 'react';
import { Link } from 'react-router';
import { useShop } from '../../context/ShopContext';
import { commerceRules } from '../../data/site';
import { useEscape, useLockBody } from '../../hooks/useUi';
import { formatIDR } from '../../lib/format';
import { Img } from '../ui/Img';
import { QuantityStepper } from '../ui/QuantityStepper';

export function CartDrawer() {
  const { cart, cartOpen, setCartOpen, cartCount, subtotal, updateQuantity, removeFromCart } = useShop();
  const close = useCallback(() => setCartOpen(false), [setCartOpen]);
  useLockBody(cartOpen);
  useEscape(cartOpen, close);

  const remaining = Math.max(0, commerceRules.freeShippingThreshold - subtotal);
  const progress = Math.min(1, subtotal / commerceRules.freeShippingThreshold);

  return (
    <AnimatePresence>
      {cartOpen && (
        <motion.div className="fixed inset-0 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-ink/40" onClick={close} />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Shopping bag"
            className="absolute inset-y-0 right-0 flex w-full max-w-[460px] flex-col bg-ivory text-ink"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-ink/10 px-6">
              <h2 className="font-serif text-2xl">
                Your Bag <span className="font-sans text-sm text-stone tabular-nums">({cartCount})</span>
              </h2>
              <button type="button" onClick={close} className="-mr-2 p-2" aria-label="Close bag">
                <X size={20} strokeWidth={1.25} />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <p className="font-serif text-3xl">Your bag is empty.</p>
                <p className="mt-3 max-w-xs text-sm text-stone">Begin with the new runway pieces, or browse by category.</p>
                <Link to="/shop?new=1" onClick={close} className="btn-ink mt-8">
                  Shop New Arrivals
                </Link>
              </div>
            ) : (
              <>
                <div className="shrink-0 px-6 pt-5">
                  <p className="text-xs text-stone">
                    {remaining > 0 ? (
                      <>
                        Add <span className="text-ink">{formatIDR(remaining)}</span> for complimentary shipping.
                      </>
                    ) : (
                      'Your order qualifies for complimentary shipping.'
                    )}
                  </p>
                  <div className="mt-2 h-px bg-ink/10">
                    <div className="h-px bg-bronze transition-[width] duration-700" style={{ width: `${progress * 100}%` }} />
                  </div>
                </div>

                <ul className="flex-1 divide-y divide-ink/10 overflow-y-auto px-6">
                  {cart.map((l) => (
                    <li key={l.key} className="flex gap-4 py-5">
                      <Link to={`/product/${l.slug}`} onClick={close} className="relative aspect-[3/4] w-24 shrink-0 overflow-hidden bg-sand">
                        <Img asset={l.image} sizes="96px" />
                      </Link>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start justify-between gap-3">
                          <Link to={`/product/${l.slug}`} onClick={close} className="text-sm leading-snug hover:underline">
                            {l.name}
                          </Link>
                          <p className="shrink-0 text-sm tabular-nums">{formatIDR(l.price * l.quantity)}</p>
                        </div>
                        <p className="mt-1 text-xs text-stone">
                          {l.color} · Size {l.size}
                        </p>
                        <div className="mt-auto flex items-center justify-between pt-3">
                          <QuantityStepper size="sm" value={l.quantity} onChange={(q) => updateQuantity(l.key, q)} label={`Quantity for ${l.name}`} />
                          <button type="button" onClick={() => removeFromCart(l.key)} className="text-xs text-stone underline underline-offset-4 hover:text-ink">
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="shrink-0 border-t border-ink/10 bg-paper/60 px-6 py-5">
                  <div className="flex items-baseline justify-between">
                    <span className="eyebrow">Subtotal</span>
                    <span className="text-lg tabular-nums">{formatIDR(subtotal)}</span>
                  </div>
                  <p className="mt-1 text-xs text-stone">Shipping and taxes calculated at checkout.</p>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <Link to="/bag" onClick={close} className="btn-outline px-4">
                      View Bag
                    </Link>
                    <Link to="/checkout" onClick={close} className="btn-ink px-4">
                      Checkout
                    </Link>
                  </div>
                  <p className="mt-3 text-center text-[0.68rem] tracking-wide text-stone">Prototype — checkout is a demo, no payment is taken.</p>
                </div>
              </>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
