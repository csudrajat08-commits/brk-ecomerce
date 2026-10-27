import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpDown, Check, ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { SORT_OPTIONS, type CatalogSort } from '../../data/womenCatalog';
import { useEscape } from '../../hooks/useUi';
import { cn } from '../../lib/format';

/** Brand-styled sort dropdown (replaces the native <select>, whose list can't be styled). */
export function SortMenu({ value, onChange, className }: { value: CatalogSort; onChange: (v: CatalogSort) => void; className?: string }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const current = SORT_OPTIONS.find((o) => o.value === value) ?? SORT_OPTIONS[0];
  useEscape(open, () => setOpen(false));

  useEffect(() => {
    if (!open) return;
    const h = (e: PointerEvent) => !wrap.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener('pointerdown', h);
    return () => document.removeEventListener('pointerdown', h);
  }, [open]);

  return (
    <div ref={wrap} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Sort by: ${current.label}`}
        className={cn(
          'inline-flex h-10 items-center gap-2 border px-3 font-sans text-xs whitespace-nowrap transition-[border-color,transform] active:scale-95',
          open ? 'border-ink' : 'border-ink/25 hover:border-ink',
        )}
      >
        <ArrowUpDown size={13} strokeWidth={1.4} className="text-stone" />
        <span className="hidden text-stone sm:inline">Sort:</span>
        <span className="text-ink">{current.label}</span>
        <ChevronDown size={14} strokeWidth={1.4} className={cn('text-stone transition-transform', open && 'rotate-180')} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            aria-label="Sort by"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-[calc(100%+4px)] left-0 z-30 min-w-[13rem] border border-ink/15 bg-paper py-1.5 shadow-[0_18px_40px_-18px_rgba(36,36,36,.35)] lg:right-0 lg:left-auto"
          >
            {SORT_OPTIONS.map((o) => (
              <li key={o.value} role="option" aria-selected={o.value === value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  className={cn('flex w-full items-center justify-between gap-4 px-4 py-2.5 text-left font-sans text-sm transition-colors hover:bg-mist', o.value === value ? 'text-ink' : 'text-ink/75')}
                >
                  <span className={cn(o.value === value && 'font-medium')}>{o.label}</span>
                  {o.value === value && <Check size={14} strokeWidth={2} />}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
