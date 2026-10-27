import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { useRef } from 'react';
import { Link } from 'react-router';
import { useHomeContent } from '../../hooks/useCatalog';
import { Img } from '../ui/Img';
import { RichTitle } from '../ui/RichTitle';
import { Reveal } from '../ui/Reveal';

/**
 * Dark, asymmetric campaign spread: a tall hero image bleeding off the left
 * edge, an overlapping fabric inset with slower parallax, and typography set
 * against the right-hand column.
 */
export function EditorialCampaign() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const c = useHomeContent().editorial;
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const yMain = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : ['-6%', '6%']);
  const yInset = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : ['18%', '-18%']);

  return (
    <section ref={ref} className="relative overflow-hidden bg-ink py-20 text-ivory md:py-0" aria-labelledby="campaign-title">
      <div className="grid md:min-h-[920px] md:grid-cols-12">
        {/* Main image — bleeds to the left edge */}
        <div className="relative px-5 md:col-span-7 md:px-0 lg:col-span-6">
          <div className="relative aspect-[4/5] overflow-hidden md:absolute md:inset-0 md:aspect-auto">
            <motion.div className="absolute -inset-y-[8%] inset-x-0" style={{ y: yMain }}>
              <Img asset={c.image} sizes="(min-width:768px) 55vw, 100vw" />
            </motion.div>
          </div>
          <p className="eyebrow absolute bottom-4 left-9 text-[0.6rem] text-ivory/80 md:bottom-6 md:left-6">{c.label}</p>
        </div>

        {/* Copy column */}
        <div className="relative mt-14 px-5 md:col-span-5 md:mt-0 md:flex md:flex-col md:justify-center md:py-28 md:pr-10 md:pl-12 lg:col-span-6 lg:pr-14 lg:pl-20 xl:pl-28">
          <Reveal>
            <p className="eyebrow flex items-center gap-3 text-bronze">
              <span className="tabular-nums">03</span>
              <span className="h-px w-6 bg-bronze/60" />
              Editorial
            </p>
            <h2 id="campaign-title" className="display mt-6 text-[2.75rem] md:text-6xl xl:text-[5.5rem]">
              <RichTitle text={c.title} />
            </h2>
          </Reveal>

          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <Reveal delay={0.1}>
              <p className="max-w-md text-[0.95rem] leading-relaxed text-ivory/75">{c.text}</p>
              <div className="mt-8 flex flex-wrap gap-x-8 gap-y-4">
                <Link to={c.ctaTo} className="btn-outline-light">
                  {c.ctaLabel}
                </Link>
                <Link to={c.linkTo} className="group inline-flex items-center gap-2 self-center text-xs tracking-[0.14em] uppercase">
                  <span className="link-draw">{c.linkLabel}</span>
                  <ArrowRight size={14} strokeWidth={1.25} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </Reveal>

            {/* Overlapping inset */}
            <motion.figure style={{ y: yInset }} className="relative hidden w-44 lg:block xl:w-56">
              <div className="relative aspect-[3/4] overflow-hidden">
                <Img asset={c.detailImage} sizes="224px" />
              </div>
              <figcaption className="mt-3 text-[0.68rem] leading-snug text-ivory/55">{c.detailCaption}</figcaption>
            </motion.figure>
          </div>

          {/* Fabric strip */}
          <Reveal delay={0.15} className="mt-14 md:mt-20">
            <div className="relative h-28 overflow-hidden md:h-36">
              <Img asset={c.fabricImage} sizes="(min-width:768px) 40vw, 100vw" />
            </div>
            <div className="mt-3 flex justify-between text-[0.68rem] text-ivory/50">
              <span>{c.fabricCaption}</span>
              <span>{c.fabricTag}</span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
