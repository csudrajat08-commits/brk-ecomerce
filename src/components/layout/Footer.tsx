import { ArrowRight } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { brand, contact, social, stores } from '../../data/site';
import { SocialIcon } from '../ui/SocialIcon';

const columns = [
  {
    title: 'Shop',
    links: [
      { label: 'New Arrivals', to: '/shop?new=1' },
      { label: 'Women', to: '/women' },
      { label: 'Men', to: '/men' },
      { label: 'Kebaya & Traditional', to: '/shop/kebaya-traditional' },
      { label: 'Batik Fabrics', to: '/shop/batik-fabrics' },
      { label: 'Shawls & Accessories', to: '/shop/shawls-accessories' },
    ],
  },
  {
    title: 'Customer Care',
    links: [
      { label: 'Shipping & Delivery', to: '/care/shipping' },
      { label: 'Returns & Exchanges', to: '/care/returns' },
      { label: 'Size Guide', to: '/care/size-guide' },
      { label: 'Batik Care', to: '/care/batik-care' },
      { label: 'Contact Us', to: '/care/contact' },
    ],
  },
  {
    title: 'The House',
    links: [
      { label: 'Our Story', to: '/about' },
      { label: 'Collections', to: '/collections' },
      { label: 'Wholesale & Custom', to: '/wholesale' },
      { label: 'Corporate Uniforms', to: '/wholesale?type=uniform' },
      { label: 'Wishlist', to: '/wishlist' },
    ],
  },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function Footer() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'error' | 'done'>('idle');

  const subscribe = (e: FormEvent) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) return setState('error');
    setState('done');
    setEmail('');
  };

  return (
    <footer className="bg-ink text-ivory">
      {/* Newsletter */}
      <div className="container-brk grid gap-10 border-b border-ivory/10 py-16 md:py-24 lg:grid-cols-[1.2fr_1fr] lg:items-end">
        <div>
          <p className="eyebrow text-bronze">Letters from the atelier</p>
          <h2 className="display mt-5 max-w-xl text-[2.6rem] md:text-6xl">
            New motifs, first. <em className="text-sand">Quietly.</em>
          </h2>
        </div>
        <form onSubmit={subscribe} noValidate className="w-full">
          <label htmlFor="newsletter" className="text-sm text-ivory/70">
            Collection previews, runway notes and atelier stories — about once a month.
          </label>
          <div className="mt-6 flex items-center border-b border-ivory/30 focus-within:border-ivory">
            <input
              id="newsletter"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (state !== 'idle') setState('idle');
              }}
              placeholder="Email address"
              className="h-12 w-full bg-transparent text-base outline-none placeholder:text-ivory/40"
              aria-invalid={state === 'error'}
              aria-describedby="newsletter-msg"
            />
            <button type="submit" className="flex h-12 items-center gap-2 pl-4 text-xs tracking-[0.18em] whitespace-nowrap uppercase hover:text-sand">
              Subscribe <ArrowRight size={14} strokeWidth={1.25} />
            </button>
          </div>
          <p id="newsletter-msg" className="mt-3 min-h-5 text-xs" role="status">
            {state === 'error' && <span className="text-[#e3a597]">Please enter a valid email address.</span>}
            {state === 'done' && <span className="text-sand">Thank you — you're on the list. (Demo: no email is sent.)</span>}
          </p>
        </form>
      </div>

      {/* Columns */}
      <div className="container-brk grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)_1.2fr]">
        <div className="max-w-xs">
          <Link to="/" className="font-serif text-3xl">
            Riana Kesuma
          </Link>
          <p className="mt-5 text-sm leading-relaxed text-ivory/60">
            Batik from {brand.origin}, since {brand.founded}. Drawn by hand, worn every day.
          </p>
          <div className="mt-6 flex gap-4">
            {social.map((s) => (
              <a key={s.name} href={s.href} target="_blank" rel="noreferrer" aria-label={`${brand.name} on ${s.name}`} className="text-ivory/70 transition-colors hover:text-ivory">
                <SocialIcon name={s.name} />
              </a>
            ))}
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="eyebrow text-ivory/45">{col.title}</h3>
            <ul className="mt-5 space-y-3 text-sm">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="link-draw text-ivory/85 hover:text-ivory">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="text-sm">
          <h3 className="eyebrow text-ivory/45">Contact</h3>
          <address className="mt-5 space-y-4 text-ivory/75 not-italic">
            <p>
              <span className="text-ivory">{contact.headOffice.label}</span>
              <br />
              {contact.headOffice.address}
            </p>
            <p>
              <span className="text-ivory">{contact.solo.label}</span>
              <br />
              {contact.solo.address}
            </p>
            <p>
              <a href={`mailto:${contact.email}`} className="link-draw break-all">
                {contact.email}
              </a>
              <br />
              WhatsApp {contact.whatsapp}
            </p>
          </address>
        </div>
      </div>

      {/* Stores strip */}
      <div className="container-brk border-t border-ivory/10 py-6">
        <p className="text-xs leading-relaxed text-ivory/50">
          <span className="eyebrow mr-3 text-ivory/70">Find us</span>
          {stores.map((s) => `${s.name}${s.detail ? ` (${s.detail})` : ''}, ${s.city}`).join('  ·  ')}
        </p>
      </div>

      {/* Legal */}
      <div className="container-brk flex flex-col gap-4 border-t border-ivory/10 py-6 text-[0.7rem] text-ivory/45 md:flex-row md:items-center md:justify-between">
        <p>
          © {new Date().getFullYear()} {brand.name}. Design prototype — products, prices and imagery are temporary samples.
        </p>
        <nav aria-label="Legal" className="flex gap-6">
          <Link to="/care/privacy" className="hover:text-ivory">
            Privacy
          </Link>
          <Link to="/care/terms" className="hover:text-ivory">
            Terms
          </Link>
          <Link to="/care/cookies" className="hover:text-ivory">
            Cookies
          </Link>
          <Link to="/admin" className="hover:text-ivory">
            Admin (demo)
          </Link>
        </nav>
      </div>
    </footer>
  );
}
