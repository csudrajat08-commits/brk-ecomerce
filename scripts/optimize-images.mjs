/**
 * Image pipeline for the BRK prototype.
 *
 * Source: image-source/brk-archive (photography from the current
 * batikrianakesuma.com catalogue, used as TEMPORARY presentation imagery).
 * Output: public/images/{archive,editorial}/<name>-<width>.webp
 *
 * - Every archive image is exported as responsive WebP.
 * - Catalogue shots that carry an embedded script product label have that
 *   label removed (dark-stroke mask + background fill) so cards stay clean.
 * - Editorial crops (fabric details, garment details) are derived here so the
 *   UI never has to know about source framing.
 *
 * Run: npm run images
 */
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const SRC = 'image-source/brk-archive';
/** Licensed stock (Unsplash) for categories BRK has no model photography for — see CREDITS.md */
const STOCK_SRC = 'image-source/unsplash';
const OUT = 'public/images';
const WIDTHS = [640, 1200];

/** Catalogue series with a script label in the upper-right corner. */
const LABELLED = /^(Website-|classic-sogan|encim-|sutra-crep)/;

/** Label zone (fractions of width / height); dark script on a light backdrop. */
const LABEL_ZONE = { x0: 0.45, x1: 1, y0: 0.0, y1: 0.24, mode: 'dark' };

/** Runway shots carry a photographer's circular watermark bottom-right. */
const WATERMARKED = /^IMGL/;
const WATERMARK_ZONE = { x0: 0.8, x1: 1, y0: 0.85, y1: 1, mode: 'abs' };

/**
 * Wide catalogue banners supplied by the design team. Baked-in headline copy is
 * removed (the page renders it as HTML), and a portrait crop is cut for mobile.
 */
const BANNERS = [
  {
    name: 'batik-long-outer-banner',
    dir: 'collections/women',
    src: 'image-source/collections/batik-long-outer-banner-original.png',
    // eyebrow + rule + headline + description, left of the model
    textZone: { x0: 0.17, x1: 0.53, y0: 0.24, y1: 0.6, mode: 'dark', texture: false },
    widths: [960, 1600, 2400],
    mobileCrop: [0.39, 0, 0.4, 1],
  },
  {
    // Temporary: hero cut from the approved page mockup (1254 px wide) until a full-res banner is uploaded
    name: 'silk-monochrome-batik-gown-banner',
    dir: 'collections/women',
    src: 'image-source/collections/silk-monochrome-batik-gown-mockup.png',
    crop: [0, 0, 1, 387 / 1254],
    textZone: { x0: 0.05, x1: 0.418, y0: 0.14, y1: 0.88, mode: 'dark', texture: false },
    widths: [960, 1600],
    mobileCrop: [0.495, 0, 0.42, 1],
  },
];

/** Derived editorial crops: [left, top, width, height] as fractions. */
const EDITORIAL = [
  { name: 'fabric-hokokai', src: 'Slide-1-16.webp', crop: [0.2, 0.31, 0.6, 0.38] },
  { name: 'fabric-indigo-floral', src: 'Slide-1-12.webp', crop: [0.2, 0.31, 0.6, 0.38] },
  { name: 'fabric-cobalt', src: 'Slide-2-3.webp', crop: [0.2, 0.31, 0.6, 0.38] },
  { name: 'men-shirt-detail', src: 'Slide-1-4.webp', crop: [0.24, 0.17, 0.52, 0.5] },
  { name: 'men-indigo-detail', src: 'KMJBP2-Slide-2.webp', crop: [0.24, 0.2, 0.52, 0.42] },
  { name: 'runway-sogan-back', src: 'IMGL3157-scaled.jpg', crop: [0.1, 0.0, 0.8, 0.82] },
  { name: 'runway-ochre-close', src: 'IMGL3213-scaled.jpg', crop: [0.0, 0.05, 1, 0.9] },
  { name: 'shawl-rack-detail', src: 'Slide-2-1.webp', crop: [0.22, 0.25, 0.56, 0.5] },
  { name: 'stole-pink', src: 'Slide-2-8.webp', crop: [0.12, 0.2, 0.76, 0.66] },
  { name: 'men-elder-portrait', src: 'stock:men-natural-dyed-elder.jpg', crop: [0.0, 0.3, 0.56, 0.52] },
  // Women's catalogue heroes — full-body, label/watermark-free, own files per the asset spec
  { name: 'batik-long-outer-hero', dir: 'collections/women', src: 'IMGL3110-scaled.jpg', crop: [0, 0.04, 1, 0.96] },
  { name: 'batik-long-outer-hero-detail', dir: 'collections/women', src: 'Website-3-1.png', crop: [0, 0, 1, 1] },
  { name: 'runway-sash-detail', src: 'IMGL3540-scaled.jpg', crop: [0.22, 0.25, 0.56, 0.37] },
  { name: 'shawl-cotton-rail', src: 'Slide-2.webp', crop: [0.3, 0.3, 0.42, 0.45] },
];

/* ---------- label removal ---------- */

function boxBlur(src, w, h, r) {
  // separable box blur on a Float32 single channel
  const tmp = new Float32Array(w * h);
  const out = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    let acc = 0;
    const row = y * w;
    for (let x = -r; x <= r; x++) acc += src[row + Math.min(w - 1, Math.max(0, x))];
    for (let x = 0; x < w; x++) {
      tmp[row + x] = acc / (2 * r + 1);
      acc += src[row + Math.min(w - 1, x + r + 1)] - src[row + Math.max(0, x - r)];
    }
  }
  for (let x = 0; x < w; x++) {
    let acc = 0;
    for (let y = -r; y <= r; y++) acc += tmp[Math.min(h - 1, Math.max(0, y)) * w + x];
    for (let y = 0; y < h; y++) {
      out[y * w + x] = acc / (2 * r + 1);
      acc += tmp[Math.min(h - 1, y + r + 1) * w + x] - tmp[Math.max(0, y - r) * w + x];
    }
  }
  return out;
}

async function removeLabel(input, zone) {
  const { data, info } = await sharp(input).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const n = w * h;
  const lum = new Float32Array(n);
  for (let i = 0; i < n; i++) lum[i] = 0.299 * data[i * 3] + 0.587 * data[i * 3 + 1] + 0.114 * data[i * 3 + 2];
  const local = boxBlur(lum, w, h, 18);

  const x0 = Math.floor(zone.x0 * w), y0 = Math.floor(zone.y0 * h), y1 = Math.floor(zone.y1 * h);
  // 1. strong strokes -> bounding box of the label
  let bx0 = w, bx1 = 0, by0 = h, by1 = 0;
  const x1 = Math.ceil((zone.x1 ?? 1) * w);
  const hit = zone.mode === 'abs' ? (i, t) => Math.abs(lum[i] - local[i]) > t : (i, t) => lum[i] < local[i] - t;
  for (let y = y0; y < y1; y++)
    for (let x = x0; x < x1; x++) {
      const i = y * w + x;
      if (hit(i, 28)) {
        bx0 = Math.min(bx0, x); bx1 = Math.max(bx1, x);
        by0 = Math.min(by0, y); by1 = Math.max(by1, y);
      }
    }
  if (bx1 <= bx0) return sharp(input).png().toBuffer();
  const pad = 12;
  bx0 = Math.max(x0, bx0 - pad); bx1 = Math.min(x1 - 1, bx1 + pad);
  by0 = Math.max(0, by0 - pad); by1 = Math.min(h - 1, by1 + pad);
  // 2. sensitive mask inside the box (catches anti-aliased edges)
  let mask = new Float32Array(n);
  for (let y = by0; y <= by1; y++)
    for (let x = bx0; x <= bx1; x++) {
      const i = y * w + x;
      if (hit(i, 12)) mask[i] = 1;
    }
  // dilate (box blur + threshold)
  const grown = boxBlur(mask, w, h, 4);
  mask = new Float32Array(n);
  for (let i = 0; i < n; i++) mask[i] = grown[i] > 0.01 ? 1 : 0;

  // progressive normalised-convolution fill: grow the radius until every
  // masked pixel has enough clean neighbours
  const out = Buffer.from(data);
  const dy = by1 - by0 + 10; // texture donor: backdrop directly below the label
  for (let c = 0; c < 3; c++) {
    const ch = new Float32Array(n);
    for (let i = 0; i < n; i++) ch[i] = data[i * 3 + c];
    const base = boxBlur(ch, w, h, 6);
    let known = new Float32Array(n);
    for (let i = 0; i < n; i++) known[i] = 1 - mask[i];
    const val = Float32Array.from(ch);
    for (const r of [8, 16, 32, 64, 128]) {
      const k = new Float32Array(n);
      for (let i = 0; i < n; i++) k[i] = val[i] * known[i];
      const num = boxBlur(k, w, h, r);
      const den = boxBlur(known, w, h, r);
      const next = Float32Array.from(known);
      for (let i = 0; i < n; i++) {
        if (known[i] || den[i] < 0.15) continue;
        val[i] = num[i] / den[i];
        next[i] = 1;
      }
      known = next;
    }
    for (let i = 0; i < n; i++) {
      if (!mask[i]) continue;
      const y = Math.floor(i / w);
      const j = i + Math.min(dy, h - 1 - y) * w;
      const detail = zone.texture === false || mask[j] ? 0 : Math.max(-10, Math.min(10, ch[j] - base[j]));
      out[i * 3 + c] = Math.max(0, Math.min(255, val[i] + detail));
    }
  }
  return sharp(out, { raw: { width: w, height: h, channels: 3 } }).png().toBuffer();
}

/* ---------- export ---------- */

async function exportSizes(buf, dir, name, widths = WIDTHS) {
  const meta = await sharp(buf).metadata();
  fs.mkdirSync(dir, { recursive: true });
  for (const width of widths) {
    const target = Math.min(width, meta.width);
    await sharp(buf)
      .resize({ width: target })
      .webp({ quality: 80 })
      .toFile(path.join(dir, `${name}-${width}.webp`));
  }
}

const RENAME = { 'WEBSITE-3.webp': 'shawl-organdy-rack' };
const baseName = (f) => RENAME[f] ?? f.replace(/\.(png|jpe?g|webp)$/i, '').replace(/-scaled$/, '').toLowerCase();

const files = fs.readdirSync(SRC).filter((f) => /\.(png|jpe?g|webp)$/i.test(f));
const only = process.argv[2];

/** Source buffer with labels / watermarks removed. */
async function prepare(f) {
  if (f.startsWith('stock:')) return fs.readFileSync(path.join(STOCK_SRC, f.slice(6)));
  const buf = fs.readFileSync(path.join(SRC, f));
  if (LABELLED.test(f)) return removeLabel(buf, LABEL_ZONE);
  if (WATERMARKED.test(f)) return removeLabel(buf, WATERMARK_ZONE);
  return buf;
}

for (const f of files) {
  if (only && !f.includes(only)) continue;
  const buf = await prepare(f);
  await exportSizes(buf, path.join(OUT, 'archive'), baseName(f));
  process.stdout.write('.');
}

for (const f of fs.readdirSync(STOCK_SRC).filter((f) => /.jpe?g$/i.test(f))) {
  if (only && !f.includes(only)) continue;
  await exportSizes(fs.readFileSync(path.join(STOCK_SRC, f)), path.join(OUT, 'stock'), f.replace(/.jpe?g$/i, ''));
  process.stdout.write('s');
}

for (const b of BANNERS) {
  if (only && !b.name.includes(only)) continue;
  let source = fs.readFileSync(b.src);
  if (b.crop) {
    const m = await sharp(source).metadata();
    const [cl, ct, cw, ch] = b.crop;
    source = await sharp(source)
      .extract({ left: Math.round(cl * m.width), top: Math.round(ct * m.height), width: Math.round(cw * m.width), height: Math.round(ch * m.height) })
      .png()
      .toBuffer();
  }
  const clean = await removeLabel(source, b.textZone);
  await exportSizes(clean, path.join(OUT, b.dir), b.name, b.widths);
  const { width, height } = await sharp(clean).metadata();
  const [l, t, cw, ch] = b.mobileCrop;
  const crop = await sharp(clean)
    .extract({ left: Math.round(l * width), top: Math.round(t * height), width: Math.round(cw * width), height: Math.round(ch * height) })
    .toBuffer();
  await exportSizes(crop, path.join(OUT, b.dir), `${b.name}-mobile`);
  process.stdout.write('b');
}

for (const e of EDITORIAL) {
  if (only && !e.src.includes(only)) continue;
  const input = await prepare(e.src);
  const { width, height } = await sharp(input).metadata();
  const [l, t, cw, ch] = e.crop;
  const buf = await sharp(input)
    .extract({ left: Math.round(l * width), top: Math.round(t * height), width: Math.round(cw * width), height: Math.round(ch * height) })
    .toBuffer();
  await exportSizes(buf, path.join(OUT, e.dir ?? 'editorial'), e.name);
  process.stdout.write('+');
}
console.log('\ndone');
