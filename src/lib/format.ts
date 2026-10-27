const idr = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

/** 2450000 → "Rp 2.450.000" */
export function formatIDR(value: number): string {
  return idr.format(value).replace(/ /g, ' ');
}

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export const pad2 = (n: number) => String(n).padStart(2, '0');

/** Product photography is shot 2:3 (full length, head to footwear) — every product frame uses it so nothing is cropped. */
export const PRODUCT_PHOTO_RATIO = 2 / 3;
