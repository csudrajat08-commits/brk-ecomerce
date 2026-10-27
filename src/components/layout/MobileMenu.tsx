import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight, X } from 'lucide-react';
import { Link } from 'react-router';
import { useMainCategories } from '../../hooks/useCatalog';
import { contact, social } from '../../data/site';
import { useEscape, useLockBody } from '../../hooks/useUi';
import { Img } from '../ui/Img';
import { SocialIcon } from '../ui/SocialIcon';
import { categoryPath } from '../../data/catalog';

const links = [
  { label: 'New Arrivals', to: '/shop?new=1' },
  { label: 'Women', to: '/women' },
  { label: 'Men', to: '/men' },
  { label: 'Kebaya & Traditional', to: '/shop/kebaya-traditional' },
  { label: 'Collections', to: '/collections' },
  { label: 'Our Story', to: '/about' },
];

const utility = [
  { label: 'Wholesale & Custom', to: '/wholesale' },
  { label: 'Wishlist', to: '/wishlist' },
  { label: 'Account', to: '/account' },
  { label: 'Shopping Bag', to: '/bag' },
];

export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const categories = useMainCategories();
  useLockBody(open);
  useEscape(open, onClose);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 xl:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
          <motion.nav
            aria-label="Mobile"
            className="absolute inset-y-0 left-0 flex w-full max-w-[460px] flex-col overflow-y-auto bg-ivory text-ink"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex h-16 items-center justify-between px-5">
              <span className="eyebrow text-stone">Menu</span>
              <button type="button" onClick={onClose} className="-mr-2 p-2" aria-label="Close menu">
                <X size={20} strokeWidth={1.25} />
              </button>
            </div>

            <ul className="px-5 pt-2">
              {links.map((l, i) => (
                <motion.li
                  key={l.to}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.12 + i * 0.05, duration: 0.5 }}
                  className="border-b border-ink/10"
                >
                  <Link to={l.to} onClick={onClose} className="flex items-center justify-between gap-4 py-3.5 transition-[padding,color] duration-300 active:pl-2 active:text-bronze">
                    <span className="font-serif text-[1.375rem] leading-tight tracking-[0.005em] sm:text-2xl">{l.label}</span>
                    <span className="text-[0.62rem] tracking-[0.12em] text-stone tabular-nums">0{i + 1}</span>
                  </Link>
                </motion.li>
              ))}
            </ul>

            <div className="mt-7 px-5">
              <p className="eyebrow mb-3 text-[0.62rem] text-stone">Shop by category</p>
              <div className="scrollbar-none -mx-5 flex gap-2.5 overflow-x-auto px-5">
                {categories.map((c) => (
                  <Link key={c.slug} to={categoryPath(c.slug)} onClick={onClose} className="w-24 shrink-0 transition-transform active:scale-95">
                    <div className="relative aspect-[3/4] overflow-hidden bg-sand">
                      <Img asset={c.image} sizes="96px" />
                    </div>
                    <p className="mt-1.5 text-[0.72rem] leading-tight">{c.shortName}</p>
                  </Link>
                ))}
              </div>
            </div>

            <ul className="mt-7 grid grid-cols-2 gap-x-4 gap-y-2.5 px-5">
              {utility.map((u) => (
                <li key={u.to}>
                  <Link to={u.to} onClick={onClose} className="inline-flex items-center gap-1.5 text-[0.8rem] text-ink/80 active:text-bronze">
                    {u.label} <ArrowUpRight size={12} strokeWidth={1.25} className="shrink-0" />
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-auto space-y-4 border-t border-ink/10 px-5 py-6 text-xs text-stone">
              <p>
                WhatsApp {contact.whatsapp}
                <br />
                {contact.email}
              </p>
              <div className="flex gap-4 text-ink">
                {social.map((s) => (
                  <a key={s.name} href={s.href} target="_blank" rel="noreferrer" aria-label={s.name}>
                    <SocialIcon name={s.name} />
                  </a>
                ))}
              </div>
            </div>
          </motion.nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
