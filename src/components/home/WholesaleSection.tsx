import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { useHomeContent } from '../../hooks/useCatalog';
import { pad2 } from '../../lib/format';
import { Img } from '../ui/Img';
import { RichTitle } from '../ui/RichTitle';
import { Reveal } from '../ui/Reveal';

/** Enquiry type preselected on /wholesale for each service row, in order */
const SERVICE_TYPES = ['uniform', 'custom', 'wholesale', 'oem'];

export function WholesaleSection() {
  const c = useHomeContent().wholesale;
  return (
    <section className="bg-ivory py-20 md:py-28 lg:py-36" aria-labelledby="wholesale-title">
      <div className="container-brk grid gap-12 lg:grid-cols-12 lg:gap-10">
        {/* Image column */}
        <Reveal className="lg:col-span-5">
          <div className="relative">
            <div className="relative aspect-[4/5] overflow-hidden bg-sand">
              <Img asset={c.image} sizes="(min-width:1024px) 38vw, 100vw" />
            </div>
            <div className="absolute -right-3 -bottom-8 hidden w-[42%] border-8 border-ivory md:block lg:-right-10">
              <div className="relative aspect-square overflow-hidden bg-sand">
                <Img asset={c.detailImage} sizes="240px" />
              </div>
            </div>
          </div>
          <dl className="mt-14 grid grid-cols-3 gap-4 border-t border-ink/15 pt-5 md:mt-16">
            {c.terms.map((t, i) => (
              <div key={i}>
                <dt className="eyebrow text-[0.58rem] text-stone">{t.k}</dt>
                <dd className="mt-2 text-sm">{t.v}</dd>
              </div>
            ))}
          </dl>
        </Reveal>

        {/* Copy column */}
        <div className="lg:col-span-6 lg:col-start-7">
          <Reveal>
            <p className="eyebrow flex items-center gap-3 text-stone">
              <span className="tabular-nums">06</span>
              <span className="h-px w-6 bg-ink/30" />
              Atelier services
            </p>
            <h2 id="wholesale-title" className="display mt-6 text-[2.6rem] md:text-6xl xl:text-[4.75rem]">
              <RichTitle text={c.title} />
            </h2>
            <p className="mt-6 max-w-md text-[0.95rem] leading-relaxed text-ink/75">{c.text}</p>
          </Reveal>

          <ul className="mt-12">
            {c.services.map((s, i) => (
              <Reveal as="li" key={i} delay={i * 0.06} className="border-t border-ink/15 last:border-b">
                <Link to={SERVICE_TYPES[i] ? `/wholesale?type=${SERVICE_TYPES[i]}` : '/wholesale'} className="group grid grid-cols-[2.25rem_1fr_auto] gap-x-4 py-6" data-touch-hover>
                  <span className="pt-1.5 text-xs text-stone tabular-nums">{pad2(i + 1)}</span>
                  <span>
                    <span className="block font-serif text-2xl md:text-[1.85rem]">{s.title}</span>
                    <span className="mt-2 block max-w-md text-sm leading-relaxed text-stone">{s.text}</span>
                  </span>
                  <ArrowRight size={18} strokeWidth={1} className="mt-2 transition-transform duration-500 group-hover:translate-x-1.5 group-inview:translate-x-1.5" />
                </Link>
              </Reveal>
            ))}
          </ul>

          <Reveal delay={0.2} className="mt-10 flex flex-wrap items-center gap-6">
            <Link to="/wholesale" className="btn-ink">
              Start an enquiry
            </Link>
            <p className="text-xs text-stone">{c.note}</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
