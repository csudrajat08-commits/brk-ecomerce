import { Heart, Menu, Search, ShoppingBag, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { useShop } from '../../context/ShopContext';
import { primaryNav, secondaryNav } from '../../data/site';
import { useEscape, useScrolled } from '../../hooks/useUi';
import { cn } from '../../lib/format';
import type { Segment } from '../../types/commerce';
import { Wordmark } from '../ui/Wordmark';
import { AnnouncementBar } from './AnnouncementBar';
import { MobileMenu } from './MobileMenu';
import { SegmentMegaMenu } from './SegmentMegaMenu';

/** Routes whose first section is a full-bleed image the header floats over. */
const OVERLAY_ROUTES = ['/'];

export function Header() {
  const { pathname, search } = useLocation();
  const scrolled = useScrolled(40);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mega, setMega] = useState<Segment | null>(null);
  const { cartCount, wishlist, setCartOpen, setSearchOpen } = useShop();

  useEffect(() => setMega(null), [pathname]);
  useEscape(!!mega, () => setMega(null));

  const overlay = OVERLAY_ROUTES.includes(pathname);
  const transparent = overlay && !scrolled;

  const isActive = (to: string, match?: string) => {
    if (match) return pathname === match || pathname.startsWith(`${match}/`);
    const [p, q] = to.split('?');
    return q ? pathname === p && search.includes(q) : pathname === p || pathname.startsWith(`${p}/`);
  };

  /** Nav items that open a mega menu */
  const megaOf = (to: string): Segment | null => (to === '/women' ? 'women' : to === '/men' ? 'men' : null);

  // plain Link: our own isActive decides the current item (NavLink would also mark /shop?new=1 active on every /shop/* page)
  const navLink = (item: { label: string; to: string; match?: string }) => (
    <Link
      key={item.to}
      to={item.to}
      onMouseEnter={() => setMega(megaOf(item.to))}
      onFocus={() => setMega(megaOf(item.to))}
      aria-expanded={megaOf(item.to) ? mega === megaOf(item.to) : undefined}
      aria-haspopup={megaOf(item.to) ? 'true' : undefined}
      aria-current={isActive(item.to, item.match) ? 'page' : undefined}
      className="link-draw eyebrow text-[0.6875rem] tracking-[0.16em] whitespace-nowrap"
    >
      {item.label}
    </Link>
  );

  const iconBtn = 'relative h-10 w-10 items-center justify-center transition-[opacity,transform] duration-200 hover:opacity-60 active:scale-90';

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40" onMouseLeave={() => setMega(null)}>
        <AnnouncementBar hidden={scrolled} />
        <div
          className={cn(
            'relative transition-[background-color,color,border-color,backdrop-filter] duration-500',
            transparent && !mega ? 'border-b border-ivory/15 bg-transparent text-ivory' : 'border-b border-ink/10 bg-ivory/90 text-ink backdrop-blur-md',
          )}
        >
          <div className="hidden xl:block">
            <SegmentMegaMenu segment={mega} onNavigate={() => setMega(null)} />
          </div>
          <div className={cn('container-brk grid grid-cols-[1fr_auto_1fr] items-center transition-[height] duration-500', scrolled ? 'h-16' : 'h-16 lg:h-[84px]')}>
            {/* Left */}
            <div className="flex items-center gap-1 lg:gap-7">
              <button type="button" className={cn(iconBtn, '-ml-2 inline-flex xl:hidden')} onClick={() => setMenuOpen(true)} aria-label="Open menu">
                <Menu size={20} strokeWidth={1.25} />
              </button>
              <button type="button" className={cn(iconBtn, 'inline-flex lg:hidden')} onClick={() => setSearchOpen(true)} aria-label="Search">
                <Search size={19} strokeWidth={1.25} />
              </button>
              <nav className="hidden items-center gap-6 xl:flex 2xl:gap-9" aria-label="Primary">
                {primaryNav.map(navLink)}
              </nav>
            </div>

            {/* Centre */}
            <Link to="/" aria-label="Batik Riana Kesuma — home" className="px-2 sm:px-4">
              <Wordmark compact={scrolled} />
            </Link>

            {/* Right */}
            <div className="flex items-center justify-end gap-7">
              <nav className="hidden items-center gap-6 xl:flex 2xl:gap-9" aria-label="Secondary">
                {secondaryNav.map(navLink)}
              </nav>
              <div className="-mr-2 flex items-center">
                <button type="button" className={cn(iconBtn, 'hidden lg:inline-flex')} onClick={() => setSearchOpen(true)} aria-label="Search">
                  <Search size={19} strokeWidth={1.25} />
                </button>
                <Link to="/account" className={cn(iconBtn, 'hidden lg:inline-flex')} aria-label="Account">
                  <User size={19} strokeWidth={1.25} />
                </Link>
                <Link to="/wishlist" className={cn(iconBtn, 'hidden sm:inline-flex')} aria-label={`Wishlist, ${wishlist.length} items`}>
                  <Heart size={19} strokeWidth={1.25} />
                  {wishlist.length > 0 && <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-bronze" />}
                </Link>
                <button type="button" className={cn(iconBtn, 'inline-flex')} onClick={() => setCartOpen(true)} aria-label={`Shopping bag, ${cartCount} items`}>
                  <ShoppingBag size={19} strokeWidth={1.25} />
                  {cartCount > 0 && (
                    <span
                      className={cn(
                        'absolute top-1 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[0.6rem] font-medium tabular-nums',
                        transparent ? 'bg-ivory text-ink' : 'bg-ink text-ivory',
                      )}
                    >
                      {cartCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
