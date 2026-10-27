import type { Category, CategorySlug, Collection, CollectionSlug } from '../types/commerce';
import { siteAssets } from './siteAssets';

export const categories: Category[] = [
  {
    slug: 'women',
    name: "Women's Collection",
    shortName: 'Women',
    description: 'Silk dresses, outers and blouses drawn by hand.',
    image: siteAssets.womenCollection,
  },
  {
    slug: 'men',
    name: "Men's Collection",
    shortName: 'Men',
    description: 'Natural-dyed shirts, cut for the tropics.',
    image: siteAssets.menCollection,
  },
  {
    slug: 'kebaya-traditional',
    name: 'Kebaya & Traditional',
    shortName: 'Kebaya',
    description: 'Kebaya and sarong sets for ceremony.',
    image: siteAssets.kebayaCollection,
  },
  {
    slug: 'batik-fabrics',
    name: 'Batik Fabrics',
    shortName: 'Fabrics',
    description: 'Lengths of batik tulis to tailor your own.',
    image: siteAssets.fabricsCollection,
  },
  {
    slug: 'shawls-accessories',
    name: 'Shawls & Accessories',
    shortName: 'Shawls',
    description: 'Silk, viscose and organdy stoles.',
    image: siteAssets.shawlsCollection,
  },
];

export const collections: Collection[] = [
  {
    slug: 'ifw-2026',
    name: 'Indonesia Fashion Week 2026',
    kicker: 'The Runway Edit',
    description: 'Hibiscus, tumpal and janggan silhouettes, shown on the runway in Jakarta.',
    image: siteAssets.collectionIfw,
  },
  {
    slug: 'silk-atelier',
    name: 'The Silk Atelier',
    kicker: 'Evening & Ceremony',
    description: 'Hand-drawn batik on silk, set against lace and gold-leaf prada.',
    image: siteAssets.collectionSilk,
  },
  {
    slug: 'sogan-classics',
    name: 'Sogan Classics',
    kicker: 'The Solo Palette',
    description: 'The browns of the Solo court, cut as relaxed two-piece sets.',
    image: siteAssets.collectionSogan,
  },
  {
    slug: 'osaka-2025',
    name: 'Osaka 2025',
    kicker: 'Shawls & Stoles',
    description: 'Silk, viscose and bamboo stoles from the Osaka 2025 selection.',
    image: siteAssets.collectionOsaka,
  },
  {
    slug: 'everyday-encim',
    name: 'Everyday Encim',
    kicker: 'Casual Wear',
    description: 'Coastal encim florals for every day, on breathable cotton.',
    image: siteAssets.collectionEncim,
  },
];

/** Where a main category lives: Women and Men have their own landing pages. */
export const categoryPath = (slug: string) => (slug === 'women' || slug === 'men' ? `/${slug}` : `/shop/${slug}`);

export const categoryBySlug = (slug: string) => categories.find((c) => c.slug === slug) as Category | undefined;
export const collectionBySlug = (slug: string) => collections.find((c) => c.slug === slug) as Collection | undefined;

export const isCategorySlug = (s: string | null): s is CategorySlug => !!s && categories.some((c) => c.slug === s);
export const isCollectionSlug = (s: string | null): s is CollectionSlug => !!s && collections.some((c) => c.slug === s);
