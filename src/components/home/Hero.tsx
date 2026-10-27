import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { useHeroSlides } from '../../hooks/useCatalog';
import { cn, pad2 } from '../../lib/format';
import { Img } from '../ui/Img';

const DURATION = 7000;
const EASE = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  // Slides are edited in the admin (Homepage tab); copy and photos live in data/homeHero.ts
  const slides = useHeroSlides();
  const count = useRef(slides.length);
  count.current = slides.length;
  useEffect(() => {
    if (index >= slides.length) setIndex(0);
  }, [index, slides.length]);

  const go = useCallback(
    (next: number) => {
      setIndex((cur) => {
        const n = (next + count.current) % count.current;
        if (n !== cur) setPrev(cur);
        return n;
      });
    },
    [],
  );

  // Autoplay is driven by the progress bar's CSS animation (see `onAnimationEnd`),
  // so pausing on hover/focus freezes timer and indicator together.
  const slide = slides[Math.min(index, slides.length - 1)];
  if (!slide) return null;

  return (
    <section
      id="home-hero"
      className="relative h-[100svh] min-h-[620px] overflow-hidden bg-ink text-ivory"
      aria-roledescription="carousel"
      aria-label="Featured campaigns"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Image layers: every slide is a triptych of one look */}
      {slides.map((s, si) => {
        const isActive = si === index;
        const isPrev = si === prev;
        return (
          <div
            key={s.id}
            className={cn('absolute inset-0 grid grid-cols-1 gap-px bg-ink md:grid-cols-[1fr_1.45fr_1fr]', !isActive && !isPrev && 'invisible')}
            style={{ zIndex: isActive ? 2 : isPrev ? 1 : 0 }}
            aria-hidden={!isActive}
          >
            {s.frames.map((frame, fi) => (
              <motion.div
                key={isActive ? `${s.id}-${fi}-${index}` : `${s.id}-${fi}`}
                className={cn('relative overflow-hidden', fi !== 1 && 'hidden md:block')}
                initial={isActive && prev !== null && !reduce ? { clipPath: 'inset(100% 0% 0% 0%)' } : false}
                animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
                transition={{ duration: 1.25, delay: fi === 1 ? 0 : 0.12 + fi * 0.06, ease: EASE }}
              >
                <motion.div
                  className="absolute inset-0"
                  initial={isActive && !reduce ? { scale: 1.12 } : false}
                  animate={{ scale: 1 }}
                  transition={{ duration: 2.4, ease: EASE }}
                >
                  <Img
                    asset={frame}
                    priority={si === 0}
                    sizes={fi === 1 ? '(min-width: 768px) 42vw, 100vw' : '29vw'}
                  />
                </motion.div>
              </motion.div>
            ))}
          </div>
        );
      })}

      {/* Legibility scrims */}
      <div className="pointer-events-none absolute inset-0 z-[3] bg-[linear-gradient(to_bottom,rgba(20,18,16,.45)_0%,rgba(20,18,16,0)_22%,rgba(20,18,16,0)_40%,rgba(20,18,16,.55)_70%,rgba(20,18,16,.82)_100%)]" />

      {/* Vertical brand line */}
      <p className="eyebrow pointer-events-none absolute top-1/2 left-5 z-[4] hidden origin-left -translate-y-1/2 -rotate-90 text-[0.6rem] text-ivory/70 lg:left-8 lg:block">
        Est. 1997 — Solo, Central Java
      </p>

      {/* Copy */}
      <div className="absolute inset-x-0 bottom-0 z-[4]">
        <div className="container-brk grid gap-8 pb-8 md:pb-12 lg:grid-cols-12 lg:items-end lg:pb-14">
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div key={slide.id} exit={{ opacity: 0, transition: { duration: 0.35 } }}>
                <motion.p
                  className="eyebrow flex items-center gap-3 text-ivory/85"
                  initial={reduce ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
                >
                  <span className="h-px w-8 bg-ivory/70" />
                  {slide.eyebrow}
                </motion.p>
                <h1 className="display mt-5" style={{ fontSize: 'clamp(3.4rem, 9.4vw, 10.5rem)' }}>
                  {slide.title.map((line, li) => (
                    <span key={li} className={cn('block overflow-hidden pb-[0.06em]', li === 1 && 'md:pl-[12%]')}>
                      <motion.span
                        className={cn('block', li === 1 && 'italic')}
                        initial={reduce ? false : { y: '105%' }}
                        animate={{ y: 0 }}
                        transition={{ duration: 1.1, delay: 0.35 + li * 0.12, ease: EASE }}
                      >
                        {line}
                      </motion.span>
                    </span>
                  ))}
                </h1>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="lg:col-span-4 lg:pb-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id}
                initial={reduce ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, delay: 0.55, ease: EASE }}
              >
                <p className="max-w-sm text-[0.95rem] leading-relaxed text-ivory/90 md:text-base">{slide.text}</p>
                <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
                  <Link to={slide.cta.to} className="btn-light">
                    {slide.cta.label}
                  </Link>
                  <Link to={slide.look.to} className="group inline-flex items-center gap-2 text-xs tracking-[0.12em] uppercase">
                    <span className="link-draw">Shop the look</span>
                    <ArrowRight size={14} strokeWidth={1.25} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Slide navigation */}
            <div className="mt-8 flex items-center gap-4 md:mt-10">
              <span className="text-xs tabular-nums">{pad2(index + 1)}</span>
              <div className="flex flex-1 gap-1.5">
                {slides.map((s, i) => (
                  <button key={s.id} type="button" onClick={() => go(i)} className="group relative h-6 flex-1" aria-label={`Show slide ${i + 1}: ${s.title.join(' ')}`} aria-current={i === index}>
                    <span className="absolute inset-x-0 top-1/2 h-px bg-ivory/30" />
                    <span
                      key={i === index ? `active-${index}` : 'idle'}
                      onAnimationEnd={i === index ? () => go(index + 1) : undefined}
                      className="absolute top-1/2 left-0 h-px bg-ivory"
                      style={{
                        width: i < index ? '100%' : i === index ? undefined : '0%',
                        animation: i === index && !reduce ? `brk-progress ${DURATION}ms linear forwards` : undefined,
                        animationPlayState: paused ? 'paused' : 'running',
                      }}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs text-ivory/60 tabular-nums">{pad2(slides.length)}</span>
              <div className="ml-2 flex">
                <button type="button" onClick={() => go(index - 1)} className="flex h-10 w-10 items-center justify-center border border-ivory/30 transition-colors hover:bg-ivory hover:text-ink" aria-label="Previous slide">
                  <ArrowLeft size={15} strokeWidth={1.25} />
                </button>
                <button type="button" onClick={() => go(index + 1)} className="-ml-px flex h-10 w-10 items-center justify-center border border-ivory/30 transition-colors hover:bg-ivory hover:text-ink" aria-label="Next slide">
                  <ArrowRight size={15} strokeWidth={1.25} />
                </button>
              </div>
            </div>
            <p className="mt-3 truncate text-[0.68rem] tracking-[0.08em] text-ivory/60">
              Shown: <Link to={slide.look.to} className="hover:text-ivory">{slide.look.label}</Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
