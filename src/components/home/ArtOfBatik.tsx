import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { Link } from 'react-router';
import { useHomeContent } from '../../hooks/useCatalog';
import { cn } from '../../lib/format';
import { Img } from '../ui/Img';
import { RichTitle } from '../ui/RichTitle';
import { Reveal } from '../ui/Reveal';

/** Staggered layout of the three process photos (copy and photos come from the admin) */
const STEP_LAYOUT = [
  { no: 'I', offset: '', aspect: 'aspect-[4/5]' },
  { no: 'II', offset: 'md:mt-24', aspect: 'aspect-[3/4]' },
  { no: 'III', offset: 'md:mt-10', aspect: 'aspect-[4/5]' },
];

export function ArtOfBatik() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const c = useHomeContent().art;
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const x = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : ['0%', '-12%']);

  return (
    <section className="overflow-hidden bg-sand/45 pt-20 pb-20 md:pt-28 md:pb-28 lg:pt-36" aria-labelledby="art-of-batik">
      <div className="container-brk grid gap-10 lg:grid-cols-12">
        <Reveal className="lg:col-span-7">
          <p className="eyebrow flex items-center gap-3 text-stone">
            <span className="tabular-nums">05</span>
            <span className="h-px w-6 bg-ink/30" />
            The art of batik
          </p>
          <h2 id="art-of-batik" className="display mt-6 text-[2.75rem] md:text-6xl xl:text-[5.25rem]">
            <RichTitle text={c.title} />
          </h2>
        </Reveal>
        <Reveal delay={0.1} className="lg:col-span-4 lg:col-start-9 lg:self-end">
          <p className="text-[0.95rem] leading-relaxed text-ink/80">{c.text}</p>
          <Link to="/about" className="link-under mt-6 inline-block text-xs tracking-[0.16em] uppercase">
            Our story
          </Link>
        </Reveal>
      </div>

      {/* Process */}
      <div className="container-brk mt-16 grid gap-12 md:mt-24 md:grid-cols-3 md:gap-8 lg:gap-14">
        {c.steps.map((s, i) => (
          <Reveal key={i} delay={i * 0.1} className={STEP_LAYOUT[i % 3].offset}>
            <div className={cn('relative overflow-hidden bg-sand', STEP_LAYOUT[i % 3].aspect)}>
              <Img asset={s.image} sizes="(min-width:768px) 30vw, 100vw" />
            </div>
            <div className="mt-6 grid grid-cols-[2.5rem_1fr] gap-x-2">
              <span className="font-serif text-xl text-bronze italic">{STEP_LAYOUT[i % 3].no}</span>
              <div>
                <h3 className="font-serif text-2xl md:text-[1.75rem]">{s.title}</h3>
                <p className="eyebrow mt-1 text-[0.6rem] text-stone">{s.term}</p>
                <p className="mt-4 text-sm leading-relaxed text-ink/75">{s.text}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Moving motif word band */}
      <div ref={ref} className="mt-24 border-y border-ink/15 py-6 md:mt-32 md:py-8" aria-hidden>
        <motion.p style={{ x }} className="font-serif text-[2.5rem] whitespace-nowrap text-ink/80 italic md:text-7xl">
          {c.motifs} · {c.motifs}
        </motion.p>
      </div>

      {/* Facts */}
      <div className="container-brk mt-16 grid grid-cols-2 gap-x-6 gap-y-10 md:mt-20 lg:grid-cols-4">
        {c.facts.map((f, i) => (
          <Reveal key={i} delay={i * 0.06} className="border-t border-ink/20 pt-5">
            <p className="font-serif text-4xl md:text-5xl">{f.value}</p>
            <p className="mt-2 max-w-[14rem] text-sm text-stone">{f.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
