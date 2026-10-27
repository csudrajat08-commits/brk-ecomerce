/** Client-side image processing for admin uploads (no server in the prototype). */
import { analyzeBanner, type BannerLayout } from './bannerLayout';

export interface ProcessedImage {
  blob: Blob;
  width: number;
  height: number;
}

async function toBitmap(src: Blob): Promise<ImageBitmap> {
  return createImageBitmap(src);
}

function canvasToBlob(canvas: HTMLCanvasElement, quality = 0.86): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not encode image'))), 'image/webp', quality),
  );
}

/** Downscale to `maxWidth` and re-encode as WebP — keeps IndexedDB small and pages fast. */
export async function processUpload(file: Blob, maxWidth = 1600): Promise<ProcessedImage> {
  const bmp = await toBitmap(file);
  const scale = Math.min(1, maxWidth / bmp.width);
  const width = Math.round(bmp.width * scale);
  const height = Math.round(bmp.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d')!.drawImage(bmp, 0, 0, width, height);
  bmp.close();
  return { blob: await canvasToBlob(canvas), width, height };
}

/** Auto copy position / text colour / phone-crop focus for a banner image. */
export async function layoutFor(src: Blob): Promise<BannerLayout> {
  const bmp = await createImageBitmap(src);
  const w = 200;
  const h = Math.max(1, Math.round((bmp.height / bmp.width) * w));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(bmp, 0, 0, w, h);
  bmp.close();
  const rgba = ctx.getImageData(0, 0, w, h).data;
  const gray = new Uint8ClampedArray(w * h);
  for (let i = 0; i < w * h; i++) gray[i] = 0.299 * rgba[i * 4] + 0.587 * rgba[i * 4 + 1] + 0.114 * rgba[i * 4 + 2];
  return analyzeBanner(gray, w, h);
}

/**
 * Cut a crop of `aspect` (w/h) from a wide banner for phones, centred
 * horizontally on `focusX` (0–1). Full height is kept so the model is never
 * cropped vertically.
 */
export async function cropForMobile(src: Blob, focusX: number, aspect = 1): Promise<ProcessedImage> {
  const bmp = await toBitmap(src);
  const height = bmp.height;
  const width = Math.min(bmp.width, Math.round(height * aspect));
  const left = Math.max(0, Math.min(bmp.width - width, Math.round(focusX * bmp.width - width / 2)));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d')!.drawImage(bmp, left, 0, width, height, 0, 0, width, height);
  bmp.close();
  return { blob: await canvasToBlob(canvas), width, height };
}

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
