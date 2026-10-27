import { Check } from 'lucide-react';
import type { ReactNode } from 'react';
import { NavLink } from 'react-router';
import { COLOR_FAMILIES, MOTIF_FAMILIES, WOMEN_SIZES, type CatalogFilters } from '../../data/womenCatalog';
import { cn } from '../../lib/format';
import { PriceRange } from './PriceRange';

/** One entry of the category list at the top of the panel */
export interface CatalogNavItem {
  key: string;
  label: string;
  to: string;
  count: number;
}

interface Props {
  filters: CatalogFilters;
  onChange: (f: CatalogFilters) => void;
  priceBounds: [number, number];
  /** Category (or collection) links shown at the top */
  nav: CatalogNavItem[];
  navTitle?: string;
  activeKey: string;
  /** Size buttons to offer (defaults to S–XXL) */
  sizes?: string[];
  /** Colour families present in the current category — others are hidden */
  availableColors?: string[];
  onNavigate?: () => void;
}

const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-ink/12 py-6 first:border-t-0 first:pt-0">
      <h3 className="eyebrow mb-4 text-[0.65rem] text-ink">{title}</h3>
      {children}
    </section>
  );
}

export function FilterPanel({ filters, onChange, priceBounds, nav, navTitle = 'Category', activeKey, sizes = WOMEN_SIZES, availableColors, onNavigate }: Props) {
  const set = (patch: Partial<CatalogFilters>) => onChange({ ...filters, ...patch });

  return (
    <div>
      <Section title={navTitle}>
        <ul className="space-y-2.5 text-sm">
          {nav.map((c) => {
            const active = activeKey === c.key;
            return (
              <li key={c.key}>
                <NavLink
                  to={c.to}
                  end
                  onClick={onNavigate}
                  className={cn('group flex items-baseline justify-between gap-3 transition-colors', active ? 'text-ink' : 'text-ink/60 hover:text-ink')}
                >
                  <span className={cn('relative', active && 'font-medium')}>
                    {active && <span className="absolute top-1/2 -left-3.5 h-1 w-1 -translate-y-1/2 rounded-full bg-bronze" />}
                    {c.label}
                  </span>
                  <span className="text-[0.68rem] text-stone tabular-nums">{c.count}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </Section>

      <Section title="Size">
        <div className="grid grid-cols-5 gap-1.5">
          {sizes.map((s) => {
            const on = filters.sizes.includes(s);
            return (
              <button
                key={s}
                type="button"
                aria-pressed={on}
                onClick={() => set({ sizes: toggle(filters.sizes, s) })}
                className={cn('h-9 border px-1 text-xs whitespace-nowrap transition-colors active:scale-95', s.length > 3 && 'col-span-2', on ? 'border-ink bg-ink text-ivory' : 'border-ink/20 hover:border-ink')}
              >
                {s}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Color">
        <ul className="space-y-2.5">
          {COLOR_FAMILIES.filter((c) => !availableColors || availableColors.includes(c.name) || filters.colors.includes(c.name)).map((c) => {
            const on = filters.colors.includes(c.name);
            return (
              <li key={c.name}>
                <button type="button" aria-pressed={on} onClick={() => set({ colors: toggle(filters.colors, c.name) })} className="group flex w-full items-center gap-3 text-left text-sm">
                  <span className={cn('flex h-5 w-5 items-center justify-center rounded-full p-[2px] ring-1 transition-shadow', on ? 'ring-ink' : 'ring-transparent group-hover:ring-ink/30')}>
                    <span className="flex h-full w-full items-center justify-center rounded-full border border-ink/10" style={{ background: c.hex }}>
                      {on && <Check size={10} strokeWidth={2} className={c.name === 'Beige' || c.name === 'Pink' || c.name === 'Grey' ? 'text-ink' : 'text-ivory'} />}
                    </span>
                  </span>
                  <span className={on ? 'text-ink' : 'text-ink/70 group-hover:text-ink'}>{c.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </Section>

      <Section title="Price">
        <PriceRange bounds={priceBounds} value={filters.price ?? priceBounds} onChange={(v) => set({ price: v[0] <= priceBounds[0] && v[1] >= priceBounds[1] ? null : v })} />
      </Section>

      <Section title="Motif">
        <ul className="space-y-2.5">
          {MOTIF_FAMILIES.map((m) => {
            const on = filters.motifs.includes(m);
            return (
              <li key={m}>
                <button type="button" aria-pressed={on} onClick={() => set({ motifs: toggle(filters.motifs, m) })} className="group flex w-full items-center gap-3 text-left text-sm">
                  <span className={cn('flex h-4 w-4 items-center justify-center border transition-colors', on ? 'border-ink bg-ink text-ivory' : 'border-ink/30 group-hover:border-ink')}>
                    {on && <Check size={10} strokeWidth={2} />}
                  </span>
                  <span className={on ? 'text-ink' : 'text-ink/70 group-hover:text-ink'}>{m}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </Section>
    </div>
  );
}
