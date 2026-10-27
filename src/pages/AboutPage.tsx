import { ArrowRight, MapPin } from 'lucide-react';
import { useEffect } from 'react';
import { Link } from 'react-router';
import { PageTop } from '../components/layout/Layout';
import { Img } from '../components/ui/Img';
import { Reveal } from '../components/ui/Reveal';
import { brand, contact, stores } from '../data/site';
import { siteAssets } from '../data/siteAssets';

/** Milestones from the public batikrianakesuma.com About and Export pages. */
const TIMELINE = [
  { year: '1997', title: 'Founded in Solo', text: 'Riana Kusuma, born into a family of Solo batik makers, begins selling hand-drawn batik cloth.' },
  { year: '2006', title: 'Ready-to-wear', text: 'The atelier moves from fabric to clothing — batik cut into contemporary silhouettes for every day.' },
  { year: '2023', title: 'Adikarya Batik Nusantara', text: 'BRK pieces shown among the masterworks of Indonesian batik.' },
  { year: '2024', title: 'On the runway', text: 'Jakarta Fashion Week, Jakarta Muslim Fashion Week, IN2MF and the BSI International Expo.' },
  { year: '2025', title: 'Osaka', text: 'A selection of silk and bamboo stoles travels to Japan; collections ship to Japanese partners.' },
  { year: '2026', title: 'Indonesia Fashion Week', text: 'Hibiscus, tumpal and janggan silhouettes — the runway collection now online.' },
];

const VALUES = [
  { title: 'Comfort', text: 'Breathable cotton and hand-loomed silk, cut to move and to be worn all day in the tropics.' },
  { title: 'Elegant', text: 'Hand-drawn lines, natural dyes and gold-leaf prada, finished with the care of a couture atelier.' },
  { title: 'Classic', text: 'Parang, kawung and sogan — motifs of the Solo court, carried into a modern wardrobe.' },
];

export default function AboutPage() {
  useEffect(() => {
    document.title = 'Our Story — Batik Riana Kesuma';
  }, []);

  return (
    <PageTop>
      {/* Opening */}
      <section className="container-brk grid gap-10 pt-8 pb-16 md:pt-12 lg:grid-cols-12 lg:items-end lg:gap-12 lg:pb-24">
        <Reveal className="lg:col-span-6">
          <p className="eyebrow text-bronze">Our story · Since {brand.founded}</p>
          <h1 className="display mt-5 text-[3.2rem] md:text-7xl xl:text-[6rem]">
            Batik from Solo,
            <br />
            <em>worn every day.</em>
          </h1>
          <p className="mt-8 max-w-lg text-[0.95rem] leading-relaxed text-ink/80">
            {brand.name} was founded in {brand.founded} in Solo by {brand.founder}, who grew up among the batik makers of Central Java. What began as a trade in hand-drawn cloth
            became, in 2006, a ready-to-wear house — carrying Indonesian heritage into each garment and connecting tradition with the way people live now.
          </p>
        </Reveal>
        <Reveal delay={0.1} className="grid grid-cols-[1.4fr_1fr] gap-3 lg:col-span-6">
          <div className="relative aspect-[2/3] overflow-hidden bg-sand">
            <Img asset={siteAssets.aboutHero} sizes="(min-width:1024px) 30vw, 58vw" priority />
          </div>
          <div className="relative mt-16 aspect-[2/3] self-end overflow-hidden bg-sand">
            <Img asset={siteAssets.aboutPortrait} sizes="(min-width:1024px) 20vw, 40vw" />
          </div>
        </Reveal>
      </section>

      {/* Vision */}
      <section className="bg-ink py-20 text-ivory md:py-28">
        <div className="container-brk grid gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <p className="eyebrow text-bronze">Vision</p>
          </Reveal>
          <Reveal delay={0.08} className="lg:col-span-8">
            <p className="font-serif text-3xl leading-snug md:text-5xl md:leading-[1.15]">
              To be the keeper of Indonesian batik tradition — and to <em className="text-sand">redefine its place</em> in modern, global fashion.
            </p>
            <p className="mt-8 max-w-xl text-sm leading-relaxed text-ivory/70">
              Every BRK piece supports local batik artisans and helps keep their craft alive for the next generation. Our younger line, Batik Tjah Ayoe by Riana Kusuma, brings the
              same craft to an active, everyday wardrobe.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Values */}
      <section className="container-brk py-20 md:py-28">
        <Reveal>
          <p className="eyebrow text-stone">{brand.tagline}</p>
          <h2 className="display mt-4 text-4xl md:text-6xl">What we make by.</h2>
        </Reveal>
        <div className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
          {VALUES.map((v, i) => (
            <Reveal key={v.title} delay={i * 0.08} className="border-t border-ink/20 pt-6">
              <span className="font-serif text-xl text-bronze italic">{['I', 'II', 'III'][i]}</span>
              <h3 className="mt-3 font-serif text-3xl">{v.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink/75">{v.text}</p>
            </Reveal>
          ))}
        </div>
        <div className="mt-16 grid grid-cols-3 gap-3 md:gap-6">
          {[siteAssets.batikCraftsmanship, siteAssets.batikCraftColour, siteAssets.batikCraftMotif].map((a, i) => (
            <Reveal key={a.src} delay={i * 0.06} className={i === 1 ? 'mt-10' : ''}>
              <div className="relative aspect-[4/5] overflow-hidden bg-sand">
                <Img asset={a} sizes="33vw" />
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-sand/45 py-20 md:py-28">
        <div className="container-brk">
          <Reveal>
            <p className="eyebrow text-stone">Milestones</p>
            <h2 className="display mt-4 text-4xl md:text-6xl">
              From Solo <em>to the world.</em>
            </h2>
          </Reveal>
          <ol className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {TIMELINE.map((t, i) => (
              <Reveal as="li" key={t.year} delay={(i % 3) * 0.06} className="border-t border-ink/20 pt-5">
                <p className="font-serif text-5xl text-bronze">{t.year}</p>
                <h3 className="mt-3 font-serif text-2xl">{t.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/75">{t.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Visit */}
      <section className="container-brk grid gap-12 py-20 md:py-28 lg:grid-cols-12">
        <Reveal className="lg:col-span-5">
          <p className="eyebrow text-stone">Visit us</p>
          <h2 className="display mt-4 text-4xl md:text-6xl">Showrooms & stores</h2>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-ink/75">See the cloth in person, have a piece fitted, or talk to the atelier about a commission.</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/women" className="btn-ink">
              Shop the collection
            </Link>
            <Link to="/wholesale" className="btn-outline group">
              Custom & wholesale <ArrowRight size={14} strokeWidth={1.25} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </Reveal>
        <div className="grid gap-8 sm:grid-cols-2 lg:col-span-7">
          {[contact.headOffice, contact.solo].map((s) => (
            <Reveal key={s.label} className="border-t border-ink/20 pt-5">
              <p className="eyebrow text-[0.62rem] text-bronze">Showroom</p>
              <h3 className="mt-2 font-serif text-2xl">{s.label}</h3>
              <p className="mt-3 flex gap-2 text-sm leading-relaxed text-ink/80">
                <MapPin size={15} strokeWidth={1.3} className="mt-0.5 shrink-0" /> {s.address}
              </p>
              <p className="mt-2 text-sm text-stone">{s.phones.join(' · ')}</p>
            </Reveal>
          ))}
          <Reveal className="border-t border-ink/20 pt-5 sm:col-span-2">
            <p className="eyebrow text-[0.62rem] text-bronze">Retail doors</p>
            <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              {stores.map((s) => (
                <li key={s.name}>
                  {s.name}
                  <span className="text-stone">
                    {s.detail ? ` · ${s.detail}` : ''} — {s.city}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>
    </PageTop>
  );
}
