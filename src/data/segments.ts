import type { Segment } from '../types/commerce';

/** Copy and routes for each shopping segment's landing page (/women, /men). */
export const SEGMENTS: Record<
  Segment,
  { label: string; path: string; collection: string; tilesTitle: string; shopAll: string; newIn: string; documentTitle: string }
> = {
  women: {
    label: 'Women',
    path: '/women',
    collection: "Women's Collection",
    tilesTitle: 'Choose your *silhouette.*',
    shopAll: 'Shop all women',
    newIn: 'New In — Women',
    documentTitle: "Women's Collection",
  },
  men: {
    label: 'Men',
    path: '/men',
    collection: "Men's Collection",
    tilesTitle: 'Choose your *fit.*',
    shopAll: 'Shop all men',
    newIn: 'New In — Men',
    documentTitle: "Men's Collection",
  },
};

export const SEGMENT_KEYS: Segment[] = ['women', 'men'];
