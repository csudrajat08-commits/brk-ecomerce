import { ArrowLeft, Download, Printer } from 'lucide-react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router';
import { PAYMENT_OPTIONS, SHIPPING_OPTIONS } from '../data/checkout';
import { contact, invoiceIssuer } from '../data/site';
import { cn, formatIDR } from '../lib/format';
import { getOrder, simulatePayment, type PlacedOrder } from '../services/orders';

/** Payment method names in Indonesian for the invoice document */
const PAY_ID: Record<string, string> = { va: 'Transfer bank (Virtual Account)', qris: 'QRIS', ewallet: 'Dompet digital', card: 'Kartu kredit / debit' };

const dateFmt = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
const dateTimeFmt = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

/** Tiny deterministic "QR-like" verification mark (decorative — not a scannable code). */
function VerifyMark({ seed }: { seed: string }) {
  const cells = useMemo(() => {
    let h = 2166136261;
    for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
    return Array.from({ length: 121 }, (_, i) => {
      h = Math.imul(h ^ (i * 2654435761), 16777619);
      const x = i % 11;
      const y = Math.floor(i / 11);
      const finder = (x < 3 && y < 3) || (x > 7 && y < 3) || (x < 3 && y > 7);
      return finder || (h >>> 28) % 2 === 0;
    });
  }, [seed]);
  return (
    <svg viewBox="0 0 11 11" className="h-20 w-20" aria-hidden shapeRendering="crispEdges">
      {cells.map((on, i) => (on ? <rect key={i} x={i % 11} y={Math.floor(i / 11)} width="1" height="1" fill="#242424" /> : null))}
    </svg>
  );
}

export default function InvoicePage() {
  const { reference = '' } = useParams();
  const [order, setOrder] = useState<PlacedOrder | null>(() => getOrder(reference));

  useEffect(() => {
    document.title = order ? `Invoice ${order.invoiceNumber} — Batik Riana Kesuma` : 'Invoice — Batik Riana Kesuma';
  }, [order]);

  if (!order)
    return (
      <main className="container-brk flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
        <h1 className="display text-4xl">Invoice tidak ditemukan</h1>
        <p className="mt-3 text-sm text-stone">Invoice demo hanya tersimpan di browser tempat pesanan dibuat.</p>
        <Link to="/" className="btn-ink mt-8">
          Kembali ke beranda
        </Link>
      </main>
    );

  const d = order.draft;
  const paid = order.payment.state === 'paid';
  const ship = SHIPPING_OPTIONS.find((o) => o.id === d.shipping.pickupStore) ?? SHIPPING_OPTIONS.find((o) => o.method === d.shipping.method);
  const pay = PAYMENT_OPTIONS.find((o) => o.id === d.payment.method);
  const vat = Math.round((d.totals.total * invoiceIssuer.vatRate) / (1 + invoiceIssuer.vatRate));
  const dpp = d.totals.total - vat;
  const issued = new Date(order.createdAt);

  return (
    <div className="min-h-screen bg-mist py-6 print:bg-white print:py-0 md:py-10">
      {/* Toolbar (screen only) */}
      <div className="mx-auto mb-5 flex max-w-[860px] flex-wrap items-center justify-between gap-3 px-4 print:hidden">
        <Link to="/checkout/confirmation" className="inline-flex items-center gap-2 text-xs text-stone hover:text-ink">
          <ArrowLeft size={14} strokeWidth={1.25} /> Kembali ke pesanan
        </Link>
        <div className="flex flex-wrap gap-2">
          {!paid && (
            <button type="button" onClick={() => setOrder(simulatePayment(order.reference))} className="btn-outline h-10 px-4 text-[0.65rem]">
              Simulasikan pembayaran (demo)
            </button>
          )}
          <button type="button" onClick={() => window.print()} className="btn-outline h-10 px-4 text-[0.65rem]">
            <Printer size={14} strokeWidth={1.25} /> Cetak
          </button>
          <button type="button" onClick={() => window.print()} className="btn-ink h-10 px-4 text-[0.65rem]" title="Pilih “Save as PDF” di dialog cetak">
            <Download size={14} strokeWidth={1.25} /> Download PDF
          </button>
        </div>
      </div>

      {/* The document */}
      <article className="relative mx-auto max-w-[860px] overflow-hidden bg-paper px-6 py-8 text-ink shadow-[0_20px_60px_-30px_rgba(36,36,36,.35)] print:max-w-none print:px-0 print:py-0 print:shadow-none md:px-12 md:py-12">
        {/* Demo watermark */}
        <span
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-[24deg] font-serif text-[7rem] whitespace-nowrap text-ink/[0.05] select-none md:text-[10rem]"
          aria-hidden
        >
          CONTOH · DEMO
        </span>

        {/* Header */}
        <header className="relative flex flex-col gap-6 border-b border-ink/15 pb-8 sm:flex-row sm:justify-between">
          <div>
            <p className="text-[0.55rem] font-medium tracking-[0.5em] uppercase opacity-80">Batik</p>
            <p className="font-serif text-3xl leading-none">Riana Kesuma</p>
            <p className="mt-4 max-w-xs text-xs leading-relaxed text-stone">
              {invoiceIssuer.address}
              <br />
              {contact.email} · WA {contact.whatsapp}
              <br />
              NPWP {invoiceIssuer.npwp}
            </p>
          </div>
          <div className="sm:text-right">
            <h1 className="font-serif text-4xl tracking-[0.04em]">INVOICE</h1>
            <dl className="mt-3 space-y-1 text-xs">
              <Meta k="No. invoice" v={order.invoiceNumber} strong />
              <Meta k="No. pesanan" v={order.reference} />
              <Meta k="Tanggal" v={dateFmt.format(issued)} />
            </dl>
            <span
              className={cn(
                'mt-4 inline-flex items-center gap-2 px-3 py-1.5 text-[0.65rem] font-medium tracking-[0.18em] uppercase',
                paid ? 'bg-[#3f8f5a]/12 text-[#2f6f45]' : 'bg-bronze/15 text-bronze',
              )}
            >
              <span className={cn('h-1.5 w-1.5 rounded-full', paid ? 'bg-[#3f8f5a]' : 'bg-bronze')} />
              {paid ? 'Lunas (demo)' : 'Menunggu pembayaran'}
            </span>
          </div>
        </header>

        {/* Parties */}
        <section className="relative grid gap-6 border-b border-ink/15 py-7 sm:grid-cols-2">
          <Party title="Ditagihkan kepada">
            {d.taxInvoice ? (
              <>
                <b className="font-medium">{d.taxInvoice.companyName}</b>
                <br />
                NPWP {d.taxInvoice.npwp}
                <br />
                {d.taxInvoice.address}
                <br />
                <span className="text-stone">u.p. {d.customer.fullName}</span>
              </>
            ) : (
              <b className="font-medium">{d.customer.fullName}</b>
            )}
            <br />
            <span className="text-stone">
              {d.customer.email} · {d.customer.phone}
            </span>
          </Party>
          <Party title={d.shipping.method === 'pickup' ? 'Diambil di' : 'Dikirim ke'}>
            {d.shipping.method === 'pickup' ? (
              <>
                <b className="font-medium">{ship?.label}</b>
                <br />
                <span className="text-stone">{ship?.detail}</span>
              </>
            ) : (
              <>
                <b className="font-medium">{d.customer.fullName}</b> · {d.customer.phone}
                <br />
                {d.shipping.address}, {d.shipping.district}, {d.shipping.city}, {d.shipping.province} {d.shipping.postalCode}
              </>
            )}
            {d.shipping.method !== 'pickup' && (
              <>
                <br />
                <span className="text-stone">{d.shipping.service}</span>
              </>
            )}
          </Party>
        </section>

        {/* Lines */}
        <section className="relative py-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink/15 text-left text-[0.62rem] tracking-[0.14em] text-stone uppercase">
                <th className="pb-3 font-medium">Produk</th>
                <th className="hidden pb-3 font-medium sm:table-cell">SKU</th>
                <th className="pb-3 text-center font-medium">Qty</th>
                <th className="hidden pb-3 text-right font-medium sm:table-cell">Harga</th>
                <th className="pb-3 text-right font-medium">Jumlah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {d.lines.map((l, i) => (
                <tr key={`${l.sku}-${i}`} className="align-top">
                  <td className="py-3 pr-3 break-words">
                    {l.name}
                    <span className="block text-xs text-stone">
                      {l.color} · {l.size}
                      <span className="sm:hidden"> · {l.sku}</span>
                    </span>
                  </td>
                  <td className="hidden py-3 pr-3 text-xs text-stone sm:table-cell">{l.sku}</td>
                  <td className="py-3 text-center tabular-nums">{l.quantity}</td>
                  <td className="hidden py-3 text-right whitespace-nowrap tabular-nums sm:table-cell">{formatIDR(l.unitPrice)}</td>
                  <td className="py-3 text-right whitespace-nowrap tabular-nums">{formatIDR(l.unitPrice * l.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <dl className="mt-6 ml-auto max-w-sm space-y-1.5 border-t border-ink/15 pt-4 text-sm">
            <Line k="Subtotal" v={formatIDR(d.totals.subtotal)} />
            {d.totals.discount > 0 && <Line k={`Diskon (${d.promoCode})`} v={`–${formatIDR(d.totals.discount)}`} />}
            <Line k="Ongkos kirim" v={d.totals.shipping ? formatIDR(d.totals.shipping) : 'Gratis'} />
            {d.totals.giftWrap > 0 && <Line k="Bungkus kado" v={formatIDR(d.totals.giftWrap)} />}
            <div className="flex items-baseline justify-between border-t border-ink/15 pt-3">
              <dt className="text-[0.68rem] font-medium tracking-[0.18em] uppercase">Total</dt>
              <dd className="font-serif text-2xl tabular-nums">{formatIDR(d.totals.total)}</dd>
            </div>
            <Line k={`DPP`} v={formatIDR(dpp)} muted />
            <Line k={`PPN ${Math.round(invoiceIssuer.vatRate * 100)}% (sudah termasuk)`} v={formatIDR(vat)} muted />
          </dl>
        </section>

        {/* Payment + footer */}
        <footer className="relative grid gap-6 border-t border-ink/15 pt-7 sm:grid-cols-[1fr_auto]">
          <div className="text-xs leading-relaxed">
            <p className="text-[0.62rem] font-medium tracking-[0.14em] text-stone uppercase">Pembayaran</p>
            <p className="mt-2">
              {PAY_ID[d.payment.method] ?? pay?.label}
              {d.payment.channel ? ` — ${d.payment.channel}` : ''}
              <br />
              {paid ? (
                <>
                  Dibayar {dateTimeFmt.format(new Date(order.payment.paidAt!))} · Ref. {order.payment.reference}
                </>
              ) : (
                <span className="text-stone">Belum dibayar — instruksi pembayaran akan muncul di sini pada toko asli.</span>
              )}
            </p>
            <p className="mt-5 text-stone">
              Terima kasih telah berbelanja di Batik Riana Kesuma. Retur dalam {invoiceIssuer.returnsDays} hari untuk produk dengan label lengkap. Pertanyaan: {contact.email} ·
              WA {contact.whatsapp}.
            </p>
            <p className="mt-3 text-[0.65rem] text-danger/80">Dokumen contoh untuk presentasi prototipe — bukan bukti transaksi atau faktur pajak yang sah.</p>
          </div>
          <div className="flex flex-col items-start gap-1.5 sm:items-end">
            <VerifyMark seed={order.invoiceNumber} />
            <span className="text-[0.6rem] text-stone">Verifikasi invoice (demo)</span>
          </div>
        </footer>
      </article>
    </div>
  );
}

function Meta({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <div className="flex gap-3 sm:justify-end">
      <dt className="text-stone">{k}</dt>
      <dd className={cn('tabular-nums', strong && 'font-medium')}>{v}</dd>
    </div>
  );
}
function Party({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[0.62rem] font-medium tracking-[0.14em] text-stone uppercase">{title}</p>
      <p className="text-sm leading-relaxed">{children}</p>
    </div>
  );
}
function Line({ k, v, muted }: { k: string; v: string; muted?: boolean }) {
  return (
    <div className={cn('flex justify-between gap-4', muted && 'text-xs text-stone')}>
      <dt className={muted ? '' : 'text-stone'}>{k}</dt>
      <dd className="tabular-nums">{v}</dd>
    </div>
  );
}
