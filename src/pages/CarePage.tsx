import { useEffect, type ReactNode } from 'react';
import { Link, NavLink, useParams } from 'react-router';
import { CatalogHeader } from '../components/catalog/CatalogHeader';
import { PageTop } from '../components/layout/Layout';
import { GIFT_WRAP_PRICE, SHIPPING_OPTIONS } from '../data/checkout';
import { commerceRules, contact, invoiceIssuer } from '../data/site';
import { cn, formatIDR } from '../lib/format';
import PhaseStubPage from './PhaseStubPage';

const P = ({ children }: { children: ReactNode }) => <p className="text-[0.95rem] leading-relaxed text-ink/80">{children}</p>;
const H = ({ children }: { children: ReactNode }) => <h2 className="mt-10 font-serif text-2xl first:mt-0">{children}</h2>;

/** Customer-care topics. Policies are SAMPLE text for the prototype — confirm with BRK before launch. */
const TOPICS: Record<string, { title: string; group: 'Help' | 'Legal'; body: () => ReactNode }> = {
  shipping: {
    title: 'Shipping & Delivery',
    group: 'Help',
    body: () => (
      <>
        <P>We ship across Indonesia from our Bintaro head office. Orders placed before 14:00 WIB on a working day leave the atelier the same day.</P>
        <table className="mt-6 w-full text-left text-sm">
          <thead className="text-xs text-stone">
            <tr className="border-b border-ink/15">
              <th className="py-2 font-medium">Service</th>
              <th className="py-2 font-medium">Time</th>
              <th className="py-2 text-right font-medium">Cost</th>
            </tr>
          </thead>
          <tbody>
            {SHIPPING_OPTIONS.map((o) => (
              <tr key={o.id} className="border-b border-ink/8">
                <td className="py-3">
                  {o.label}
                  <span className="block text-xs text-stone">{o.detail}</span>
                </td>
                <td className="py-3">{o.eta}</td>
                <td className="py-3 text-right tabular-nums">{o.price ? formatIDR(o.price) : 'Free'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <P>
          <br />
          Regular shipping is free on orders above {formatIDR(commerceRules.freeShippingThreshold)}. Batik gift wrap with a handwritten card is available at checkout for{' '}
          {formatIDR(GIFT_WRAP_PRICE)}. International shipping and trade orders are arranged individually — see <Link to="/wholesale" className="link-under">Wholesale & Custom</Link>.
        </P>
      </>
    ),
  },
  returns: {
    title: 'Returns & Exchanges',
    group: 'Help',
    body: () => (
      <>
        <P>Pieces can be returned or exchanged within {invoiceIssuer.returnsDays} days of delivery if they are unworn, unwashed and have their tags attached.</P>
        <H>How to return</H>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-[0.95rem] text-ink/80">
          <li>WhatsApp or email us your order number and the piece you’d like to return or exchange.</li>
          <li>We send a return address — or bring it to the Bintaro or Solo showroom.</li>
          <li>Refunds go back to the original payment method within 7 working days of receipt.</li>
        </ol>
        <H>Not returnable</H>
        <P>Made-to-order and custom pieces, uniforms, fabric cut to length and items on final sale.</P>
      </>
    ),
  },
  'size-guide': {
    title: 'Size Guide',
    group: 'Help',
    body: () => (
      <>
        <P>Body measurements in centimetres. Batik outers and dresses are cut with ease — if you are between sizes, choose the larger for a relaxed drape.</P>
        <table className="mt-6 w-full text-left text-sm tabular-nums">
          <thead className="text-xs text-stone">
            <tr className="border-b border-ink/15">
              {['Size', 'Bust', 'Waist', 'Hip'].map((h) => (
                <th key={h} className="py-2 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['S', '86–90', '70–74', '92–96'],
              ['M', '90–94', '74–78', '96–100'],
              ['L', '94–100', '78–84', '100–106'],
              ['XL', '100–106', '84–90', '106–112'],
              ['XXL', '106–112', '90–96', '112–118'],
            ].map((r) => (
              <tr key={r[0]} className="border-b border-ink/8">
                {r.map((c, i) => (
                  <td key={i} className={cn('py-3', i === 0 && 'font-medium')}>
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <P>
          <br />
          Need help? Our showrooms offer fittings and small alterations.
        </P>
      </>
    ),
  },
  'batik-care': {
    title: 'Batik Care',
    group: 'Help',
    body: () => (
      <>
        <P>Hand-drawn batik and natural dyes last for generations with gentle care.</P>
        <ul className="mt-6 space-y-3 text-[0.95rem] text-ink/80">
          <li>— Hand wash in cold water with lerak (soapberry) or a pH-neutral detergent; silk can also be dry cleaned.</li>
          <li>— Do not soak, bleach or wring. Rinse well and press out water in a towel.</li>
          <li>— Dry inside out in the shade — direct sun fades natural sogan and indigo.</li>
          <li>— Iron on the reverse at low heat; never iron directly on gold-leaf prada.</li>
          <li>— Store folded with acid-free paper, away from damp. Refold now and then along new lines.</li>
        </ul>
      </>
    ),
  },
  contact: {
    title: 'Contact Us',
    group: 'Help',
    body: () => (
      <>
        <P>We’re happy to help with sizing, orders and commissions.</P>
        <div className="mt-8 grid gap-8 sm:grid-cols-2">
          {[contact.headOffice, contact.solo].map((s) => (
            <div key={s.label} className="border-t border-ink/20 pt-4">
              <h3 className="font-serif text-xl">{s.label}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/80">{s.address}</p>
              <p className="mt-1 text-sm text-stone">{s.phones.join(' · ')}</p>
            </div>
          ))}
          <div className="border-t border-ink/20 pt-4 sm:col-span-2">
            <p className="text-sm">
              Email{' '}
              <a href={`mailto:${contact.email}`} className="link-under break-all">
                {contact.email}
              </a>
              <br />
              WhatsApp {contact.whatsapp} · Monday–Saturday, 09:00–17:00 WIB
            </p>
          </div>
        </div>
      </>
    ),
  },
  privacy: {
    title: 'Privacy Policy',
    group: 'Legal',
    body: () => (
      <>
        <P>Sample policy for the prototype — to be replaced by BRK’s legal text.</P>
        <H>What we collect</H>
        <P>Your name, contact details and delivery address when you order or enquire, and your order history. Payment details are handled by the payment provider, never stored by us.</P>
        <H>How we use it</H>
        <P>To fulfil and deliver orders, answer enquiries and — only if you subscribe — send collection news. We never sell personal data.</P>
        <H>Your rights</H>
        <P>You can ask to see, correct or delete your data at any time by emailing {contact.email}.</P>
      </>
    ),
  },
  terms: {
    title: 'Terms of Sale',
    group: 'Legal',
    body: () => (
      <>
        <P>Sample terms for the prototype — to be replaced by BRK’s legal text.</P>
        <H>Prices</H>
        <P>All prices are in Indonesian Rupiah and include VAT. Hand-drawn batik varies slightly from piece to piece; colours may differ from your screen.</P>
        <H>Orders</H>
        <P>An order is confirmed once payment is received. Made-to-order and custom pieces follow the timeline agreed in writing.</P>
      </>
    ),
  },
  cookies: {
    title: 'Cookies',
    group: 'Legal',
    body: () => (
      <>
        <P>This prototype stores your bag, wishlist and last order in your browser’s local storage so they survive a reload. No tracking or advertising cookies are used.</P>
      </>
    ),
  },
};

/** /care/:topic — customer-care and legal pages. */
export default function CarePage() {
  const { topic = '' } = useParams();
  const t = TOPICS[topic];

  useEffect(() => {
    if (t) document.title = `${t.title} — Batik Riana Kesuma`;
  }, [t]);

  if (!t) return <PhaseStubPage title="Page not found" />;

  return (
    <PageTop>
      <CatalogHeader id={topic} eyebrow={t.group === 'Help' ? 'Customer care' : 'Legal'} title={t.title} count={0} crumbs={[{ label: 'Home', to: '/' }, { label: t.title }]} />
      <div className="container-brk grid gap-10 pt-8 pb-24 md:pt-12 lg:grid-cols-[220px_1fr] lg:gap-16">
        <nav aria-label="Customer care" className="scrollbar-none -mx-5 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:block lg:space-y-1 lg:px-0">
          {(['Help', 'Legal'] as const).map((g) => (
            <div key={g} className="contents lg:block lg:pb-6">
              <p className="eyebrow mb-3 hidden text-[0.62rem] text-stone lg:block">{g}</p>
              {Object.entries(TOPICS)
                .filter(([, v]) => v.group === g)
                .map(([slug, v]) => (
                  <NavLink
                    key={slug}
                    to={`/care/${slug}`}
                    className={({ isActive }) =>
                      cn(
                        'shrink-0 border px-3 py-2 text-xs whitespace-nowrap lg:block lg:border-0 lg:px-0 lg:py-1.5 lg:text-sm',
                        isActive ? 'border-ink bg-ink text-ivory lg:bg-transparent lg:font-medium lg:text-ink' : 'border-ink/20 text-ink/70 hover:text-ink',
                      )
                    }
                  >
                    {v.title}
                  </NavLink>
                ))}
            </div>
          ))}
        </nav>
        <article className="max-w-2xl">{t.body()}</article>
      </div>
    </PageTop>
  );
}
