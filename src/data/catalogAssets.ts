/**
 * Image registry for catalogue pages (heroes + demo product imagery).
 *
 * ⚠ TEMPORARY PRESENTATION IMAGERY — see the note in siteAssets.ts.
 * Products without suitable photography use `pending` placeholders (rendered
 * as a labelled "Photography pending" card), never unrelated fashion photos.
 * Replace any entry here when BRK supplies official photography.
 */
import type { ImageAsset } from '../types/commerce';

const ARCHIVE_CREDIT = 'BRK public catalogue (temporary placeholder)';
const RUNWAY_CREDIT = 'BRK at Indonesia Fashion Week 2026 — runway archive (temporary placeholder)';


export const catalogAssets = {
  /* ---------- Women › Batik Long Outer hero ---------- */
  batikLongOuterHero: {
    src: '/images/collections/women/batik-long-outer-hero',
    alt: 'Model on the runway, shown head to toe, in a navy batik long outer with blue florals and matching trousers',
    ratio: 1600 / 2304,
    focus: '50% 50%',
    credit: RUNWAY_CREDIT,
  },
  /** Wide editorial banner (headline copy removed from the artwork; rendered as HTML) */
  batikLongOuterBanner: {
    src: '/images/collections/women/batik-long-outer-banner',
    alt: 'Model walking through a sunlit ivory colonnade in a long black-and-white batik outer over a black dress',
    ratio: 1983 / 793,
    focus: '50% 50%',
    credit: 'BRK design team — campaign banner',
    widths: [960, 1600, 2400],
  },
  /** Square crop of the same banner, centred on the model, for phones */
  batikLongOuterBannerMobile: {
    src: '/images/collections/women/batik-long-outer-banner-mobile',
    alt: 'Model in a long black-and-white batik outer, shown head to toe',
    ratio: 1,
    focus: '50% 50%',
    credit: 'BRK design team — campaign banner',
  },
  batikLongOuterHeroDetail: {
    src: '/images/collections/women/batik-long-outer-hero-detail',
    alt: 'Studio portrait of a long black lace outer with navy and teal batik florals',
    ratio: 1080 / 1350,
    focus: '50% 30%',
    credit: ARCHIVE_CREDIT,
  },

  /* ---------- Women › Silk Monochrome Batik Gown ---------- */
  /** TEMPORARY: cut from the approved page mockup (1254 px) — replace with a full-res banner in the admin */
  silkMonochromeGownBanner: {
    src: '/images/collections/women/silk-monochrome-batik-gown-banner',
    alt: 'Two models in cream-and-black silk monochrome batik gowns, one wearing a lace-trimmed hijab',
    ratio: 1254 / 387,
    focus: '50% 50%',
    credit: 'BRK design mockup (temporary placeholder)',
    widths: [960, 1600],
  },
  silkMonochromeGownBannerMobile: {
    src: '/images/collections/women/silk-monochrome-batik-gown-banner-mobile',
    alt: 'Two models in silk monochrome batik gowns',
    ratio: 527 / 387,
    focus: '50% 50%',
    credit: 'BRK design mockup (temporary placeholder)',
  },
} satisfies Record<string, ImageAsset>;
