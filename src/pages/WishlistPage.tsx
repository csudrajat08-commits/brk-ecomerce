import { useEffect } from 'react';
import { Link } from 'react-router';
import { CatalogHeader } from '../components/catalog/CatalogHeader';
import { PageTop } from '../components/layout/Layout';
import { ProductCard } from '../components/product/ProductCard';
import { useShop } from '../context/ShopContext';
import { useProductsByIds } from '../hooks/useCatalog';

/** /wishlist — saved pieces (kept in this browser). */
export default function WishlistPage() {
  const { wishlist } = useShop();
  const { data: saved, loading } = useProductsByIds(wishlist);

  useEffect(() => {
    document.title = 'Wishlist — Batik Riana Kesuma';
  }, []);

  return (
    <PageTop>
      <CatalogHeader
        id="wishlist"
        eyebrow="Saved for later"
        title="Wishlist"
        description={saved.length ? `${saved.length} ${saved.length === 1 ? 'piece' : 'pieces'} you have saved. Tap a photo to choose a size and add it to your bag.` : undefined}
        count={saved.length}
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Wishlist' }]}
      />
      <div className="container-brk pt-10 pb-24">
        {!loading && saved.length === 0 ? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
            <p className="font-serif text-3xl">Nothing saved yet.</p>
            <p className="mt-3 max-w-sm text-sm text-stone">Tap the heart on any piece to keep it here while you decide.</p>
            <Link to="/women" className="btn-ink mt-8">
              Shop Women
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 md:grid-cols-3 xl:grid-cols-4 xl:gap-x-6">
            {saved.map((p) => (
              <ProductCard key={p.id} product={p} sizes="(min-width:1280px) 25vw, (min-width:768px) 33vw, 50vw" />
            ))}
          </div>
        )}
      </div>
    </PageTop>
  );
}
