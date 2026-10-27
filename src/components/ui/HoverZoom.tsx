import { useRef, useState, type PointerEvent, type ReactNode } from 'react';
import type { ImageAsset } from '../../types/commerce';
import { cn } from '../../lib/format';
import { largestSrc } from './Img';

interface Props {
  /** Image to magnify — its highest-resolution file is loaded on first hover */
  asset: ImageAsset;
  /** Magnification factor */
  scale?: number;
  children: ReactNode;
  className?: string;
}

/**
 * Cursor-following magnifier for product photography, so clients can study the
 * weave of the cloth and the fine lines of the motif.
 *
 * Mouse/pen only — touch devices keep their native gestures. The zoom layer
 * uses the largest available file (not the thumbnail) so it stays sharp, and
 * the cursor position is written to CSS variables (no re-render per move).
 */
export function HoverZoom({ asset, scale = 2.5, children, className }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false); // high-res layer mounted after first hover
  const [active, setActive] = useState(false);
  const src = largestSrc(asset);

  const track = (e: PointerEvent<HTMLDivElement>) => {
    const el = box.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--zx', `${((e.clientX - r.left) / r.width) * 100}%`);
    el.style.setProperty('--zy', `${((e.clientY - r.top) / r.height) * 100}%`);
  };

  if (!src) return <>{children}</>;

  return (
    <div
      ref={box}
      data-zoom={active ? 'on' : undefined}
      className={cn('absolute inset-0 overflow-hidden [@media(hover:hover)]:cursor-zoom-in', className)}
      onPointerEnter={(e) => {
        if (e.pointerType === 'touch') return;
        track(e);
        setArmed(true);
        setActive(true);
      }}
      onPointerMove={(e) => e.pointerType !== 'touch' && track(e)}
      onPointerLeave={() => setActive(false)}
    >
      {children}
      {armed && (
        <img
          src={src}
          alt=""
          aria-hidden
          draggable={false}
          decoding="async"
          className={cn(
            'pointer-events-none absolute inset-0 h-full w-full object-cover [transform-origin:var(--zx,50%)_var(--zy,50%)] transition-[opacity,transform] duration-300 ease-out',
            active ? 'opacity-100' : 'opacity-0',
          )}
          style={{ objectPosition: asset.focus ?? '50% 50%', transform: `scale(${active ? scale : 1})` }}
        />
      )}
    </div>
  );
}
