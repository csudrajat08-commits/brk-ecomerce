import { motion, useReducedMotion } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router';

interface Props {
  /** Changes with the category — replays the entrance */
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
  count: number;
  crumbs: Array<{ label: string; to?: string }>;
}

/**
 * Compact page header for a category catalogue. The campaign imagery lives on
 * the /women landing page; here the products come straight after the title.
 */
export function CatalogHeader({ id, eyebrow, title, description, count, crumbs }: Props) {
  const reduce = useReducedMotion();
  return (
    <header className="container-brk pt-6 md:pt-10" aria-labelledby="catalog-title">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-[0.7rem] tracking-[0.06em] text-stone">
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
      <motion.div
        key={id}
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mt-5 flex flex-col gap-3 md:mt-7 md:flex-row md:items-end md:justify-between md:gap-10"
      >
        <div className="min-w-0">
          <p className="eyebrow text-[0.62rem] text-bronze">{eyebrow}</p>
          <h1 id="catalog-title" className="display mt-2 text-[2.4rem] md:text-5xl xl:text-[3.5rem]">
            {title}
          </h1>
        </div>
        {description && <p className="max-w-md text-sm leading-relaxed text-ink/70 md:pb-1.5 md:text-right">{description}</p>}
      </motion.div>
      <p className="sr-only">
        {count} {count === 1 ? 'piece' : 'pieces'}
      </p>
    </header>
  );
}
