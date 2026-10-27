/**
 * Automatic layout for hero banners.
 *
 * Works on a small grayscale copy of the image: textured columns (models,
 * fabric, plants) score high, plain wall/floor scores low. The headline goes
 * into the widest clear band (preferring the left edge), its colour follows
 * the band's brightness, and the phone crop centres on the busy area.
 *
 * Pure and DOM-free so the admin (canvas) and node scripts (sharp) share it.
 */

export interface BannerLayout {
  copyLeft: number;
  copyWidth: number;
  tone: 'dark' | 'light';
  /** 0–1, horizontal centre of the subjects — for the phone crop */
  focusX: number;
}

/** `gray`: luminance 0–255, row-major, `w`×`h` (≈200 px wide is plenty). */
export function analyzeBanner(gray: ArrayLike<number>, w: number, h: number): BannerLayout {
  const y0 = Math.floor(h * 0.15);
  const y1 = Math.ceil(h * 0.85);

  // per-column texture: mean absolute gradient
  const raw = new Float64Array(w);
  for (let x = 1; x < w; x++) {
    let sum = 0;
    for (let y = Math.max(1, y0); y < y1; y++) {
      const i = y * w + x;
      sum += Math.abs(gray[i] - gray[i - 1]) + Math.abs(gray[i] - gray[i - w]);
    }
    raw[x] = sum / (y1 - y0);
  }
  raw[0] = raw[1];
  // smooth (box, radius 4)
  const busy = new Float64Array(w);
  for (let x = 0; x < w; x++) {
    let s = 0;
    let n = 0;
    for (let k = -4; k <= 4; k++) {
      const j = x + k;
      if (j >= 0 && j < w) {
        s += raw[j];
        n++;
      }
    }
    busy[x] = s / n;
  }

  const sorted = [...busy].sort((a, b) => a - b);
  const lo = sorted[Math.floor(w * 0.1)];
  const hi = sorted[Math.floor(w * 0.9)];
  const t = lo + (hi - lo) * 0.3;

  // clear runs
  const runs: Array<[number, number]> = [];
  let start = -1;
  for (let x = 0; x <= w; x++) {
    const clear = x < w && busy[x] < t;
    if (clear && start < 0) start = x;
    if (!clear && start >= 0) {
      runs.push([start, x]);
      start = -1;
    }
  }
  const pct = (x: number) => (x / w) * 100;
  const wide = runs.filter(([a, b]) => pct(b - a) >= 22);
  // prefer a band that starts near the left edge (copy reads left-to-right), else the widest
  const pick = wide.find(([a]) => pct(a) <= 12) ?? [...wide].sort((p, q) => q[1] - q[0] - (p[1] - p[0]))[0];

  let copyLeft = 5;
  let copyWidth = 30;
  if (pick) {
    const [a, b] = pick;
    copyLeft = Math.max(3, Math.round(pct(a) + 4));
    copyWidth = Math.round(Math.min(40, Math.max(20, pct(b - a) - 9)));
    copyLeft = Math.min(copyLeft, 66);
  }

  // tone from the copy band's brightness
  const cx0 = Math.floor((copyLeft / 100) * w);
  const cx1 = Math.min(w, Math.ceil(((copyLeft + copyWidth) / 100) * w));
  let lum = 0;
  let n = 0;
  for (let y = Math.floor(h * 0.25); y < Math.ceil(h * 0.75); y++)
    for (let x = cx0; x < cx1; x++) {
      lum += gray[y * w + x];
      n++;
    }
  const tone: 'dark' | 'light' = n && lum / n < 110 ? 'light' : 'dark';

  // subjects' centre of mass (busy columns only)
  let mass = 0;
  let moment = 0;
  for (let x = 0; x < w; x++) {
    const m = Math.max(0, busy[x] - t);
    mass += m;
    moment += m * x;
  }
  const focusX = mass ? moment / mass / w : 0.5;

  return { copyLeft, copyWidth, tone, focusX: Math.min(0.95, Math.max(0.05, focusX)) };
}
