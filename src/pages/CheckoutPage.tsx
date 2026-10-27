import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, Check, ChevronDown, CreditCard, Gift, Landmark, Lock, QrCode, Store, Truck, Wallet, Zap } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { FloatInput, OptionCard } from '../components/checkout/CheckoutFields';
import { FloatCombo } from '../components/checkout/FloatCombo';
import { OrderSummary } from '../components/checkout/OrderSummary';
import { Img } from '../components/ui/Img';
import { useShop } from '../context/ShopContext';
import { computeTotals, GIFT_WRAP_PRICE, PAYMENT_OPTIONS, REGIONS, SHIPPING_OPTIONS, type ShippingOption } from '../data/checkout';
import { commerceRules } from '../data/site';
import { cn, formatIDR } from '../lib/format';
import { orders } from '../services/orders';
import type { SalesOrderDraft } from '../types/commerce';

/* ------------------------------------------------------------------ */
/* Form model + validation                                             */
/* ------------------------------------------------------------------ */

interface Form {
  email: string;
  fullName: string;
  phone: string;
  address: string;
  province: string;
  city: string;
  district: string;
  postalCode: string;
  notes: string;
}
type Field = keyof Form;

const EMPTY: Form = { email: '', fullName: '', phone: '', address: '', province: '', city: '', district: '', postalCode: '', notes: '' };

const RULES: Partial<Record<Field, (v: string) => string | null>> = {
  email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? null : 'Enter a valid email address'),
  fullName: (v) => (v.trim().length >= 3 ? null : 'Enter your full name'),
  phone: (v) => (/^(\+?62|0)8\d{8,11}$/.test(v.replace(/[\s-]/g, '')) ? null : 'Enter an Indonesian mobile number, e.g. 0812 3456 7890'),
  address: (v) => (v.trim().length >= 10 ? null : 'Enter street, house number and RT/RW'),
  province: (v) => (v ? null : 'Choose a province'),
  city: (v) => (v ? null : 'Choose a city'),
  district: (v) => (v.trim().length >= 3 ? null : 'Enter your district (kecamatan)'),
  postalCode: (v) => (/^\d{5}$/.test(v.trim()) ? null : 'Postal code is 5 digits'),
};

const CONTACT_FIELDS: Field[] = ['email', 'fullName', 'phone'];
const ADDRESS_FIELDS: Field[] = ['address', 'province', 'city', 'district', 'postalCode'];

const fieldValid = (f: Form, k: Field) => !!f[k] && !RULES[k]?.(f[k]);
function check(f: Form, fields: Field[]) {
  const e: Partial<Record<Field, string>> = {};
  for (const k of fields) {
    const msg = RULES[k]?.(f[k]);
    if (msg) e[k] = msg;
  }
  return e;
}

const SHIP_ICON: Record<ShippingOption['method'], ReactNode> = {
  standard: <Truck size={17} strokeWidth={1.4} />,
  express: <Zap size={17} strokeWidth={1.4} />,
  pickup: <Store size={17} strokeWidth={1.4} />,
};
const PAY_ICON: Record<string, ReactNode> = {
  va: <Landmark size={17} strokeWidth={1.4} />,
  qris: <QrCode size={17} strokeWidth={1.4} />,
  ewallet: <Wallet size={17} strokeWidth={1.4} />,
  card: <CreditCard size={17} strokeWidth={1.4} />,
};
const EXPRESS = [
  { label: 'GoPay', method: 'ewallet', channel: 'GoPay' },
  { label: 'ShopeePay', method: 'ewallet', channel: 'ShopeePay' },
  { label: 'QRIS', method: 'qris' },
] as const;

type Step = 1 | 2 | 3;
const STEP_NAMES: Record<Step, string> = { 1: 'Details', 2: 'Delivery', 3: 'Payment' };

/* ------------------------------------------------------------------ */

export default function CheckoutPage() {
  const { cart, subtotal, clearCart, notify } = useShop();
  const navigate = useNavigate();
  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [step, setStep] = useState<Step>(1);
  const [done, setDone] = useState<Set<Step>>(new Set());
  const [shippingId, setShippingId] = useState<ShippingOption['id']>('standard');
  const [payment, setPayment] = useState<{ method: string; channel?: string }>({ method: 'va', channel: 'BCA' });
  const [giftWrap, setGiftWrap] = useState(false);
  const [promo, setPromo] = useState<string | null>(null);
  const [tax, setTax] = useState({ on: false, companyName: '', npwp: '', address: '' });
  const [taxErrors, setTaxErrors] = useState<{ companyName?: string; npwp?: string; address?: string }>({});
  const npwpDigits = tax.npwp.replace(/\D/g, '');
  const checkTax = () => {
    if (!tax.on) return {};
    const e: typeof taxErrors = {};
    if (tax.companyName.trim().length < 3) e.companyName = 'Enter the company name';
    if (npwpDigits.length !== 15 && npwpDigits.length !== 16) e.npwp = 'NPWP is 15 or 16 digits';
    if (tax.address.trim().length < 10) e.address = 'Enter the company address as on the NPWP';
    return e;
  };
  const [submitting, setSubmitting] = useState(false);
  const [sheet, setSheet] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const shipping = SHIPPING_OPTIONS.find((o) => o.id === shippingId)!;
  const pickup = shipping.method === 'pickup';
  const totals = useMemo(() => computeTotals(subtotal, shipping, promo, giftWrap), [subtotal, shipping, promo, giftWrap]);

  useEffect(() => {
    document.title = 'Checkout — Batik Riana Kesuma';
  }, []);

  if (cart.length === 0 && !submitting) return <Navigate to="/bag" replace />;

  const set = (k: Field, v: string) => {
    setForm((f) => ({ ...f, [k]: v, ...(k === 'province' ? { city: '' } : {}) }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };
  const blur = (k: Field) => form[k] && setErrors((e) => ({ ...e, [k]: RULES[k]?.(form[k]) ?? undefined }));

  const focusFirstError = () => requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());

  const complete = (s: Step) => {
    setDone((d) => new Set(d).add(s));
    setStep((Math.min(3, s + 1) as Step));
    requestAnimationFrame(() => document.getElementById(`step-${Math.min(3, s + 1)}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const advance = async (e?: FormEvent) => {
    e?.preventDefault();
    if (step === 1) {
      const errs = check(form, CONTACT_FIELDS);
      const terrs = checkTax();
      setErrors(errs);
      setTaxErrors(terrs);
      return Object.keys(errs).length || Object.keys(terrs).length ? focusFirstError() : complete(1);
    }
    if (step === 2) {
      const errs = pickup ? {} : check(form, ADDRESS_FIELDS);
      setErrors(errs);
      return Object.keys(errs).length ? focusFirstError() : complete(2);
    }
    // step 3 — every earlier step must still be valid (they can be edited)
    const errs = check(form, pickup ? CONTACT_FIELDS : [...CONTACT_FIELDS, ...ADDRESS_FIELDS]);
    if (Object.keys(errs).length) {
      setErrors(errs);
      setStep(CONTACT_FIELDS.some((k) => errs[k]) ? 1 : 2);
      return focusFirstError();
    }
    setSubmitting(true);
    const draft: SalesOrderDraft = {
      customer: { fullName: form.fullName.trim(), email: form.email.trim(), phone: form.phone.replace(/[\s-]/g, '') },
      shipping: {
        address: pickup ? '' : form.address.trim(),
        district: pickup ? '' : form.district.trim(),
        city: pickup ? '' : form.city,
        province: pickup ? '' : form.province,
        postalCode: pickup ? '' : form.postalCode.trim(),
        method: shipping.method,
        service: `${shipping.label} — ${shipping.detail}`,
        pickupStore: pickup ? shipping.id : undefined,
      },
      payment,
      lines: cart.map((l) => ({ sku: l.sku, name: l.name, size: l.size, color: l.color, quantity: l.quantity, unitPrice: l.price })),
      giftWrap,
      promoCode: promo ?? undefined,
      totals: { subtotal: totals.subtotal, discount: totals.discount, shipping: totals.shipping, giftWrap: totals.giftWrap, total: totals.total },
      notes: form.notes.trim() || undefined,
      taxInvoice: tax.on ? { companyName: tax.companyName.trim(), npwp: tax.npwp.trim(), address: tax.address.trim() } : undefined,
    };
    await orders.submitOrder(draft);
    clearCart();
    navigate('/checkout/confirmation', { replace: true });
  };

  const express = (x: (typeof EXPRESS)[number]) => {
    setPayment({ method: x.method, channel: 'channel' in x ? x.channel : undefined });
    setDone((d) => new Set(d).add(3));
    notify(`${x.label} selected — demo: add your details to finish`);
    setStep(1);
    requestAnimationFrame(() => formRef.current?.querySelector<HTMLInputElement>('input[autocomplete=email]')?.focus());
  };

  const cta = submitting ? 'Placing demo order…' : step === 1 ? 'Continue to delivery' : step === 2 ? 'Continue to payment' : `Place demo order · ${formatIDR(totals.total)}`;
  const shipPrice = (o: ShippingOption) =>
    o.price === 0 ? 'Free' : o.freeOverThreshold && subtotal >= commerceRules.freeShippingThreshold ? (
      <>
        <s className="mr-1 text-xs text-stone">{formatIDR(o.price)}</s>Free
      </>
    ) : (
      formatIDR(o.price)
    );
  const payLabel = PAYMENT_OPTIONS.find((o) => o.id === payment.method)?.label;

  return (
    <div className="min-h-screen bg-ivory pb-28 lg:pb-0">
      {/* Focus-mode header */}
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-ivory/95 backdrop-blur-md">
        <div className="container-brk flex h-16 items-center justify-between gap-6">
          <Link to="/bag" className="inline-flex items-center gap-2 text-xs text-stone hover:text-ink" aria-label="Back to bag">
            <ArrowLeft size={15} strokeWidth={1.25} /> <span className="hidden sm:inline">Bag</span>
          </Link>
          <Link to="/" className="font-serif text-xl tracking-[0.02em] sm:text-2xl">
            Riana Kesuma
          </Link>
          <span className="inline-flex items-center gap-1.5 text-xs text-stone">
            <Lock size={12} strokeWidth={1.5} /> <span className="hidden sm:inline">Secure checkout</span>
          </span>
        </div>
        <Progress step={step} done={done} onJump={(s) => (done.has(s) || s < step) && setStep(s)} />
      </header>

      <div className="container-brk grid gap-10 pt-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-16 lg:pt-12 xl:grid-cols-[minmax(0,640px)_460px] xl:justify-between">
        {/* ---------------- Form column ---------------- */}
        <div>
          <p className="mb-6 inline-flex items-center gap-2 bg-bronze/12 px-3 py-1.5 text-[0.7rem]">Demo checkout — nothing is charged or sent to BRK</p>

          {/* Express */}
          <section aria-label="Express checkout">
            <p className="eyebrow mb-3 text-center text-[0.62rem] text-stone">Express checkout</p>
            <div className="grid grid-cols-3 gap-2">
              {EXPRESS.map((x) => (
                <button
                  key={x.label}
                  type="button"
                  onClick={() => express(x)}
                  className={cn(
                    'h-12 border text-sm font-medium transition-[transform,background-color] active:scale-[0.97]',
                    payment.channel === ('channel' in x ? x.channel : undefined) && payment.method === x.method ? 'border-ink bg-ink text-ivory' : 'border-ink/15 bg-paper hover:border-ink',
                  )}
                >
                  {x.label}
                </button>
              ))}
            </div>
            <div className="my-8 flex items-center gap-4 text-xs text-stone">
              <span className="h-px flex-1 bg-ink/12" /> or pay another way <span className="h-px flex-1 bg-ink/12" />
            </div>
          </section>

          <form id="checkout-form" ref={formRef} onSubmit={advance} noValidate className="space-y-3">
            {/* Step 1 */}
            <StepPanel
              id="step-1"
              n={1}
              title="Contact details"
              open={step === 1}
              done={done.has(1)}
              summary={`${form.fullName} · ${form.email} · ${form.phone}${tax.on ? ` · Faktur: ${tax.companyName}` : ''}`}
              onEdit={() => setStep(1)}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <FloatInput label="Email" type="email" autoComplete="email" value={form.email} onChange={(e) => set('email', e.target.value)} onBlur={() => blur('email')} error={errors.email} valid={fieldValid(form, 'email')} className="sm:col-span-2" />
                <FloatInput label="Full name" autoComplete="name" value={form.fullName} onChange={(e) => set('fullName', e.target.value)} onBlur={() => blur('fullName')} error={errors.fullName} valid={fieldValid(form, 'fullName')} />
                <FloatInput label="Mobile (WhatsApp)" type="tel" inputMode="tel" autoComplete="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} onBlur={() => blur('phone')} error={errors.phone} valid={fieldValid(form, 'phone')} />
              </div>
              <p className="mt-3 text-xs text-stone">We’ll send order updates to this email and WhatsApp number.</p>

              <label className="mt-5 flex cursor-pointer items-center gap-3 text-sm">
                <input type="checkbox" checked={tax.on} onChange={(e) => setTax((t) => ({ ...t, on: e.target.checked }))} className="h-4 w-4 accent-ink" />
                I need a tax invoice (Faktur Pajak) for my company
              </label>
              <AnimatePresence initial={false}>
                {tax.on && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="grid gap-3 pt-4 sm:grid-cols-2">
                      <FloatInput label="Company name" value={tax.companyName} onChange={(e) => setTax((t) => ({ ...t, companyName: e.target.value }))} error={taxErrors.companyName} valid={tax.companyName.trim().length >= 3} />
                      <FloatInput label="NPWP" inputMode="numeric" value={tax.npwp} onChange={(e) => setTax((t) => ({ ...t, npwp: e.target.value.replace(/[^\d.-]/g, '') }))} error={taxErrors.npwp} valid={npwpDigits.length === 15 || npwpDigits.length === 16} />
                      <FloatInput label="Company address (as on NPWP)" value={tax.address} onChange={(e) => setTax((t) => ({ ...t, address: e.target.value }))} error={taxErrors.address} valid={tax.address.trim().length >= 10} className="sm:col-span-2" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </StepPanel>

            {/* Step 2 */}
            <StepPanel
              id="step-2"
              n={2}
              title="Delivery"
              open={step === 2}
              done={done.has(2)}
              summary={pickup ? `${shipping.label} · ${shipping.detail}` : `${shipping.label} · ${form.address}, ${form.city}`}
              onEdit={() => setStep(2)}
            >
              <div className="grid gap-2.5 sm:grid-cols-2">
                {SHIPPING_OPTIONS.map((o) => (
                  <OptionCard key={o.id} name="shipping" checked={shippingId === o.id} onChange={() => setShippingId(o.id)} icon={SHIP_ICON[o.method]} title={o.label} detail={`${o.detail} · ${o.eta}`} aside={shipPrice(o)} />
                ))}
              </div>

              <AnimatePresence initial={false}>
                {!pickup && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35 }} className="overflow-hidden">
                    <p className="eyebrow mt-7 mb-3 text-[0.62rem] text-stone">Shipping address</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <FloatInput label="Street address, no., RT/RW" autoComplete="street-address" value={form.address} onChange={(e) => set('address', e.target.value)} onBlur={() => blur('address')} error={errors.address} valid={fieldValid(form, 'address')} className="sm:col-span-2" />
                      <FloatCombo
                        label="Province"
                        value={form.province}
                        options={Object.keys(REGIONS)}
                        onChange={(v) => set('province', v)}
                        searchPlaceholder="Search province…"
                        error={errors.province}
                        valid={fieldValid(form, 'province')}
                      />
                      <FloatCombo
                        label="City / regency"
                        value={form.city}
                        options={REGIONS[form.province] ?? []}
                        onChange={(v) => set('city', v)}
                        disabled={!form.province}
                        disabledHint="City — choose a province first"
                        searchPlaceholder="Search city…"
                        error={errors.city}
                        valid={fieldValid(form, 'city')}
                      />
                      <FloatInput label="District (kecamatan)" value={form.district} onChange={(e) => set('district', e.target.value)} onBlur={() => blur('district')} error={errors.district} valid={fieldValid(form, 'district')} />
                      <FloatInput label="Postal code" inputMode="numeric" autoComplete="postal-code" maxLength={5} value={form.postalCode} onChange={(e) => set('postalCode', e.target.value.replace(/\D/g, ''))} onBlur={() => blur('postalCode')} error={errors.postalCode} valid={fieldValid(form, 'postalCode')} />
                      <FloatInput label="Note for the courier (optional)" value={form.notes} onChange={(e) => set('notes', e.target.value)} className="sm:col-span-2" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <label className={cn('mt-5 flex cursor-pointer items-center gap-3 border p-4 transition-colors', giftWrap ? 'border-ink bg-paper' : 'border-ink/12 bg-paper/60 hover:border-ink/40')}>
                <input type="checkbox" checked={giftWrap} onChange={(e) => setGiftWrap(e.target.checked)} className="h-4 w-4 accent-ink" />
                <Gift size={16} strokeWidth={1.4} />
                <span className="flex-1 text-sm">Batik gift wrap & handwritten card</span>
                <span className="text-sm tabular-nums">+{formatIDR(GIFT_WRAP_PRICE)}</span>
              </label>
            </StepPanel>

            {/* Step 3 */}
            <StepPanel id="step-3" n={3} title="Payment" open={step === 3} done={false} summary={`${payLabel}${payment.channel ? ` — ${payment.channel}` : ''}`} onEdit={() => setStep(3)}>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {PAYMENT_OPTIONS.map((o) => (
                  <OptionCard key={o.id} name="payment" checked={payment.method === o.id} onChange={() => setPayment({ method: o.id, channel: o.channels?.[0] })} icon={PAY_ICON[o.id]} title={o.label} detail={o.detail}>
                    {payment.method === o.id && o.channels && (
                      <span className="mt-3 flex flex-wrap gap-1.5 pl-12">
                        {o.channels.map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setPayment({ method: o.id, channel: c });
                            }}
                            aria-pressed={payment.channel === c}
                            className={cn('h-8 border px-2.5 text-xs transition-colors', payment.channel === c ? 'border-ink bg-ink text-ivory' : 'border-ink/15 bg-ivory hover:border-ink')}
                          >
                            {c}
                          </button>
                        ))}
                      </span>
                    )}
                  </OptionCard>
                ))}
              </div>
              <p className="mt-3 text-xs text-stone">Demo only — no bank, wallet or card details are requested.</p>
            </StepPanel>

            {/* Desktop CTA */}
            <div className="hidden pt-5 lg:block">
              <button type="submit" disabled={submitting} className="btn-ink h-14 w-full text-[0.8rem]">
                {cta}
              </button>
            </div>
          </form>
        </div>

        {/* ---------------- Summary column (desktop) ---------------- */}
        <aside className="hidden lg:block">
          <div className="sticky top-32">
            <SummaryHeader cart={cart} />
            <OrderSummary lines={cart} totals={totals} promo={{ code: promo, onApply: setPromo }} />
          </div>
        </aside>
      </div>

      {/* ---------------- Mobile: sticky action bar + summary sheet ---------------- */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-ivory/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden">
        <button type="button" onClick={() => setSheet(true)} className="mb-2.5 flex w-full items-center justify-between text-sm" aria-expanded={sheet}>
          <span className="inline-flex items-center gap-1.5 text-stone">
            Order summary <ChevronDown size={14} className="rotate-180" />
          </span>
          <span className="tabular-nums">{formatIDR(totals.total)}</span>
        </button>
        <button type="submit" form="checkout-form" disabled={submitting} className="btn-ink h-12 w-full">
          {cta}
        </button>
      </div>
      <AnimatePresence>
        {sheet && (
          <motion.div className="fixed inset-0 z-50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-ink/40" onClick={() => setSheet(false)} />
            <motion.div
              className="absolute inset-x-0 bottom-0 max-h-[85svh] overflow-y-auto bg-ivory px-4 pt-3 pb-6"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-ink/20" />
              <SummaryHeader cart={cart} />
              <OrderSummary lines={cart} totals={totals} promo={{ code: promo, onApply: setPromo }} className="p-4" />
              <button type="button" onClick={() => setSheet(false)} className="btn-outline mt-4 h-11 w-full">
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Progress({ step, done, onJump }: { step: Step; done: Set<Step>; onJump: (s: Step) => void }) {
  return (
    <nav aria-label="Checkout progress" className="container-brk flex items-center gap-2 pb-3 text-[0.68rem] tracking-[0.08em] uppercase">
      <Link to="/bag" className="inline-flex items-center gap-1.5 text-stone hover:text-ink">
        <Check size={12} strokeWidth={2} className="text-[#3f8f5a]" /> Bag
      </Link>
      {([1, 2, 3] as Step[]).map((s) => (
        <span key={s} className="flex flex-1 items-center gap-2">
          <span className={cn('h-px flex-1', done.has(s) || step >= s ? 'bg-ink' : 'bg-ink/15')} />
          <button
            type="button"
            onClick={() => onJump(s)}
            aria-current={step === s ? 'step' : undefined}
            className={cn('inline-flex items-center gap-1.5', step === s ? 'text-ink' : done.has(s) ? 'text-stone hover:text-ink' : 'text-stone/60')}
          >
            {done.has(s) && step !== s ? <Check size={12} strokeWidth={2} className="text-[#3f8f5a]" /> : <span className={cn('h-1.5 w-1.5 rounded-full', step === s ? 'bg-ink' : 'bg-ink/25')} />}
            {STEP_NAMES[s]}
          </button>
        </span>
      ))}
    </nav>
  );
}

function StepPanel({
  id,
  n,
  title,
  open,
  done,
  summary,
  onEdit,
  children,
}: {
  id: string;
  n: number;
  title: string;
  open: boolean;
  done: boolean;
  summary: string;
  onEdit: () => void;
  children: ReactNode;
}) {
  return (
    <section id={id} className={cn('scroll-mt-32 border transition-colors', open ? 'border-ink/20 bg-ivory' : 'border-ink/10 bg-paper/50')}>
      <header className="flex items-center gap-3 px-5 py-4">
        <span
          className={cn(
            'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[0.65rem] transition-colors',
            done && !open ? 'bg-[#3f8f5a] text-ivory' : open ? 'bg-ink text-ivory' : 'bg-ink/10 text-stone',
          )}
        >
          {done && !open ? <Check size={12} strokeWidth={2.5} /> : n}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className={cn('font-serif text-xl leading-tight', !open && !done && 'text-ink/45')}>{title}</h2>
          {done && !open && <p className="mt-0.5 truncate text-xs text-stone">{summary}</p>}
        </div>
        {done && !open && (
          <button type="button" onClick={onEdit} className="text-xs underline underline-offset-4 hover:text-bronze">
            Edit
          </button>
        )}
      </header>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
            <div className="px-5 pb-6">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/** Editorial header for the summary: the pieces themselves, large. */
function SummaryHeader({ cart }: { cart: ReturnType<typeof useShop>['cart'] }) {
  const shown = cart.slice(0, 3);
  const more = cart.length - shown.length;
  return (
    <div className="mb-3">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="eyebrow">Your order</h2>
        <Link to="/bag" className="text-xs text-stone underline underline-offset-4 hover:text-ink">
          Edit bag
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {shown.map((l) => (
          <div key={l.key} className="relative aspect-[3/4] overflow-hidden bg-sand">
            <Img asset={l.image} sizes="140px" />
            {l.quantity > 1 && <span className="absolute top-1.5 right-1.5 bg-ink px-1.5 py-0.5 text-[0.6rem] text-ivory tabular-nums">×{l.quantity}</span>}
          </div>
        ))}
        {more > 0 && <div className="flex aspect-[3/4] items-center justify-center bg-mist text-sm text-stone">+{more}</div>}
      </div>
    </div>
  );
}
