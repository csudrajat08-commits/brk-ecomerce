import { useEffect, useState, useSyncExternalStore } from 'react';
import { catalog, type CatalogFacets } from '../services/catalog';
import { catalogStore } from '../services/catalogStore';
import type { Product, ProductQuery, Segment } from '../types/commerce';

interface AsyncState<T> {
  data: T;
  loading: boolean;
  error: Error | null;
}

function useAsync<T>(load: () => Promise<T>, initial: T, deps: unknown[]): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ data: initial, loading: true, error: null });
  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true }));
    load()
      .then((data) => alive && setState({ data, loading: false, error: null }))
      .catch((error: Error) => alive && setState({ data: initial, loading: false, error }));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return state;
}

/** Re-renders whenever the admin changes catalogue data. */
export function useCatalogVersion() {
  return useSyncExternalStore(catalogStore.subscribe, catalogStore.getVersion);
}

export function useProducts(query: ProductQuery = {}) {
  const v = useCatalogVersion();
  return useAsync(() => catalog.listProducts(query), [] as Product[], [JSON.stringify(query), v]);
}

export function useProduct(slug: string | undefined) {
  const v = useCatalogVersion();
  return useAsync(() => (slug ? catalog.getProductBySlug(slug) : Promise.resolve(undefined)), undefined as Product | undefined, [slug, v]);
}

export function useProductsByIds(ids: string[]) {
  const v = useCatalogVersion();
  return useAsync(() => catalog.getProductsByIds(ids), [] as Product[], [ids.join(','), v]);
}

export function useFacets() {
  const v = useCatalogVersion();
  return useAsync(() => catalog.getFacets(), null as CatalogFacets | null, [v]);
}

/** A segment's categories (women / men), including admin edits and additions. */
export function useSegmentCategories(seg: Segment) {
  useCatalogVersion();
  return catalogStore.categoriesBy[seg];
}

/** Women's categories, including admin edits and additions. */
export function useWomenCategories() {
  return useSegmentCategories('women');
}

/** Main categories with the homepage tile edits from the admin. */
export function useMainCategories() {
  useCatalogVersion();
  return catalogStore.mainCategories;
}

/** Homepage hero slides, including admin edits. */
export function useHeroSlides() {
  useCatalogVersion();
  return catalogStore.heroSlides;
}

/** Homepage copy and photos, including admin edits. */
export function useHomeContent() {
  useCatalogVersion();
  return catalogStore.homeContent;
}

/** Collections, including admin edits. */
export function useCollections() {
  useCatalogVersion();
  return catalogStore.collections;
}
