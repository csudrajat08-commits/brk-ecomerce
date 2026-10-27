import { useMemo } from 'react';
import { useParams } from 'react-router';
import { CatalogBrowser } from '../components/catalog/CatalogBrowser';
import type { CatalogNavItem } from '../components/catalog/FilterPanel';
import { PageTop } from '../components/layout/Layout';
import { SEGMENTS } from '../data/segments';
import { useProducts, useSegmentCategories } from '../hooks/useCatalog';
import type { Segment } from '../types/commerce';
import PhaseStubPage from './PhaseStubPage';

/** /women/:sub and /men/:sub — one category of a segment (or …/all). */
export default function SegmentCatalogPage({ segment }: { segment: Segment }) {
  const { sub } = useParams();
  const seg = SEGMENTS[segment];
  const womenCategories = useSegmentCategories(segment);
  const def = womenCategories.find((c) => c.slug === sub);
  const { data: women, loading } = useProducts({ segment });

  const nav = useMemo<CatalogNavItem[]>(
    () =>
      womenCategories.map((c) => ({
        key: c.slug,
        label: c.label,
        to: `${seg.path}/${c.slug}`,
        count: c.slug === 'all' ? women.length : women.filter((p) => p.subcategory === c.slug).length,
      })),
    [womenCategories, women, seg],
  );
  const inCategory = useMemo(() => (!def || def.slug === 'all' ? women : women.filter((p) => p.subcategory === def.slug)), [women, def]);

  if (!def) return <PhaseStubPage title="Page not found" />;

  return (
    <PageTop>
      <CatalogBrowser
        id={def.slug}
        header={{ eyebrow: def.hero.eyebrow, title: def.hero.title, description: def.hero.description }}
        crumbs={[{ label: 'Home', to: '/' }, { label: seg.label, to: seg.path }, { label: def.label }]}
        products={inCategory}
        priceScope={women}
        nav={nav}
        activeKey={def.slug}
        loading={loading}
      />
    </PageTop>
  );
}
