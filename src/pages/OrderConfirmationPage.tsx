import { Check, FileText, MessageCircle } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { PageTop } from '../components/layout/Layout';
import { DEMO_WHATSAPP, PAYMENT_OPTIONS, SHIPPING_OPTIONS } from '../data/checkout';
import { formatIDR } from '../lib/format';
import { readLastOrder, simulatePayment } from '../services/orders';

export default function OrderConfirmationPage() {
  const [order, setOrder] = useState(readLastOrder);

  useEffect(() => {
    document.title = 'Order confirmation — Batik Riana Kesuma';
  }, []);

  if (!order)
    return (
      <PageTop>
        <section className="container-brk flex min-h-[55vh] flex-col items-center justify-center py-20 text-center">
          <h1 className="display text-5xl">No recent order</h1>
          <p className="mt-4 text-sm text-stone">Place a demo order from your bag to see the confirmation here.</p>
          <Link to="/women" className="btn-ink mt-8">
            Shop Women
          </Link>
        </section>
      </PageTop>
    );

  const d = order.draft;
  const ship = SHIPPING_OPTIONS.find((o) => o.id === d.shipping.pickupStore) ?? SHIPPING_OPTIONS.find((o) => o.method === d.shipping.method);
  const pay = PAYMENT_OPTIONS.find((o) => o.id === d.payment.method);
  const waText = encodeURIComponent(
    [
      `Halo BRK, saya ingin konfirmasi pesanan ${order.reference} (DEMO):`,
      ...d.lines.map((l) => `• ${l.name} — ${l.color}, ${l.size} × ${l.quantity}`),
      `Total: ${formatIDR(d.totals.total)}`,
      `Nama: ${d.customer.fullName}`,
    ].join('\n'),
  );

  return (
    <PageTop>
      <section className="container-brk max-w-4xl pt-10 pb-24 md:pt-16">
        <div className="text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ink text-ivory">
            <Check size={24} strokeWidth={1.5} />
          </span>
          <p className="eyebrow mt-6 text-bronze">Order placed — demo</p>
          <h1 className="display mt-4 text-5xl md:text-6xl">Terima kasih, {d.customer.fullName.split(' ')[0]}.</h1>
          <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-stone">
            Your order reference is <span className="font-medium text-ink">{order.reference}</span>. A confirmation would be sent to {d.customer.email}.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3">
            <span
              className={`inline-flex items-center gap-2 px-3 py-1.5 text-[0.65rem] font-medium tracking-[0.18em] uppercase ${order.payment.state === 'paid' ? 'bg-[#3f8f5a]/12 text-[#2f6f45]' : 'bg-bronze/15 text-bronze'}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${order.payment.state === 'paid' ? 'bg-[#3f8f5a]' : 'bg-bronze'}`} />
              {order.payment.state === 'paid' ? 'Payment received (demo)' : 'Awaiting payment'}
            </span>
            {order.payment.state !== 'paid' && (
              <button type="button" onClick={() => setOrder(simulatePayment(order.reference))} className="text-xs underline underline-offset-4 hover:text-bronze">
                Simulate payment for the presentation (demo)
              </button>
            )}
            <p className="bg-bronze/12 px-4 py-2.5 text-xs">Prototype order: nothing was sent to BRK and no real payment is processed.</p>
          </div>
        </div>

        <div className="mt-14 grid gap-px bg-ink/10 md:grid-cols-3">
          <Info title="Delivery">
            {d.shipping.method === 'pickup' ? (
              <>
                {ship?.label}
                <br />
                <span className="text-stone">{ship?.detail}</span>
              </>
            ) : (
              <>
                {d.customer.fullName}
                <br />
                <span className="text-stone">
                  {d.shipping.address}, {d.shipping.district}, {d.shipping.city}, {d.shipping.province} {d.shipping.postalCode}
                </span>
              </>
            )}
          </Info>
          <Info title="Method">
            {d.shipping.service}
            <br />
            <span className="text-stone">{ship?.eta}</span>
          </Info>
          <Info title="Payment">
            {pay?.label}
            {d.payment.channel ? ` — ${d.payment.channel}` : ''}
            <br />
            <span className="text-stone">Payment instructions would appear here in the live store.</span>
          </Info>
        </div>

        <div className="mt-10 bg-paper p-6 md:p-8">
          <h2 className="eyebrow mb-4">Your order</h2>
          <ul className="divide-y divide-ink/10">
            {d.lines.map((l, i) => (
              <li key={`${l.sku}-${i}`} className="flex justify-between gap-4 py-3 text-sm">
                <span>
                  {l.name}
                  <span className="block text-xs text-stone">
                    {l.color} · {l.size} · × {l.quantity} · SKU {l.sku}
                  </span>
                </span>
                <span className="shrink-0 tabular-nums">{formatIDR(l.unitPrice * l.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-1.5 border-t border-ink/10 pt-4 text-sm">
            <Line label="Subtotal" value={formatIDR(d.totals.subtotal)} />
            {d.totals.discount > 0 && <Line label={`Discount (${d.promoCode})`} value={`–${formatIDR(d.totals.discount)}`} />}
            <Line label="Shipping" value={d.totals.shipping ? formatIDR(d.totals.shipping) : 'Free'} />
            {d.totals.giftWrap > 0 && <Line label="Gift wrap" value={formatIDR(d.totals.giftWrap)} />}
            <div className="flex justify-between border-t border-ink/10 pt-3 text-base">
              <dt className="eyebrow self-center">Total</dt>
              <dd className="tabular-nums">{formatIDR(d.totals.total)}</dd>
            </div>
          </dl>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link to={`/orders/${order.reference}/invoice`} className="btn-ink">
            <FileText size={15} strokeWidth={1.25} /> View invoice
          </Link>
          <a href={`https://wa.me/${DEMO_WHATSAPP}?text=${waText}`} target="_blank" rel="noreferrer" className="btn-outline">
            <MessageCircle size={15} strokeWidth={1.25} /> Confirm via WhatsApp (demo number)
          </a>
          <Link to="/women" className="btn-outline">
            Continue shopping
          </Link>
        </div>
      </section>
    </PageTop>
  );
}

function Info({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-ivory p-5 md:p-6">
      <h3 className="eyebrow mb-3 text-[0.62rem] text-stone">{title}</h3>
      <p className="text-sm leading-relaxed">{children}</p>
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-stone">{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}
