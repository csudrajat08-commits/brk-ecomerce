import { Briefcase, Check, Factory, Globe2, Palette } from 'lucide-react';
import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router';
import { FloatInput } from '../components/checkout/CheckoutFields';
import { CatalogHeader } from '../components/catalog/CatalogHeader';
import { PageTop } from '../components/layout/Layout';
import { Img } from '../components/ui/Img';
import { Reveal } from '../components/ui/Reveal';
import { DEMO_WHATSAPP } from '../data/checkout';
import { contact } from '../data/site';
import { siteAssets } from '../data/siteAssets';
import { cn, pad2 } from '../lib/format';
import { orders } from '../services/orders';
import type { InquiryDraft } from '../types/commerce';

type InquiryType = InquiryDraft['type'];

const SERVICES: Array<{ type: InquiryType; title: string; text: string; icon: ReactNode }> = [
  { type: 'uniform', title: 'Corporate Uniforms', text: 'Batik uniforms for offices, hospitality and events — a motif and colourway developed for your organisation.', icon: <Briefcase size={18} strokeWidth={1.3} /> },
  { type: 'custom', title: 'Custom Batik Orders', text: 'Commission a motif, a family cloth or a ceremonial set, hand-drawn in Solo to your brief.', icon: <Palette size={18} strokeWidth={1.3} /> },
  { type: 'wholesale', title: 'Wholesale', text: 'Collections for boutiques, museum shops and distributors in Indonesia and abroad.', icon: <Globe2 size={18} strokeWidth={1.3} /> },
  { type: 'oem', title: 'Private Label / OEM', text: 'Your label, our atelier — development through production, from hand-loomed silk to cotton.', icon: <Factory size={18} strokeWidth={1.3} /> },
];

const TERMS = [
  { k: 'Minimum order', v: 'Flexible — no minimum quantity' },
  { k: 'Capacity', v: '≈ 300 pieces per month' },
  { k: 'Materials', v: 'ATBM hand-loomed silk & cotton' },
  { k: 'OEM / ODM / Private label', v: 'Accepted' },
  { k: 'Payment', v: '50% down payment or Letter of Credit' },
  { k: 'Markets', v: 'Indonesia, Japan, Europe' },
];

const STEPS = [
  { title: 'Brief', text: 'Tell us the occasion, quantity, timeline and any motif or colour references.' },
  { title: 'Proposal', text: 'The atelier replies with options, sample fabrics, pricing and a production schedule.' },
  { title: 'Sampling', text: 'We drape and adjust a sample piece with you before production begins.' },
  { title: 'Production', text: 'Drawn, waxed and dyed in Solo, finished, checked and delivered.' },
];

const QUANTITIES = ['1–20 pcs', '21–100 pcs', '101–300 pcs', '300+ pcs'];
const TIMELINES = ['Within 1 month', '1–3 months', '3–6 months', 'Flexible'];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^(\+?\d{2,3}|0)\d{8,13}$/;

const isType = (v: string | null): v is InquiryType => SERVICES.some((s) => s.type === v);

export default function WholesalePage() {
  const [params] = useSearchParams();
  const initial = params.get('type');
  const [type, setType] = useState<InquiryType>(isType(initial) ? initial : 'uniform');
  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '', quantity: '', timeline: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Wholesale & Custom Orders — Batik Riana Kesuma';
  }, []);
  useEffect(() => {
    if (isType(initial)) {
      setType(initial);
      requestAnimationFrame(() => document.getElementById('enquiry')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }
  }, [initial]);

  const set = (k: keyof typeof form, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: '' }));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (form.name.trim().length < 3) er.name = 'Enter your name';
    if (!EMAIL_RE.test(form.email.trim())) er.email = 'Enter a valid email address';
    if (!PHONE_RE.test(form.phone.replace(/[\s-]/g, ''))) er.phone = 'Enter a phone / WhatsApp number';
    if ((type === 'uniform' || type === 'wholesale' || type === 'oem') && form.company.trim().length < 2) er.company = 'Enter your company or organisation';
    if (form.message.trim().length < 15) er.message = 'Tell us a little more (at least 15 characters)';
    setErrors(er);
    if (Object.keys(er).length) {
      requestAnimationFrame(() => document.querySelector<HTMLElement>('#enquiry [aria-invalid="true"]')?.focus());
      return;
    }
    setBusy(true);
    const { reference } = await orders.submitInquiry({ type, ...form, company: form.company || undefined, quantity: form.quantity || undefined, timeline: form.timeline || undefined });
    setBusy(false);
    setSent(reference);
  };

  const service = SERVICES.find((s) => s.type === type)!;
  const wa = encodeURIComponent(`Halo BRK, saya ingin bertanya tentang ${service.title}.`);

  return (
    <PageTop>
      <CatalogHeader
        id="wholesale"
        eyebrow="Atelier services"
        title="Wholesale & Custom Orders"
        description="Uniforms, commissions and trade orders are made to brief and quoted individually — not through the retail checkout."
        count={0}
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Wholesale & Custom' }]}
      />

      {/* Services */}
      <section className="container-brk pt-10 pb-16 md:pt-14 md:pb-24">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {SERVICES.map((s, i) => (
            <Reveal key={s.type} delay={i * 0.06}>
              <button
                type="button"
                onClick={() => {
                  setType(s.type);
                  document.getElementById('enquiry')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className={cn('group flex h-full w-full flex-col border p-5 text-left transition-colors md:p-6', type === s.type ? 'border-ink bg-paper' : 'border-ink/12 bg-paper/50 hover:border-ink/40')}
              >
                <span className="flex items-center justify-between">
                  <span className={cn('flex h-10 w-10 items-center justify-center transition-colors', type === s.type ? 'bg-ink text-ivory' : 'bg-mist')}>{s.icon}</span>
                  <span className="text-xs text-stone tabular-nums">{pad2(i + 1)}</span>
                </span>
                <span className="mt-6 font-serif text-2xl leading-tight">{s.title}</span>
                <span className="mt-2 text-sm leading-relaxed text-stone">{s.text}</span>
                <span className="mt-auto pt-5 text-xs tracking-[0.14em] uppercase">
                  <span className="link-draw">Enquire</span> →
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Terms + imagery */}
      <section className="bg-sand/45 py-16 md:py-24">
        <div className="container-brk grid gap-10 lg:grid-cols-12 lg:gap-12">
          <Reveal className="lg:col-span-5">
            <div className="relative aspect-[4/5] overflow-hidden bg-sand">
              <Img asset={siteAssets.wholesaleServices} sizes="(min-width:1024px) 40vw, 100vw" />
            </div>
          </Reveal>
          <div className="lg:col-span-7">
            <Reveal>
              <p className="eyebrow text-stone">Trade terms</p>
              <h2 className="display mt-4 text-4xl md:text-5xl">
                Made in Solo, <em>to your brief.</em>
              </h2>
            </Reveal>
            <dl className="mt-10 grid gap-x-8 gap-y-6 sm:grid-cols-2">
              {TERMS.map((t) => (
                <div key={t.k} className="border-t border-ink/15 pt-4">
                  <dt className="eyebrow text-[0.6rem] text-stone">{t.k}</dt>
                  <dd className="mt-2 text-sm">{t.v}</dd>
                </div>
              ))}
            </dl>
            <ol className="mt-12 grid gap-6 sm:grid-cols-2">
              {STEPS.map((s, i) => (
                <li key={s.title} className="flex gap-4">
                  <span className="font-serif text-2xl text-bronze italic">{i + 1}</span>
                  <span>
                    <span className="block font-serif text-xl">{s.title}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-ink/75">{s.text}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Enquiry form */}
      <section id="enquiry" className="scroll-mt-28 py-16 md:py-24">
        <div className="container-brk grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <p className="eyebrow text-stone">Start an enquiry</p>
            <h2 className="display mt-4 text-4xl md:text-5xl">Tell us about your project.</h2>
            <p className="mt-5 text-sm leading-relaxed text-ink/75">Our atelier team replies within two working days with options, timelines and pricing.</p>
            <div className="mt-8 space-y-2 text-sm">
              <p className="text-stone">Prefer to talk?</p>
              <a href={`https://wa.me/${DEMO_WHATSAPP}?text=${wa}`} target="_blank" rel="noreferrer" className="link-under">
                WhatsApp the atelier (demo number)
              </a>
              <p>
                <a href={`mailto:${contact.email}`} className="link-draw break-all">
                  {contact.email}
                </a>
              </p>
            </div>
          </div>

          <div className="lg:col-span-8">
            {sent ? (
              <div className="bg-paper p-8 md:p-12">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-ivory">
                  <Check size={20} strokeWidth={1.6} />
                </span>
                <h3 className="display mt-6 text-4xl">Thank you, {form.name.split(' ')[0]}.</h3>
                <p className="mt-4 max-w-lg text-sm leading-relaxed text-ink/75">
                  Your {service.title.toLowerCase()} enquiry has reference <span className="font-medium text-ink">{sent}</span>. In the live site the atelier would reply to {form.email} within two working days.
                </p>
                <p className="mt-5 inline-block bg-bronze/12 px-4 py-2.5 text-xs">Prototype: the enquiry was not sent to BRK.</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSent(null);
                      setForm({ name: '', company: '', email: '', phone: '', quantity: '', timeline: '', message: '' });
                    }}
                    className="btn-outline"
                  >
                    New enquiry
                  </button>
                  <Link to="/" className="btn-ink">
                    Back to home
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} noValidate className="bg-paper p-5 md:p-10">
                <fieldset>
                  <legend className="eyebrow mb-3 text-[0.62rem] text-stone">Enquiry type</legend>
                  <div className="flex flex-wrap gap-2">
                    {SERVICES.map((s) => (
                      <button
                        key={s.type}
                        type="button"
                        aria-pressed={type === s.type}
                        onClick={() => setType(s.type)}
                        className={cn('h-10 border px-4 text-xs transition-colors active:scale-95', type === s.type ? 'border-ink bg-ink text-ivory' : 'border-ink/20 hover:border-ink')}
                      >
                        {s.title}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <FloatInput label="Full name" autoComplete="name" value={form.name} onChange={(e) => set('name', e.target.value)} error={errors.name} />
                  <FloatInput
                    label={type === 'custom' ? 'Company (optional)' : 'Company / organisation'}
                    autoComplete="organization"
                    value={form.company}
                    onChange={(e) => set('company', e.target.value)}
                    error={errors.company}
                  />
                  <FloatInput label="Email" type="email" autoComplete="email" value={form.email} onChange={(e) => set('email', e.target.value)} error={errors.email} />
                  <FloatInput label="Phone / WhatsApp" type="tel" inputMode="tel" autoComplete="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} error={errors.phone} />
                </div>

                <ChoiceRow label="Estimated quantity" options={QUANTITIES} value={form.quantity} onChange={(v) => set('quantity', v)} />
                <ChoiceRow label="Timeline" options={TIMELINES} value={form.timeline} onChange={(v) => set('timeline', v)} />

                <label className="mt-6 block">
                  <span className="eyebrow mb-2 block text-[0.62rem] text-stone">Your brief</span>
                  <textarea
                    rows={5}
                    value={form.message}
                    onChange={(e) => set('message', e.target.value)}
                    aria-invalid={!!errors.message}
                    placeholder="Occasion, garment types, colours or motifs you have in mind, sizes, delivery city…"
                    className={cn('w-full border bg-ivory/50 px-4 py-3 text-sm leading-relaxed placeholder:text-stone/60 focus:outline-none', errors.message ? 'border-danger' : 'border-ink/12 focus:border-ink')}
                  />
                  {errors.message && <span className="mt-1 block text-xs text-danger">{errors.message}</span>}
                </label>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <button type="submit" disabled={busy} className="btn-ink">
                    {busy ? 'Sending…' : 'Send enquiry'}
                  </button>
                  <p className="text-xs text-stone">Demo — nothing is sent. No payment is involved.</p>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </PageTop>
  );
}

function ChoiceRow({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <fieldset className="mt-6">
      <legend className="eyebrow mb-3 text-[0.62rem] text-stone">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            aria-pressed={value === o}
            onClick={() => onChange(value === o ? '' : o)}
            className={cn('h-9 border px-3 text-xs transition-colors active:scale-95', value === o ? 'border-ink bg-ink text-ivory' : 'border-ink/20 hover:border-ink')}
          >
            {o}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
