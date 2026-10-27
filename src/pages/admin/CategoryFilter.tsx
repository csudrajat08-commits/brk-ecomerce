import { categories as baseCategories } from '../../data/catalog';
import { useSegmentCategories } from '../../hooks/useCatalog';
import { cn } from '../../lib/format';
import type { Product } from '../../types/commerce';
import { inputCls } from './AdminUi';

/** `all:` · `cat:<main category>` · `women:<sub-category>` · `men:<sub-category>` */
export type AdminFilter = string;

export function matchesFilter(p: Product, filter: AdminFilter) {
  const [kind, value] = filter.split(':');
  if (kind === 'women' || kind === 'men') return p.subcategory === value;
  if (kind === 'cat') return p.category === value;
  return true;
}

/** Category dropdown used by the admin product lists. */
export function CategorySelect({ value, onChange, className }: { value: AdminFilter; onChange: (v: AdminFilter) => void; className?: string }) {
  const women = useSegmentCategories('women');
  const men = useSegmentCategories('men');
  return (
    <select className={cn(inputCls, className)} value={value} onChange={(e) => onChange(e.target.value)} aria-label="Filter kategori">
      <option value="all:">Semua produk</option>
      <optgroup label="Women">
        {women
          .filter((c) => c.slug !== 'all')
          .map((c) => (
            <option key={c.slug} value={`women:${c.slug}`}>
              {c.label}
            </option>
          ))}
      </optgroup>
      <optgroup label="Men">
        {men
          .filter((c) => c.slug !== 'all')
          .map((c) => (
            <option key={c.slug} value={`men:${c.slug}`}>
              {c.label}
            </option>
          ))}
      </optgroup>
      <optgroup label="Kategori utama">
        {baseCategories.map((c) => (
          <option key={c.slug} value={`cat:${c.slug}`}>
            {c.name}
          </option>
        ))}
      </optgroup>
    </select>
  );
}
