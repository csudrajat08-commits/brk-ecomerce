import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, ChevronRight, Heart, MessageCircle, RotateCcw, Ruler, Truck } from 'lucide-react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router';
import { PageTop } from '../components/layout/Layout';
import { ProductCard } from '../components/product/ProductCard';
import { ProductGallery } from '../components/product/ProductGallery';
import { ColorSwatches, SizeSelector } from '../components/product/Selectors';
import { Img } from '../components/ui/Img';
import { QuantityStepper } from '../components/ui/QuantityStepper';
import { useShop } from '../context/ShopContext';
import { categoryBySlug } from '../data/catalog';
import { DEMO_WHATSAPP } from '../data/checkout';
import { commerceRules } from '../data/site';
import { useProduct, useProducts } from '../hooks/useCatalog';
import { cn, formatIDR } from '../lib/format';
import { SEGMENTS } from '../data/segments';
import { catalogStore } from '../services/catalogStore';
import PhaseStubPage from './PhaseStubPage';

/** Sample garment measurements (cm) for the size guide — confirm with BRK pattern room. */
const SIZE_GUIDE = [
  { size: 'S', bust: '86–90', waist: '70–74', hip: '92–96' },
  { size: 'M', bust: '90–94', waist: '74–78', hip: '96–100' },
  { size: 'L', bust: '94–100', waist: '78–84', hip: '100–106' },
  { size: 'XL', bust: '100–106', waist: '84–90', hip: '106–112' },
  { size: 'XXL', bust: '106–112', waist: '90–96', hip: '112–118' },
];

/** /product/:slug — full product page. */
export default function ProductPage() {
  const { slug } = useParams();
  const { data: p, loading } = useProduct(slug);
  const { data: all } = useProducts({});
  const { addToCart, setCartOpen, isWishlisted, toggleWishlist, notify } = useShop();
  const [img, setImg] = useState(0);
  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState('');
  const [qty, setQty] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const [guide, setGuide] = useState(false);

  useEffect(() => {
    if (!p) return;
    document.title = `${p.name} — Batik Riana Kesuma`;
    setImg(0);
    setSize(p.availableSizes.length === 1 ? p.availableSizes[0] : null);
    setColor(p.colors[0]?.name ?? '');
    setQty(1);
    setSizeError(false);
  }, [p]);

  const related = useMemo(() => {
    if (!p) return [];
    const same = all.filter((x) => x.id !== p.id && (p.subcategory ? x.subcategory === p.subcategory : x.category === p.category));
    const more = all.filter((x) => x.id !== p.id && x.category === p.category && !same.includes(x));
    return [...same, ...more].slice(0, 4);
  }, [all, p]);

  if (loading && !p) return <PageTop className="min-h-[60vh]" />;
  if (!p) return <PhaseStubPage title="Product not found" />;

  const cat = categoryBySlug(p.category);
  const segment = catalogStore.segmentOf(p);
  const seg = segment ? SEGMENTS[segment] : undefined;
  const sub = segment ? catalogStore.categoryBySlug(p.subcategory, segment) : undefined;
  const crumbs = [
    { label: 'Home', to: '/' },
    ...(seg && sub
      ? [{ label: seg.label, to: seg.path }, { label: sub.label, to: `${seg.path}/${sub.slug}` }]
      : cat
        ? [{ label: cat.shortName, to: cat.slug === 'women' || cat.slug === 'men' ? `/${cat.slug}` : `/shop/${cat.slug}` }]
        : []),
    { label: p.name },
  ];
  const wished = isWishlisted(p.id);
  const lowStock = p.stock > 0 && p.stock <= 5;
  const apparel = p.availableSizes.some((s) => ['S', 'M', 'L', 'XL', 'XXL'].includes(s));
  const photos = p.images.filter((im) => !im.pending);

  const add = () => {
    if (!size) {
      setSizeError(true);
      return;
    }
    addToCart(p, { size, color, quantity: qty });
    notify(`${p.name} added to your bag`);
    setCartOpen(true);
  };

  const wa = encodeURIComponent(`Halo BRK, saya ingin bertanya tentang ${p.name} (SKU ${p.sku}).`);

  return (
    <PageTop>
      <div className="container-brk pt-6 md:pt-8">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-[0.7rem] tracking-[0.06em] text-stone">
          {crumbs.map((c, i) => (
            <span key={`${c.label}-${i}`} className="flex items-center gap-1.5">
              {c.to ? (
                <Link to={c.to} className="hover:text-ink">
                  {c.label}
                </Link>
              ) : (
                <span aria-current="page" className="text-ink">
                  {c.label}
                </span>
              )}
              {i < crumbs.length - 1 && <ChevronRight size={11} strokeWidth={1.25} />}
            </span>
          ))}
        </nav>
      </div>

      <section className="container-brk grid gap-8 pt-6 pb-20 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-14 lg:pt-8 xl:gap-20">
        {/* Gallery */}
        <div className="flex gap-3 lg:sticky lg:top-24 lg:self-start">
          {photos.length > 1 && (
            <div className="hidden w-20 shrink-0 flex-col gap-2 md:flex">
              {photos.map((im, i) => (
                <button
                  key={`${im.url ?? im.src}-${i}`}
                  type="button"
                  onClick={() => setImg(i)}
                  aria-label={`Show image ${i + 1}`}
                  className={cn('relative aspect-[2/3] overflow-hidden bg-sand transition-opacity', i === img ? 'ring-1 ring-ink' : 'opacity-60 hover:opacity-100')}
                >
                  <Img asset={im} sizes="80px" />
                </button>
              ))}
            </div>
          )}
          <div className="relative aspect-[2/3] flex-1 overflow-hidden bg-sand">
            {photos.length ? <ProductGallery key={p.id} images={photos} index={img} onIndex={setImg} sizes="(min-width:1024px) 50vw, 100vw" /> : <Img asset={p.images[0]} sizes="100vw" />}
          </div>
        </div>

        {/* Details */}
        <div className="min-w-0">
          <p className="eyebrow text-bronze">{p.motif}</p>
          <h1 className="display mt-3 text-4xl md:text-5xl">{p.name}</h1>
          <div className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <p className="text-xl tabular-nums">{formatIDR(p.price)}</p>
            {p.compareAtPrice && <p className="text-sm text-stone line-through tabular-nums">{formatIDR(p.compareAtPrice)}</p>}
            {lowStock && <span className="bg-ink px-2 py-1 text-[0.6rem] font-medium tracking-[0.16em] text-ivory uppercase">Only {p.stock} left</span>}
          </div>
          <p className="mt-1 text-xs text-stone">Prices include VAT · SKU {p.sku}</p>
          <p className="mt-6 max-w-xl text-[0.95rem] leading-relaxed text-ink/80">{p.description}</p>

          <div className="mt-8 space-y-6">
            <ColorSwatches colors={p.colors} value={color} onChange={setColor} />
            <SizeSelector
              sizes={p.availableSizes}
              value={size}
              onChange={(s) => {
                setSize(s);
                setSizeError(false);
              }}
              error={sizeError}
              aside={
                apparel && (
                  <button type="button" onClick={() => setGuide((g) => !g)} className="inline-flex items-center gap-1.5 text-xs underline underline-offset-4 hover:text-bronze" aria-expanded={guide}>
                    <Ruler size={13} strokeWidth={1.4} /> Size guide
                  </button>
                )
              }
            />
            <AnimatePresence initial={false}>
              {guide && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="text-stone">
                      <tr className="border-b border-ink/15">
                        <th className="py-2 font-medium">Size</th>
                        <th className="py-2 font-medium">Bust</th>
                        <th className="py-2 font-medium">Waist</th>
                        <th className="py-2 font-medium">Hip</th>
                      </tr>
                    </thead>
                    <tbody className="tabular-nums">
                      {SIZE_GUIDE.filter((r) => p.availableSizes.includes(r.size)).map((r) => (
                        <tr key={r.size} className="border-b border-ink/8">
                          <td className="py-2 font-medium">{r.size}</td>
                          <td className="py-2">{r.bust}</td>
                          <td className="py-2">{r.waist}</td>
                          <td className="py-2">{r.hip}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="mt-2 text-[0.68rem] text-stone">Body measurements in cm — sample chart. Between sizes? Choose the larger for a relaxed batik drape.</p>
                </motion.div>
              )}
            </AnimatePresence>
            <div>
              <p className="eyebrow mb-3 text-stone">Quantity</p>
              <QuantityStepper value={qty} onChange={setQty} max={Math.max(1, Math.min(10, p.stock))} />
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button type="button" onClick={add} disabled={p.stock === 0} className="btn-ink h-13 flex-1">
              {p.stock === 0 ? 'Sold out' : `Add to Bag · ${formatIDR(p.price * qty)}`}
            </button>
            <button
              type="button"
              onClick={() => {
                toggleWishlist(p.id);
                notify(wished ? 'Removed from wishlist' : 'Saved to wishlist');
              }}
              aria-pressed={wished}
              aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
              className="btn-outline h-13 w-13 px-0"
            >
              <Heart size={18} strokeWidth={1.25} fill={wished ? 'currentColor' : 'none'} />
            </button>
          </div>
          <a href={`https://wa.me/${DEMO_WHATSAPP}?text=${wa}`} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-xs text-stone hover:text-ink">
            <MessageCircle size={14} strokeWidth={1.4} /> Ask the atelier on WhatsApp (demo number)
          </a>

          <div className="mt-10 border-t border-ink/15">
            <Detail title="Details & material" open>
              <dl className="grid grid-cols-[7rem_1fr] gap-y-2 text-sm">
                <dt className="text-stone">Material</dt>
                <dd>{p.material}</dd>
                <dt className="text-stone">Technique</dt>
                <dd>{p.technique}</dd>
                <dt className="text-stone">Motif</dt>
                <dd>{p.motif}</dd>
                <dt className="text-stone">Colours</dt>
                <dd>{p.colors.map((c) => c.name).join(', ')}</dd>
              </dl>
            </Detail>
            <Detail title="Care">
              <p className="text-sm leading-relaxed text-ink/80">
                Hand wash cold with a mild, lerak-based or pH-neutral soap, or dry clean. Do not wring. Dry in the shade, inside out, and iron on the reverse at low heat. Natural dyes
                soften gracefully over time.
              </p>
            </Detail>
            <Detail title="Shipping & returns">
              <ul className="space-y-3 text-sm text-ink/80">
                <li className="flex gap-3">
                  <Truck size={16} strokeWidth={1.3} className="mt-0.5 shrink-0" />
                  Regular shipping across Indonesia in 2–4 working days — free over {formatIDR(commerceRules.freeShippingThreshold)}. Express 1–2 days, or pick up at the Bintaro or Solo
                  showroom.
                </li>
                <li className="flex gap-3">
                  <RotateCcw size={16} strokeWidth={1.3} className="mt-0.5 shrink-0" />
                  Returns and exchanges within 7 days for unworn pieces with tags attached.
                </li>
              </ul>
            </Detail>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="bg-paper py-16 md:py-24" aria-labelledby="related-title">
          <div className="container-brk">
            <p className="eyebrow text-stone">Complete the look</p>
            <h2 id="related-title" className="display mt-3 text-4xl md:text-5xl">
              You may also like
            </h2>
            <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-4 md:gap-x-6">
              {related.map((r) => (
                <ProductCard key={r.id} product={r} sizes="(min-width:768px) 25vw, 50vw" />
              ))}
            </div>
          </div>
        </section>
      )}
    </PageTop>
  );
}

function Detail({ title, open: initial, children }: { title: string; open?: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(!!initial);
  return (
    <div className="border-b border-ink/15">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center justify-between py-4 text-left">
        <span className="eyebrow text-[0.68rem]">{title}</span>
        <ChevronDown size={16} strokeWidth={1.3} className={cn('transition-transform', open && 'rotate-180')} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="pb-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
