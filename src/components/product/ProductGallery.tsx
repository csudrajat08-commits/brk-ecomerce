import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, useState, type PointerEvent } from 'react';
import { cn, pad2 } from '../../lib/format';
import type { ImageAsset } from '../../types/commerce';
import { HoverZoom } from '../ui/HoverZoom';
import { Img } from '../ui/Img';

interface Props {
  images: ImageAsset[];
  index: number;
  onIndex: (i: number) => void;
  sizes: string;
  /** Smaller controls for the phone sheet */
  compact?: boolean;
  /** ms per photo */
  duration?: number;
}

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Product photo player in the spirit of the home hero: each photo wipes up
 * over the last with a slow settle-in zoom, a segmented progress bar drives
 * autoplay, and hovering (to use the zoom) or reduced motion stops it.
 * Arrows, thumbnails (owned by the parent) and touch swipes step manually.
 */
export function ProductGallery({ images, index, onIndex, sizes, compact, duration = 4000 }: Props) {
  const reduce = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const [stepped, setStepped] = useState(false); // first photo appears without a wipe
  const swipe = useRef<number | null>(null);
  const count = images.length;
  const multi = count > 1;

  const go = (n: number) => {
    setStepped(true);
    onIndex((n + count) % count);
  };

  const onDown = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') setPaused(true);
    else swipe.current = e.clientX;
  };
  const onUp = (e: PointerEvent) => {
    if (swipe.current == null) return;
    const dx = e.clientX - swipe.current;
    swipe.current = null;
    if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
  };

  const asset = images[index];

  return (
    <div
      className="absolute inset-0 touch-pan-y select-none"
      onPointerEnter={(e) => e.pointerType === 'mouse' && setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onPointerDown={onDown}
      onPointerUp={onUp}
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={`${index}-${asset.url ?? asset.src}`}
          className="absolute inset-0 overflow-hidden"
          initial={stepped && !reduce ? { clipPath: 'inset(100% 0% 0% 0%)' } : false}
          animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
          exit={{ opacity: 0, transition: { delay: 1.05, duration: 0.01 } }}
          transition={{ duration: 1.05, ease: EASE }}
        >
          <motion.div
            className="absolute inset-0"
            initial={reduce ? false : { scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 2.2, ease: EASE }}
          >
            <HoverZoom asset={asset} scale={2.2}>
              <Img asset={asset} sizes={sizes} />
            </HoverZoom>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Preload the next photo so the wipe never reveals a blank frame */}
      {multi && (
        <div className="pointer-events-none absolute inset-0 opacity-0" aria-hidden>
          <Img asset={images[(index + 1) % count]} sizes={sizes} alt="" />
        </div>
      )}

      {multi && (
        <>
          {/* Arrows */}
          {!compact && (
            <div className="absolute top-1/2 right-0 left-0 flex -translate-y-1/2 justify-between px-2">
              {[
                { d: -1, label: 'Previous photo', Icon: ChevronLeft },
                { d: 1, label: 'Next photo', Icon: ChevronRight },
              ].map(({ d, label, Icon }) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => go(index + d)}
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center bg-ivory/80 text-ink backdrop-blur-sm transition-[opacity,transform] hover:bg-ivory active:scale-90"
                >
                  <Icon size={16} strokeWidth={1.25} />
                </button>
              ))}
            </div>
          )}

          {/* Hero-style progress: 01 ── ── ── 03 */}
          <div className={cn('absolute inset-x-0 bottom-0 flex items-center gap-2.5 text-ink', compact ? 'px-2 pb-1.5' : 'bg-gradient-to-t from-ivory/85 to-ivory/0 px-4 pt-10 pb-3')}>
            {!compact && <span className="text-[0.62rem] tabular-nums">{pad2(index + 1)}</span>}
            <div className="flex flex-1 gap-1">
              {images.map((im, i) => (
                <button
                  key={`${im.url ?? im.src}-${i}`}
                  type="button"
                  onClick={() => go(i)}
                  className="relative h-4 flex-1"
                  aria-label={`Show photo ${i + 1} of ${count}`}
                  aria-current={i === index}
                >
                  <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-ink/20" />
                  <span
                    key={i === index ? `active-${index}` : 'idle'}
                    onAnimationEnd={i === index ? () => go(index + 1) : undefined}
                    className="absolute top-1/2 left-0 h-px -translate-y-1/2 bg-ink"
                    style={{
                      width: i < index ? '100%' : i === index ? undefined : '0%',
                      animation: i === index && !reduce ? `brk-progress ${duration}ms linear forwards` : undefined,
                      animationPlayState: paused ? 'paused' : 'running',
                    }}
                  />
                </button>
              ))}
            </div>
            {!compact && <span className="text-[0.62rem] text-ink/55 tabular-nums">{pad2(count)}</span>}
          </div>
        </>
      )}
    </div>
  );
}
