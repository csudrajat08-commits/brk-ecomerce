import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { cn } from '../../lib/format';
import type { ImageAsset } from '../../types/commerce';
import { FitImg } from '../ui/FitImg';
import { Img } from '../ui/Img';

interface Props {
  slides: ImageAsset[];
  /** Frame ratio (w/h) — slides are fitted without heavy cropping */
  frameRatio: number;
  sizes?: string;
  /** Delay before the first advance, so neighbouring tiles don't change in unison */
  offset?: number;
  interval?: number;
  className?: string;
  /** 'fade' = soft crossfade (category tiles); 'wipe' = hero-style reveal from below (product cards) */
  effect?: 'fade' | 'wipe';
  /** Hide the progress bars (e.g. on very small thumbnails) */
  hideIndicator?: boolean;
  /** Placement classes for the progress bars */
  indicatorClassName?: string;
  /** Follow one page-wide clock so every synced slideshow changes at the same moment */
  sync?: boolean;
}

/* ---------- shared clock for synced slideshows ---------- */

const SYNC_INTERVAL = 4000;
let syncTick = 0;
let syncTimer: ReturnType<typeof setInterval> | null = null;
const syncListeners = new Set<() => void>();

function subscribeSync(fn: () => void) {
  syncListeners.add(fn);
  if (!syncTimer) {
    syncTick = 0; // a fresh page starts every card on its first photo
    syncTimer = setInterval(() => {
      syncTick += 1;
      syncListeners.forEach((l) => l());
    }, SYNC_INTERVAL);
  }
  return () => {
    syncListeners.delete(fn);
    if (!syncListeners.size && syncTimer) {
      clearInterval(syncTimer);
      syncTimer = null;
    }
  };
}
const noSubscribe = () => () => {};
const getSyncTick = () => syncTick;

/**
 * Auto-advancing slideshow for tiles and product cards. Advances only while on
 * screen and not hovered; preloads the next slide; static under reduced motion.
 */
export function TileSlideshow({ slides, frameRatio, sizes, offset = 0, interval = 3500, className, effect = 'fade', hideIndicator, indicatorClassName = 'inset-x-3 bottom-3', sync }: Props) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [ownIndex, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [paused, setPaused] = useState(false);
  const [frozen, setFrozen] = useState<number | null>(null);
  const count = slides.length;

  // Synced mode: the page-wide clock decides the slide; hovering freezes this card only
  const tick = useSyncExternalStore(sync && !reduce && count > 1 ? subscribeSync : noSubscribe, getSyncTick);
  const index = sync ? (frozen ?? tick % Math.max(count, 1)) : ownIndex;
  const pause = (on: boolean) => {
    setPaused(on);
    if (sync) setFrozen(on ? tick % Math.max(count, 1) : null);
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (sync || count < 2 || !visible || paused || reduce) return;
    let timer: ReturnType<typeof setInterval>;
    const start = setTimeout(() => {
      setIndex((n) => (n + 1) % count);
      timer = setInterval(() => setIndex((n) => (n + 1) % count), interval);
    }, offset + interval);
    return () => {
      clearTimeout(start);
      clearInterval(timer);
    };
  }, [sync, count, visible, paused, reduce, offset, interval]);

  const current = slides[index % Math.max(count, 1)];
  const next = count > 1 ? slides[(index + 1) % count] : undefined;

  return (
    <div ref={ref} className="absolute inset-0" onPointerEnter={(e) => e.pointerType === 'mouse' && pause(true)} onPointerLeave={() => pause(false)}>
      <AnimatePresence initial={false}>
        <motion.div
          key={`${index}-${current.url ?? current.src}`}
          className="absolute inset-0"
          initial={effect === 'wipe' ? { clipPath: 'inset(100% 0% 0% 0%)', scale: 1.06 } : { opacity: 0, scale: 1.03 }}
          animate={effect === 'wipe' ? { clipPath: 'inset(0% 0% 0% 0%)', scale: 1 } : { opacity: 1, scale: 1 }}
          exit={effect === 'wipe' ? { opacity: 0, transition: { delay: 1, duration: 0.01 } } : { opacity: 0 }}
          transition={{ duration: effect === 'wipe' ? 1 : 1.1, ease: [0.22, 1, 0.36, 1], scale: { duration: 1.8, ease: [0.22, 1, 0.36, 1] } }}
        >
          <FitImg asset={current} frameRatio={frameRatio} sizes={sizes} className={className} />
        </motion.div>
      </AnimatePresence>

      {/* Preload the upcoming slide so the crossfade never flashes */}
      {next && (
        <div className="pointer-events-none absolute inset-0 opacity-0" aria-hidden>
          <Img asset={next} sizes={sizes} alt="" />
        </div>
      )}

      {count > 1 && !hideIndicator && (
        <div className={cn('pointer-events-none absolute flex gap-1', indicatorClassName)} aria-hidden>
          {slides.slice(0, 12).map((s, i) => (
            <span key={`${s.url ?? s.src}-${i}`} className={cn('h-[2px] flex-1 transition-colors duration-500', i === index % 12 ? 'bg-ivory' : 'bg-ivory/35')} />
          ))}
        </div>
      )}
    </div>
  );
}
