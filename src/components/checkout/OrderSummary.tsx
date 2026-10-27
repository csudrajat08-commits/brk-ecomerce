import { useState, type FormEvent, type ReactNode } from 'react';
import { PROMO_CODES, type Totals } from '../../data/checkout';
import { cn, formatIDR } from '../../lib/format';
import type { CartLine } from '../../types/commerce';
import { Img } from '../ui/Img';

interface Props {
  lines: CartLine[];
  totals: Totals;
  /** Show the shipping row as "Calculated at checkout" (bag page) */
  shippingPending?: boolean;
  promo?: { code: string | null; onApply: (code: string | null) => void };
  children?: ReactNode;
  className?: string;
}

/** Itemised order summary with totals — shared by the bag, checkout and confirmation pages. */
export function OrderSummary({ lines, totals, shippingPending, promo, children, className }: Props) {
  return (
    <div className={cn('bg-paper p-5 md:p-7', className)}>
      {lines.length > 0 && (
        <ul className="divide-y divide-ink/10">
          {lines.map((l) => (
            <li key={l.key} className="flex gap-3 py-3 first:pt-0">
              <div className="relative aspect-[3/4] w-14 shrink-0 overflow-hidden bg-sand">
                <Img asset={l.image} sizes="56px" />
                <span className="absolute -top-0 -right-0 flex h-5 min-w-5 items-center justify-center bg-ink px-1 text-[0.6rem] text-ivory tabular-nums">{l.quantity}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{l.name}</p>
                <p className="mt-0.5 text-xs text-stone">
                  {l.color} · {l.size}
                </p>
              </div>
              <p className="shrink-0 text-sm tabular-nums">{formatIDR(l.price * l.quantity)}</p>
            </li>
          ))}
        </ul>
      )}

      {promo && <PromoField code={promo.code} onApply={promo.onApply} />}

      <dl className={cn('space-y-2 text-sm', (lines.length > 0 || promo) && 'mt-5 border-t border-ink/10 pt-5')}>
        <Row label="Subtotal" value={formatIDR(totals.subtotal)} />
        {totals.discount > 0 && <Row label={`Discount${promo?.code ? ` (${promo.code})` : ''}`} value={`–${formatIDR(totals.discount)}`} accent />}
        <Row
          label="Shipping"
          value={shippingPending ? 'Calculated at checkout' : totals.shipping === 0 ? (totals.freeShippingApplied ? 'Free' : 'Rp 0') : formatIDR(totals.shipping)}
          muted={shippingPending}
        />
        {totals.giftWrap > 0 && <Row label="Gift wrap" value={formatIDR(totals.giftWrap)} />}
        <div className="flex items-baseline justify-between border-t border-ink/10 pt-3">
          <dt className="eyebrow">Total</dt>
          <dd className="text-xl tabular-nums">{formatIDR(totals.total)}</dd>
        </div>
        <p className="text-right text-[0.68rem] text-stone">Prices include VAT</p>
      </dl>
      {children}
    </div>
  );
}

function Row({ label, value, accent, muted }: { label: string; value: string; accent?: boolean; muted?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-stone">{label}</dt>
      <dd className={cn('tabular-nums', accent && 'text-bronze', muted && 'text-xs text-stone')}>{value}</dd>
    </div>
  );
}

function PromoField({ code, onApply }: { code: string | null; onApply: (c: string | null) => void }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const apply = (e: FormEvent) => {
    e.preventDefault();
    const c = value.trim().toUpperCase();
    if (!c) return;
    if (!PROMO_CODES[c]) return setError('This code isn’t valid. Try BATIK10 (demo).');
    setError('');
    setValue('');
    onApply(c);
  };
  if (code)
    return (
      <div className="mt-4 flex items-center justify-between bg-mist px-3 py-2 text-xs">
        <span>
          <span className="font-medium tracking-[0.1em]">{code}</span> — {PROMO_CODES[code]?.label}
        </span>
        <button type="button" onClick={() => onApply(null)} className="text-stone underline underline-offset-4 hover:text-ink">
          Remove
        </button>
      </div>
    );
  return (
    <form onSubmit={apply} className="mt-4" noValidate>
      <div className="flex">
        <input
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError('');
          }}
          placeholder="Promo code"
          aria-label="Promo code"
          aria-invalid={!!error}
          className="h-10 w-full border border-ink/20 bg-ivory px-3 text-sm uppercase placeholder:normal-case focus:border-ink focus:outline-none"
        />
        <button type="submit" className="-ml-px h-10 shrink-0 border border-ink bg-ink px-4 text-[0.65rem] tracking-[0.16em] text-ivory uppercase">
          Apply
        </button>
      </div>
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </form>
  );
}
