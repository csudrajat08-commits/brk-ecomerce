import { useState } from 'react';
import type { ImageAsset } from '../../types/commerce';
import { cn } from '../../lib/format';
import { catalogStore } from '../../services/catalogStore';

interface ImgProps {
  asset: ImageAsset;
  /** `sizes` attribute — tell the browser how wide the slot is */
  sizes?: string;
  className?: string;
  priority?: boolean;
  /** Overrides the asset's art-directed focal point */
  focus?: string;
  alt?: string;
  /** 'contain' shows the whole photo (letterboxed) instead of filling the frame */
  fit?: 'cover' | 'contain';
}

/** Highest-resolution source for an asset (used by hover zoom). */
export function largestSrc(asset: ImageAsset): string | undefined {
  if (asset.pending) return undefined;
  if (asset.url) return catalogStore.resolveUrl(asset.url);
  const widths = asset.widths ?? [640, 1200];
  return `${asset.src}-${widths[widths.length - 1]}.webp`;
}

/**
 * Responsive, art-directable image. Fills its parent (absolute inset-0), so the
 * parent controls aspect ratio — swapping assets never changes layout.
 * Fails gracefully into an intentional placeholder instead of a broken icon.
 */
export function Img({ asset, sizes = '100vw', className, priority, focus, alt, fit = 'cover' }: ImgProps) {
  const [failed, setFailed] = useState(false);

  if (asset.pending) return <PendingPhoto asset={asset} />;
  if (failed) return <ImagePlaceholder label={asset.alt} className={className} />;

  const widths = asset.widths ?? [640, 1200];
  const external = asset.url ? catalogStore.resolveUrl(asset.url) : undefined;
  if (asset.url && !external) return <ImagePlaceholder label={asset.alt} className={className} />;
  const src = external ?? `${asset.src}-${widths[Math.min(1, widths.length - 1)]}.webp`;
  const srcSet = asset.url ? undefined : widths.map((w) => `${asset.src}-${w}.webp ${w}w`).join(', ');

  return (
    <img
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt ?? asset.alt}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
      onError={() => setFailed(true)}
      style={{ objectPosition: focus ?? asset.focus ?? '50% 50%' }}
      className={cn('absolute inset-0 h-full w-full', fit === 'contain' ? 'object-contain' : 'object-cover', className)}
    />
  );
}

/**
 * Intentional stand-in for products BRK has not photographed yet: a tinted
 * studio backdrop, a line drawing of a long outer, and an explicit label.
 */
function PendingPhoto({ asset }: { asset: ImageAsset }) {
  const tone = asset.tone ?? '#cdbb9f';
  return (
    <div role="img" aria-label={asset.alt} className="absolute inset-0 overflow-hidden" style={{ background: `linear-gradient(180deg, ${tone}26 0%, ${tone}40 78%, ${tone}5c 78%, ${tone}52 100%)` }}>
      <svg viewBox="0 0 120 200" className="absolute top-[9%] left-1/2 h-[74%] -translate-x-1/2" fill="none" stroke={`color-mix(in srgb, ${tone} 55%, #242424)`} strokeWidth="1.1" strokeLinejoin="round" strokeLinecap="round" aria-hidden>
        {/* hanger */}
        <path d="M60 10v-4a4 4 0 1 1 4 4" opacity=".7" />
        <path d="M60 10 34 22h52L60 10Z" opacity=".7" />
        {/* long outer */}
        <path d="M44 22c4 6 8 9 16 9s12-3 16-9l16 6 14 52-10 4-10-36v118H70V58l-10-27-10 27v110H30V50L20 86l-10-4 14-52 20-8Z" fill={`${tone}2e`} />
        <path d="M50 58v110M70 58v110" opacity=".55" />
        {/* batik hint along the front panels */}
        {[70, 88, 106, 124, 142].map((y) => (
          <g key={y} opacity=".55">
            <circle cx="40" cy={y} r="3" />
            <circle cx="80" cy={y} r="3" />
          </g>
        ))}
      </svg>
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 px-3 pb-3">
        <span className="bg-ivory/85 px-2 py-1 text-[0.58rem] font-medium tracking-[0.18em] text-ink/70 uppercase">Photography pending</span>
        <span className="text-[0.58rem] tracking-[0.18em] text-ink/50 uppercase">Sample</span>
      </div>
    </div>
  );
}

export function ImagePlaceholder({ label, className }: { label?: string; className?: string }) {
  return (
    <div
      role="img"
      aria-label={label ? `Image pending: ${label}` : 'Image pending'}
      className={cn('absolute inset-0 flex items-end bg-sand p-4', className)}
      style={{
        backgroundImage:
          'radial-gradient(circle at 50% 50%, rgba(164,139,112,.22) 0 18%, transparent 19%), radial-gradient(circle at 0 0, rgba(164,139,112,.22) 0 18%, transparent 19%)',
        backgroundSize: '28px 28px',
      }}
    >
      <span className="eyebrow text-ink/60">Photography pending</span>
    </div>
  );
}
