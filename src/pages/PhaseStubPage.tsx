import { Link, useLocation } from 'react-router';
import { PageTop } from '../components/layout/Layout';

/**
 * Placeholder for routes scheduled in Phase 4 (listing, PDP, bag, checkout,
 * wishlist, about, wholesale). Keeps every homepage link resolvable meanwhile.
 */
export default function PhaseStubPage({ title }: { title: string }) {
  const { pathname, search } = useLocation();
  return (
    <PageTop>
      <section className="container-brk flex min-h-[60vh] flex-col justify-center py-20">
        <p className="eyebrow text-bronze">Phase 4 — in progress</p>
        <h1 className="display mt-5 text-5xl md:text-7xl">{title}</h1>
        <p className="mt-6 max-w-lg text-sm leading-relaxed text-stone">
          This page is part of the next build phase. The route is live so links from the homepage resolve.
          <br />
          <code className="mt-2 inline-block text-xs text-ink/60">
            {pathname}
            {search}
          </code>
        </p>
        <Link to="/" className="btn-outline mt-10 self-start">
          Back to home
        </Link>
      </section>
    </PageTop>
  );
}
