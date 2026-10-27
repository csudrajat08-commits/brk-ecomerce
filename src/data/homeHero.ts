import type { ImageAsset } from '../types/commerce';
import { siteAssets } from './siteAssets';

export interface HeroSlide {
  id: string;
  eyebrow: string;
  title: [string, string];
  text: string;
  cta: { label: string; to: string };
  /** The piece worn in the photos ("Shop the look") */
  look: { label: string; to: string };
  /** left, centre, right — phones show the centre frame */
  frames: ImageAsset[];
}

/** Built-in homepage hero slides; the admin (Homepage tab) can replace the whole list. */
export const defaultHeroSlides: HeroSlide[] = [
  {
    id: 'heritage',
    eyebrow: 'Indonesia Fashion Week 2026',
    title: ['Heritage,', 'Reimagined.'],
    text: 'A contemporary expression of Indonesian batik.',
    cta: { label: 'Shop Collection', to: '/shop?collection=ifw-2026' },
    look: { label: 'Navy Janggan Kebaya & Sarong', to: '/product/navy-janggan-kebaya-sarong-set' },
    frames: siteAssets.homeHero,
  },
  {
    id: 'indigo',
    eyebrow: 'The Runway Edit',
    title: ['Indigo,', 'Unhurried.'],
    text: 'A long outer and trousers carrying the Tumpal Monas motif — drawn in Solo, cut for now.',
    cta: { label: 'Shop the Runway', to: '/shop?collection=ifw-2026' },
    look: { label: 'Tumpal Monas Long Outer & Pants', to: '/product/tumpal-monas-long-outer-pants' },
    frames: siteAssets.homeHeroIndigo,
  },
  {
    id: 'hibiscus',
    eyebrow: 'The Hibiscus Series',
    title: ['Bloom in', 'Full Colour.'],
    text: 'Hand-drawn hibiscus in leaf green and cobalt, finished with an ochre parang shawl.',
    cta: { label: 'Shop New Arrivals', to: '/shop?new=1' },
    look: { label: 'Green Hibiscus Outer & Skirt Set', to: '/product/green-hibiscus-outer-skirt-set' },
    frames: siteAssets.homeHeroHibiscus,
  },
];
