import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { CartLine, Product } from '../types/commerce';

/* ---------------- persistence (best-effort) ---------------- */

const CART_KEY = 'brk.cart.v1';
const WISH_KEY = 'brk.wishlist.v1';

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — state stays in memory */
  }
}

/* ---------------- context shape ---------------- */

interface ShopState {
  cart: CartLine[];
  cartCount: number;
  subtotal: number;
  addToCart: (product: Product, opts: { size: string; color?: string; quantity?: number }) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeFromCart: (key: string) => void;
  clearCart: () => void;

  wishlist: string[];
  isWishlisted: (productId: string) => boolean;
  toggleWishlist: (productId: string) => void;

  /* UI surfaces shared across the app */
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  quickView: Product | null;
  setQuickView: (p: Product | null) => void;
  toast: string | null;
  notify: (msg: string) => void;
}

const ShopContext = createContext<ShopState | null>(null);

export function ShopProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>(() => load(CART_KEY, []));
  const [wishlist, setWishlist] = useState<string[]>(() => load(WISH_KEY, []));
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickView, setQuickView] = useState<Product | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => save(CART_KEY, cart), [cart]);
  useEffect(() => save(WISH_KEY, wishlist), [wishlist]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const addToCart = useCallback<ShopState['addToCart']>((product, { size, color, quantity = 1 }) => {
    const colorName = color ?? product.colors[0]?.name ?? '';
    const key = `${product.id}:${size}:${colorName}`;
    setCart((lines) => {
      const existing = lines.find((l) => l.key === key);
      if (existing) {
        return lines.map((l) => (l.key === key ? { ...l, quantity: Math.min(l.quantity + quantity, 10) } : l));
      }
      return [
        ...lines,
        {
          key,
          productId: product.id,
          slug: product.slug,
          sku: product.variants.find((v) => v.size === size && v.color === colorName)?.sku ?? product.sku,
          name: product.name,
          price: product.price,
          image: product.images[0],
          size,
          color: colorName,
          quantity,
        },
      ];
    });
  }, []);

  const updateQuantity = useCallback((key: string, quantity: number) => {
    setCart((lines) =>
      quantity <= 0 ? lines.filter((l) => l.key !== key) : lines.map((l) => (l.key === key ? { ...l, quantity: Math.min(quantity, 10) } : l)),
    );
  }, []);

  const removeFromCart = useCallback((key: string) => setCart((lines) => lines.filter((l) => l.key !== key)), []);
  const clearCart = useCallback(() => setCart([]), []);

  const toggleWishlist = useCallback((id: string) => {
    setWishlist((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]));
  }, []);

  const value = useMemo<ShopState>(
    () => ({
      cart,
      cartCount: cart.reduce((n, l) => n + l.quantity, 0),
      subtotal: cart.reduce((n, l) => n + l.price * l.quantity, 0),
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      wishlist,
      isWishlisted: (id) => wishlist.includes(id),
      toggleWishlist,
      cartOpen,
      setCartOpen,
      searchOpen,
      setSearchOpen,
      quickView,
      setQuickView,
      toast,
      notify: setToast,
    }),
    [cart, wishlist, cartOpen, searchOpen, quickView, toast, addToCart, updateQuantity, removeFromCart, clearCart, toggleWishlist],
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop(): ShopState {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error('useShop must be used inside <ShopProvider>');
  return ctx;
}
