import { useMemo } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router';
import { CatalogBrowser } from '../components/catalog/CatalogBrowser';
import type { CatalogNavItem } from '../components/catalog/FilterPanel';
import { PageTop } from '../components/layout/Layout';
import { categories, categoryBySlug } from '../data/catalog';
import { useProducts, useCollections } from '../hooks/useCatalog';
import { matchesSearch } from '../services/catalog';
import PhaseStubPage from './PhaseStubPage';

/**
 * /shop                       all products
 * /shop/:category             one main category (men, kebaya-traditional, …)
 * /shop?collection=ifw-2026   one collection
 * /shop?new=1                 new arrivals (optionally within a category)
 * /shop?q=parang              search results
 */
export default function ShopPage() {
  const { category } = useParams();
  const [params] = useSearchParams();
  const collectionSlug = params.get('collection');
  const isNew = params.get('new') === '1';
  const q = params.get('q')?.trim() ?? '';
  const { data: all, loading } = useProducts({});

  const cat = category ? categoryBySlug(category) : undefined;
  const collections = useCollections();
  const coll = collectionSlug ? collections.find((c) => c.slug === collectionSlug) : undefined;
  const mode: 'collection' | 'search' | 'category' = coll ? 'collection' : q ? 'search' : 'category';

  const products = useMemo(
    () =>
      all.filter(
        (p) =>
          (!cat || p.category === cat.slug) &&
          (!coll || p.collection === coll.slug) &&
          (!isNew || p.newArrival) &&
          (!q || matchesSearch(p, q)),
      ),
    [all, cat, coll, isNew, q],
  );

  const qs = isNew ? '?new=1' : '';
  const nav = useMemo<CatalogNavItem[]>(() => {
    if (mode === 'collection')
      return [
        { key: 'all-collections', label: 'All collections', to: '/collections', count: all.filter((p) => p.collection).length },
        ...collections.map((c) => ({ key: c.slug, label: c.name, to: `/shop?collection=${c.slug}`, count: all.filter((p) => p.collection === c.slug).length })),
      ];
    const scope = isNew ? all.filter((p) => p.newArrival) : all;
    return [
      { key: 'all', label: isNew ? 'All new arrivals' : 'All products', to: `/shop${qs}`, count: scope.length },
      ...categories.map((c) => ({
        key: c.slug,
        label: c.name,
        // Women and Men have their own landing pages; new-arrival browsing stays in /shop
        to: (c.slug === 'women' || c.slug === 'men') && !isNew ? `/${c.slug}` : `/shop/${c.slug}${qs}`,
        count: scope.filter((p) => p.category === c.slug).length,
      })),
    ];
  }, [mode, all, isNew, qs, collections]);

  // Women and Men have their own landing pages; /shop/women and /shop/men only stay for filtered views (new arrivals, search)
  if ((category === 'women' || category === 'men') && mode === 'category' && !isNew) return <Navigate to={`/${category}`} replace />;
  if (category && !cat) return <PhaseStubPage title="Page not found" />;
  if (collectionSlug && !coll) return <PhaseStubPage title="Page not found" />;

  const header =
    mode === 'collection'
      ? { eyebrow: coll!.kicker, title: coll!.name, description: coll!.description }
      : mode === 'search'
        ? { eyebrow: 'Search', title: `“${q}”`, description: `${products.length} ${products.length === 1 ? 'piece matches' : 'pieces match'} your search.` }
        : isNew
          ? { eyebrow: 'Just in', title: cat ? `New in ${cat.shortName}` : 'New Arrivals', description: 'The newest pieces from the atelier and the runway.' }
          : cat
            ? { eyebrow: 'Shop', title: cat.name, description: cat.description }
            : { eyebrow: 'Shop', title: 'All Products', description: 'Every piece in the Batik Riana Kesuma collection.' };

  const crumbs = [
    { label: 'Home', to: '/' },
    ...(mode === 'collection'
      ? [{ label: 'Collections', to: '/collections' }, { label: coll!.name }]
      : mode === 'search'
        ? [{ label: 'Search' }]
        : cat
          ? [{ label: isNew ? 'New Arrivals' : 'Shop', to: `/shop${qs}` }, { label: cat.shortName }]
          : [{ label: isNew ? 'New Arrivals' : 'Shop' }]),
  ];

  return (
    <PageTop>
      <CatalogBrowser
        id={`${mode}-${coll?.slug ?? cat?.slug ?? 'all'}-${isNew}-${q}`}
        header={header}
        crumbs={crumbs}
        products={products}
        priceScope={all}
        nav={nav}
        navTitle={mode === 'collection' ? 'Collection' : 'Category'}
        activeKey={coll?.slug ?? cat?.slug ?? 'all'}
        loading={loading}
        empty={
          <div className="py-24 text-center">
            <p className="font-serif text-3xl">{q ? `Nothing found for “${q}”.` : 'No pieces here yet.'}</p>
            <p className="mt-3 text-sm text-stone">Try another word — a motif like parang or kawung, a fabric like silk, or a colour.</p>
            <Link to="/shop" className="btn-outline mt-8">
              Browse all products
            </Link>
          </div>
        }
      />
    </PageTop>
  );
}
