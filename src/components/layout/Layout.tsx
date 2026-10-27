import { AnimatePresence, motion } from 'motion/react';
import { useEffect, type ReactNode } from 'react';
import { useLocation, useOutlet } from 'react-router';
import { useShop } from '../../context/ShopContext';
import { useTouchInView } from '../../hooks/useTouchInView';
import { QuickView } from '../product/QuickView';
import { CartDrawer } from './CartDrawer';
import { Footer } from './Footer';
import { Header } from './Header';
import { SearchOverlay } from './SearchOverlay';

/** `raised` lifts the toast above a sticky bottom bar (checkout on phones). */
function Toast({ raised }: { raised?: boolean }) {
  const { toast } = useShop();
  return (
    <div className={`pointer-events-none fixed inset-x-0 z-[60] flex justify-center px-4 ${raised ? 'bottom-36 lg:bottom-6' : 'bottom-6'}`} role="status" aria-live="polite">
      <AnimatePresence>
        {toast && (
          <motion.p
            key={toast}
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            className="bg-ink px-5 py-3 text-xs tracking-[0.06em] text-ivory shadow-lg"
          >
            {toast}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Routes that share one page instance (sub-routes swap content, not the page) */
const pageKeyOf = (pathname: string) => (pathname.startsWith('/women/') ? '/women/*' : pathname);

export function Layout() {
  const location = useLocation();
  const outlet = useOutlet();
  useTouchInView();

  const pageKey = pageKeyOf(location.pathname);
  // Checkout runs in focus mode: the page brings its own minimal header, no site nav or footer
  const focus = pageKey === '/checkout' || (pageKey.startsWith('/orders/') && pageKey.endsWith('/invoice'));

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    // `/#section-id` (e.g. links from the admin): scroll to that section once the page has rendered
    if (!location.hash) return;
    const t = setTimeout(() => {
      const el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      (el?.closest('section') ?? el)?.scrollIntoView({ behavior: 'smooth' });
    }, 500);
    return () => clearTimeout(t);
  }, [pageKey, location.hash]);

  return (
    <>
      <a href="#main" className="sr-only z-[70] bg-ink px-4 py-2 text-ivory focus:not-sr-only focus:fixed focus:top-2 focus:left-2">
        Skip to content
      </a>
      {!focus && <Header />}
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          id="main"
          key={pageKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          {outlet}
        </motion.main>
      </AnimatePresence>
      {!focus && <Footer />}
      <CartDrawer />
      <SearchOverlay />
      <QuickView />
      <Toast raised={focus} />
    </>
  );
}

/** Top spacing for pages that don't start with a full-bleed hero. */
export function PageTop({ children, className = '' }: { children?: ReactNode; className?: string }) {
  return <div className={`pt-[100px] lg:pt-[120px] ${className}`}>{children}</div>;
}
