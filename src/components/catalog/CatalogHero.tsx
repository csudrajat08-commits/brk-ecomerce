import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowRight, ChevronRight, Pause, Play } from 'lucide-react';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Link } from 'react-router';
import { heroBanners, type CatalogHeroConfig, type HeroBanner } from '../../data/womenCatalog';
import { pad2 } from '../../lib/format';
import type { ImageAsset } from '../../types/commerce';
import { FitImg } from '../ui/FitImg';
import { Img } from '../ui/Img';

interface Props {
  hero: CatalogHeroConfig;
  /** Changes when the sub-category changes — drives the transition */
  id: string;
  crumbs: Array<{ label: string; to?: string }>;
  count: number;
}

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Editorial catalogue hero on a warm architectural backdrop.
 * The full-length look sits in an arch whose aspect ratio equals the image's
 * own ratio, so `object-fit: cover` never crops the model — head to footwear
 * stays visible at every width.
 */
export function CatalogHero(props: Props) {
  const { hero } = props;
  if (heroBanners(hero).length) return <BannerHero {...props} />;
  if (hero.main && hero.detail) return <ArchHero {...props} />;
  return <TextHero {...props} />;
}

/** Copy-only hero for categories that have no imagery yet (e.g. just added in the admin). */
function TextHero({ hero, id, crumbs, count }: Props) {
  return (
    <section className="bg-[#efe8dc]" aria-labelledby="catalog-title">
      <div className="container-brk py-14 md:py-20">
        <Breadcrumbs crumbs={crumbs} className="mb-8" />
        <motion.div key={id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE }}>
          <p className="eyebrow flex items-center gap-3 text-bronze">
            <span className="h-px w-8 bg-bronze/60" />
            {hero.eyebrow}
          </p>
          <h1 id="catalog-title" className="display mt-5 text-[3.1rem] sm:text-6xl xl:text-[5.4rem]">
            {hero.title}
          </h1>
          <p className="mt-6 max-w-xl text-[0.95rem] leading-relaxed text-ink/75">{hero.description}</p>
          <p className="mt-8 text-xs tracking-[0.14em] text-stone uppercase tabular-nums">
            {count} {count === 1 ? 'piece' : 'pieces'}
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function Breadcrumbs({ crumbs, className }: { crumbs: Props['crumbs']; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={`flex flex-wrap items-center gap-1.5 text-[0.7rem] tracking-[0.06em] text-stone ${className ?? ''}`}>
      {crumbs.map((c, i) => (
        <span key={c.label} className="flex items-center gap-1.5">
          {c.to ? (
            <Link to={c.to} className="hover:text-ink">
              {c.label}
            </Link>
          ) : (
            <span aria-current="page" className="text-ink">
              {c.label}
            </span>
          )}
          {i < crumbs.length - 1 && <ChevronRight size={11} strokeWidth={1.25} />}
        </span>
      ))}
    </nav>
  );
}

/**
 * Full-width campaign banner — one or several slides. The frame takes the
 * first slide's own aspect ratio so the model is never cropped (slides of a
 * different shape are shown whole on a soft blurred fill); copy is real HTML
 * on the clear wall area, positioned per slide. With 2+ slides it plays like
 * the home hero: a wipe up from below, a slow settle-in zoom, a segmented
 * progress bar driving autoplay, arrows, swipe, and pause on hover.
 */
const SLIDE_MS = 7000;

function BannerHero({ hero, id, crumbs, count }: Props) {
  const reduce = useReducedMotion();
  const slides = heroBanners(hero);
  const [index, setIndex] = useState(0);
  const [stepped, setStepped] = useState(false);
  /** Paused by a click on the photo (or the pause button) — hover never pauses */
  const [paused, setPaused] = useState(false);
  const swiped = useRef(false);
  const togglePause = (e?: { stopPropagation: () => void }) => {
    e?.stopPropagation();
    if (slides.length > 1) setPaused((v) => !v);
  };
  const swipe = useRef<number | null>(null);
  const multi = slides.length > 1;
  const i = index % slides.length;
  const banner = slides[i];
  const light = banner.tone === 'light';
  const copyStyle = { '--copy-left': `${banner.copyLeft ?? 19}%`, '--copy-width': `${banner.copyWidth ?? 34}%` } as CSSProperties;

  // new category → start again from the first slide
  useEffect(() => {
    setIndex(0);
    setStepped(false);
    setPaused(false);
  }, [id]);

  const go = (n: number) => {
    setStepped(true);
    setPaused(false);
    setIndex((n + slides.length) % slides.length);
  };

  const fade = (delay = 0) => ({
    initial: reduce ? false : { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.9, delay, ease: EASE },
  });

  const copy = (
    <motion.div key={id}>
      <motion.p {...fade(0.1)} className={`eyebrow text-[0.68rem] tracking-[0.32em] transition-colors duration-700 ${light ? 'text-ink/70 lg:text-ivory/80' : 'text-ink/70'}`}>
        {hero.eyebrow}
      </motion.p>
      <motion.span {...fade(0.15)} className={`mt-5 block h-px w-[42%] transition-colors duration-700 ${light ? 'bg-ink/20 lg:bg-ivory/40' : 'bg-ink/20'}`} aria-hidden />
      <motion.h1 {...fade(0.2)} id="catalog-title" className={`display mt-5 text-[3rem] transition-colors duration-700 sm:text-6xl lg:text-[clamp(3rem,4.1vw,5.75rem)] ${light ? 'lg:text-ivory' : ''}`}>
        {hero.title}
      </motion.h1>
      <motion.p {...fade(0.3)} className={`mt-6 max-w-[27rem] text-[0.95rem] leading-relaxed text-ink/75 transition-colors duration-700 lg:text-[clamp(0.95rem,1.05vw,1.15rem)] ${light ? 'lg:text-ivory/85' : ''}`}>
        {hero.description}
      </motion.p>
      <motion.p {...fade(0.38)} className={`mt-7 text-xs tracking-[0.14em] text-stone uppercase tabular-nums transition-colors duration-700 ${light ? 'lg:text-ivory/70' : ''}`}>
        {count} {count === 1 ? 'piece' : 'pieces'}
      </motion.p>
    </motion.div>
  );

  /** One frame of the slideshow (desktop banner or phone crop). */
  const frame = (pick: (b: HeroBanner) => ImageAsset, ratio: number, sizes: string) => {
    const asset = pick(banner);
    return (
      <>
        <AnimatePresence initial={false}>
          <motion.div
            key={`${i}-${asset.url ?? asset.src}`}
            className="absolute inset-0 overflow-hidden"
            initial={stepped && !reduce ? { clipPath: 'inset(100% 0% 0% 0%)' } : reduce ? false : { opacity: 0 }}
            animate={{ clipPath: 'inset(0% 0% 0% 0%)', opacity: 1 }}
            exit={{ opacity: 0, transition: { delay: 1.15, duration: 0.01 } }}
            transition={{ duration: stepped ? 1.15 : 1.4, ease: EASE }}
          >
            <motion.div className="absolute inset-0" initial={reduce ? false : { scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: 2.4, ease: EASE }}>
              <FitImg asset={asset} frameRatio={ratio} sizes={sizes} tolerance={0.06} />
            </motion.div>
          </motion.div>
        </AnimatePresence>
        {/* preload the next slide so the wipe never reveals a blank frame */}
        {multi && (
          <div className="pointer-events-none absolute inset-0 opacity-0" aria-hidden>
            <Img asset={pick(slides[(i + 1) % slides.length])} sizes={sizes} alt="" />
          </div>
        )}
      </>
    );
  };

  const controls = multi && (
    <div className="flex items-center gap-3">
      <span className="text-[0.68rem] tabular-nums">{pad2(i + 1)}</span>
      <div className="flex w-28 gap-1 sm:w-40">
        {slides.map((s, n) => (
          <button key={`${s.desktop.url ?? s.desktop.src}-${n}`} type="button" onClick={() => go(n)} className="relative h-5 flex-1" aria-label={`Show slide ${n + 1} of ${slides.length}`} aria-current={n === i}>
            <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-current opacity-25" />
            <span
              key={n === i ? `active-${index}` : 'idle'}
              onAnimationEnd={n === i ? () => go(i + 1) : undefined}
              className="absolute top-1/2 left-0 h-px -translate-y-1/2 bg-current"
              style={{
                width: n < i ? '100%' : n === i ? undefined : '0%',
                animation: n === i && !reduce ? `brk-progress ${SLIDE_MS}ms linear forwards` : undefined,
                animationPlayState: paused ? 'paused' : 'running',
              }}
            />
          </button>
        ))}
      </div>
      <span className="text-[0.68rem] tabular-nums opacity-60">{pad2(slides.length)}</span>
      <button
        type="button"
        onClick={togglePause}
        aria-label={paused ? 'Play slideshow' : 'Pause slideshow'}
        aria-pressed={paused}
        className="flex h-9 w-9 items-center justify-center border border-current/30 backdrop-blur-sm transition-colors hover:bg-current/10"
      >
        {paused ? <Play size={13} strokeWidth={1.4} /> : <Pause size={13} strokeWidth={1.4} />}
      </button>
      <div className="ml-1 flex">
        <button type="button" onClick={() => go(i - 1)} aria-label="Previous slide" className="flex h-9 w-9 items-center justify-center border border-current/30 backdrop-blur-sm transition-colors hover:bg-current/10">
          <ArrowLeft size={14} strokeWidth={1.25} />
        </button>
        <button type="button" onClick={() => go(i + 1)} aria-label="Next slide" className="-ml-px flex h-9 w-9 items-center justify-center border border-current/30 backdrop-blur-sm transition-colors hover:bg-current/10">
          <ArrowRight size={14} strokeWidth={1.25} />
        </button>
      </div>
    </div>
  );

  return (
    <section
      className="relative bg-[#f1ebe2]"
      aria-labelledby="catalog-title"
      aria-roledescription={multi ? 'carousel' : undefined}
    >
      {/* Copy — stacked above the image below lg, laid over the wall area from lg */}
      <div className="container-brk relative z-10 pt-8 pb-10 lg:pointer-events-none lg:absolute lg:inset-0 lg:max-w-none lg:p-0" style={copyStyle}>
        <div className="transition-[left,width] duration-700 ease-[var(--ease-editorial)] lg:pointer-events-auto lg:absolute lg:inset-y-0 lg:left-(--copy-left) lg:flex lg:w-(--copy-width) lg:flex-col lg:justify-center">
          <Breadcrumbs crumbs={crumbs} className={`mb-8 lg:mb-[clamp(1.5rem,3vw,3.5rem)] ${light ? 'lg:text-ivory/75' : ''}`} />
          {copy}
        </div>
      </div>

      {/* Tablet + desktop: the banner at the first slide's own ratio (never cropped) */}
      <div
        className={`relative hidden overflow-hidden md:block ${multi ? 'cursor-pointer' : ''}`}
        style={{ aspectRatio: slides[0].desktop.ratio }}
        onClick={togglePause}
      >
        {frame((b) => b.desktop, slides[0].desktop.ratio, '100vw')}
        {/* Readability veil behind the copy column (desktop overlay only) */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 hidden transition-[width,background] duration-700 lg:block"
          style={{
            width: `calc(${(banner.copyLeft ?? 19) + (banner.copyWidth ?? 34)}% + 10%)`,
            background: light
              ? 'linear-gradient(90deg, rgba(20,18,16,.55) 0%, rgba(20,18,16,.35) 70%, rgba(20,18,16,0) 100%)'
              : 'linear-gradient(90deg, rgba(241,235,226,.62) 0%, rgba(241,235,226,.4) 70%, rgba(241,235,226,0) 100%)',
          }}
          aria-hidden
        />
        {multi && (
          <div
            onClick={(e) => e.stopPropagation()}
            className={`absolute right-[max(1.25rem,calc((100vw-1520px)/2+3.5rem))] bottom-6 z-10 px-3 py-1.5 backdrop-blur-sm ${light ? 'bg-ink/35 text-ivory' : 'bg-ivory/75 text-ink'}`}
          >
            {controls}
          </div>
        )}
      </div>

      {/* Phones: model-centred crops, swipeable */}
      <div
        className="relative touch-pan-y md:hidden"
        style={{ aspectRatio: slides[0].mobile.ratio }}
        onPointerDown={(e) => {
          if (e.pointerType !== 'mouse') swipe.current = e.clientX;
        }}
        onPointerUp={(e) => {
          if (swipe.current == null) return;
          const dx = e.clientX - swipe.current;
          swipe.current = null;
          if (Math.abs(dx) > 40) {
            swiped.current = true;
            go(i + (dx < 0 ? 1 : -1));
          }
        }}
        onClick={(e) => {
          if (swiped.current) swiped.current = false;
          else togglePause(e);
        }}
      >
        {frame((b) => b.mobile, slides[0].mobile.ratio, '100vw')}
        {multi && (
          <div onClick={(e) => e.stopPropagation()} className="absolute inset-x-0 bottom-0 z-10 flex justify-center bg-gradient-to-t from-ivory/85 to-ivory/0 px-4 pt-8 pb-3 text-ink">
            {controls}
          </div>
        )}
      </div>
    </section>
  );
}

function ArchHero({ hero, id, crumbs, count }: Props) {
  const reduce = useReducedMotion();
  const fade = (delay = 0) => ({
    initial: reduce ? false : { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay, ease: EASE },
  });

  return (
    <section className="relative overflow-hidden bg-[#efe8dc]" aria-labelledby="catalog-title">
      {/* Architecture: wall panelling + floor plane */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-y-0 left-[58%] hidden w-px bg-ink/[0.06] lg:block" />
        <div className="absolute inset-y-0 left-[86%] hidden w-px bg-ink/[0.06] lg:block" />
        <div className="absolute inset-x-0 bottom-0 h-[15%] border-t border-ink/[0.07] bg-[#e6ddcf]" />
      </div>

      <div className="container-brk relative grid gap-10 pt-8 pb-0 lg:h-[540px] lg:grid-cols-12 lg:gap-6 lg:pt-0">
        {/* Copy */}
        <div className="flex flex-col justify-center lg:col-span-6 lg:pb-[6%] xl:col-span-5">
          <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-1.5 text-[0.7rem] tracking-[0.06em] text-stone">
            {crumbs.map((c, i) => (
              <span key={c.label} className="flex items-center gap-1.5">
                {c.to ? (
                  <Link to={c.to} className="hover:text-ink">
                    {c.label}
                  </Link>
                ) : (
                  <span aria-current="page" className="text-ink">
                    {c.label}
                  </span>
                )}
                {i < crumbs.length - 1 && <ChevronRight size={11} strokeWidth={1.25} />}
              </span>
            ))}
          </nav>
          <AnimatePresence mode="wait">
            <motion.div key={id} exit={{ opacity: 0, transition: { duration: 0.2 } }}>
              <motion.p {...fade(0.05)} className="eyebrow flex items-center gap-3 text-bronze">
                <span className="h-px w-8 bg-bronze/60" />
                {hero.eyebrow}
              </motion.p>
              <motion.h1 {...fade(0.12)} id="catalog-title" className="display mt-5 text-[3.1rem] sm:text-6xl xl:text-[5.4rem]">
                {hero.title}
              </motion.h1>
              <motion.p {...fade(0.2)} className="mt-6 max-w-md text-[0.95rem] leading-relaxed text-ink/75">
                {hero.description}
              </motion.p>
              <motion.p {...fade(0.28)} className="mt-8 text-xs tracking-[0.14em] text-stone uppercase tabular-nums">
                {count} {count === 1 ? 'piece' : 'pieces'}
              </motion.p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Imagery */}
        <div className="relative flex items-end justify-center pb-[9%] lg:col-span-6 lg:justify-end lg:pr-[6%] xl:col-span-7 xl:pr-[10%]">
          <AnimatePresence mode="wait">
            <motion.div key={id} className="relative flex items-end" exit={{ opacity: 0, transition: { duration: 0.2 } }}>
              {/* Supporting studio image */}
              <motion.figure
                initial={reduce ? false : { opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.25, ease: EASE }}
                className="relative z-0 mr-[-14%] mb-[8%] w-[38vw] max-w-[210px] sm:max-w-[230px] lg:mr-[-12%] lg:w-[200px] xl:w-[230px]"
              >
                <div className="relative overflow-hidden bg-sand" style={{ aspectRatio: hero.detail!.ratio }}>
                  <Img asset={hero.detail!} sizes="230px" />
                </div>
              </motion.figure>

              {/* Full-length look in an arch — frame ratio === image ratio, so nothing is cropped */}
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.1, ease: EASE }}
                className="relative z-10"
              >
                <span className="pointer-events-none absolute -inset-3 rounded-t-[999px] border border-bronze/35 lg:-inset-4" aria-hidden />
                <div
                  className="relative h-[min(78vw,420px)] overflow-hidden rounded-t-[999px] bg-sand shadow-[0_30px_60px_-30px_rgba(36,36,36,.35)] sm:h-[440px] lg:h-[440px]"
                  style={{ aspectRatio: hero.main!.ratio }}
                >
                  <Img asset={hero.main!} sizes="(min-width:1024px) 310px, 60vw" priority focus="50% 50%" />
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
