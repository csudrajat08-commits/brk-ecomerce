/**
 * Homepage copy and imagery that the admin (Homepage tab) can edit.
 * Titles use a light markup: *words* in italics, a new line = a line break.
 * Hero slides live in homeHero.ts; tiles and collections keep their own data.
 */
import type { ImageAsset } from '../types/commerce';
import { announcements } from './site';
import { siteAssets } from './siteAssets';

export interface HomeContent {
  announcements: Array<{ text: string; to: string }>;
  categories: { title: string; intro: string };
  newArrivals: { title: string };
  editorial: {
    label: string;
    title: string;
    text: string;
    ctaLabel: string;
    ctaTo: string;
    linkLabel: string;
    linkTo: string;
    image: ImageAsset;
    detailImage: ImageAsset;
    detailCaption: string;
    fabricImage: ImageAsset;
    fabricCaption: string;
    fabricTag: string;
  };
  collections: { title: string };
  art: {
    title: string;
    text: string;
    steps: Array<{ title: string; term: string; text: string; image: ImageAsset }>;
    motifs: string;
    facts: Array<{ value: string; label: string }>;
  };
  wholesale: {
    title: string;
    text: string;
    image: ImageAsset;
    detailImage: ImageAsset;
    services: Array<{ title: string; text: string }>;
    terms: Array<{ k: string; v: string }>;
    note: string;
  };
}

export type HomeSectionKey = keyof HomeContent;

export const defaultHomeContent: HomeContent = {
  announcements,
  categories: {
    title: 'Five ways into\n*the atelier.*',
    intro: 'From hand-drawn silk for ceremony to natural-dyed cotton for every day — each piece begins as wax on cloth in Solo.',
  },
  newArrivals: { title: 'New Arrivals' },
  editorial: {
    label: 'The campaign · Sogan Nocturne',
    title: 'Where the *canting*\nmeets the runway.',
    text: "A black blazer drawn with amber sogan florals; a cream cloth, waxed and dyed in many baths, caught mid-turn. This season's pieces carry the patience of batik tulis into silhouettes made for movement.",
    ctaLabel: 'Shop the look',
    ctaTo: '/product/sogan-outer-blazer-pants-set',
    linkLabel: 'Read the story',
    linkTo: '/about',
    image: siteAssets.editorialCampaign,
    detailImage: siteAssets.editorialCampaignDetail,
    detailCaption: 'Janggan blouse, saffron hibiscus skirt.',
    fabricImage: siteAssets.editorialCampaignInset,
    fabricCaption: 'Detail — indigo batik with amber florals',
    fabricTag: 'Batik tulis',
  },
  collections: { title: 'Curated *chapters.*' },
  art: {
    title: 'Every piece begins\nas a *drawing in wax.*',
    text: 'Batik is a resist technique: wax protects the cloth, dye colours what is left. Recognised by UNESCO as Indonesian intangible heritage, it is slow by nature. A single length of batik tulis can take weeks.',
    steps: [
      {
        title: 'The line',
        term: 'Canting & malam',
        text: 'Hot wax is drawn onto cloth with a canting — a small copper spouted pen. Every line that will stay light is guarded by wax.',
        image: siteAssets.batikCraftsmanship,
      },
      {
        title: 'The colour',
        term: 'Sogan & indigo',
        text: 'The cloth is dyed, re-waxed and dyed again. Sogan browns and deep indigo build slowly, bath after bath.',
        image: siteAssets.batikCraftColour,
      },
      {
        title: 'The motif',
        term: 'Parang, kawung, semen',
        text: 'Motifs carry meaning: the diagonal parang for perseverance, the four-petalled kawung for order and integrity.',
        image: siteAssets.batikCraftMotif,
      },
    ],
    motifs: 'Parang · Kawung · Sekar Jagad · Truntum · Sogan · Hokokai · Tumpal · Encim · Lereng · Semen',
    facts: [
      { value: '1997', label: 'Founded in Solo by Riana Kusuma' },
      { value: '~300', label: 'Pieces a month from the atelier' },
      { value: '7', label: 'Showrooms and retail doors in Java' },
      { value: 'JP · EU', label: 'Export and international shows' },
    ],
  },
  wholesale: {
    title: 'Batik for your\n*organisation.*',
    text: 'Uniforms, commissions and trade orders are made to brief and quoted individually — tell us what you need and our atelier team will reply with options, timelines and pricing.',
    image: siteAssets.wholesaleServices,
    detailImage: siteAssets.wholesaleDetail,
    services: [
      { title: 'Corporate Uniforms', text: 'Batik uniforms for offices, hospitality and events, with a motif and colourway developed for your organisation.' },
      { title: 'Custom Batik Orders', text: 'Commission a motif, a family cloth or a ceremonial set. Hand-drawn in Solo to your brief.' },
      { title: 'Wholesale', text: 'Collections for boutiques, museum shops and distributors in Indonesia and abroad.' },
      { title: 'Private Label / OEM', text: 'Your label, our atelier — development through production, from silk ATBM to cotton.' },
    ],
    terms: [
      { k: 'Minimum order', v: 'Flexible' },
      { k: 'Capacity', v: '≈ 300 pcs / month' },
      { k: 'Materials', v: 'ATBM silk & cotton' },
    ],
    note: 'Quoted per project — not available through retail checkout.',
  },
};
