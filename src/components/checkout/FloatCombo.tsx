import { AnimatePresence, motion } from 'motion/react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { useEscape } from '../../hooks/useUi';
import { cn } from '../../lib/format';

interface Props {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  error?: string;
  valid?: boolean;
  disabled?: boolean;
  /** Shown when disabled, e.g. "Choose a province first" */
  disabledHint?: string;
  searchPlaceholder?: string;
  className?: string;
}

/** Below Tailwind's `sm` breakpoint the list opens as a bottom sheet. */
const useIsPhone = () => {
  const [phone, setPhone] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 639px)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const h = () => setPhone(mq.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);
  return phone;
};

/**
 * Brand-styled replacement for a native <select>: same floating label, ✓ and
 * error states as the text fields, a searchable Jost-set list (panel on
 * desktop/tablet, bottom sheet on phones) and full keyboard support.
 */
export function FloatCombo({ label, value, options, onChange, error, valid, disabled, disabledHint, searchPlaceholder = 'Search…', className }: Props) {
  const id = useId();
  const phone = useIsPhone();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const wrap = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<CSSProperties>({});

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? options.filter((o) => o.toLowerCase().includes(q)) : options;
  }, [options, query]);

  const close = (refocus = true) => {
    setOpen(false);
    setQuery('');
    if (refocus) trigger.current?.focus();
  };
  useEscape(open, () => close());

  // open: reset highlight to the current value and focus search
  useEffect(() => {
    if (!open) return;
    setActive(Math.max(0, options.indexOf(value)));
    requestAnimationFrame(() => search.current?.focus({ preventScroll: true }));
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // desktop panel is portalled to <body> (step panels clip overflow), so track the trigger's position
  useLayoutEffect(() => {
    if (!open || phone) return;
    const place = () => {
      const r = trigger.current?.getBoundingClientRect();
      if (!r) return;
      const below = window.innerHeight - r.bottom;
      const up = below < 320 && r.top > below;
      setPos(up ? { left: r.left, width: r.width, bottom: window.innerHeight - r.top + 4 } : { left: r.left, width: r.width, top: r.bottom + 4 });
    };
    place();
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    return () => {
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
    };
  }, [open, phone]);

  // close when clicking outside (desktop panel)
  useEffect(() => {
    if (!open || phone) return;
    const h = (e: PointerEvent) => !wrap.current?.contains(e.target as Node) && !panel.current?.contains(e.target as Node) && close(false);
    document.addEventListener('pointerdown', h);
    return () => document.removeEventListener('pointerdown', h);
  }, [open, phone]); // eslint-disable-line react-hooks/exhaustive-deps

  // keep the highlighted option in view
  useEffect(() => {
    list.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const pick = (v: string) => {
    onChange(v);
    close();
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[active]) pick(filtered[active]);
    } else if (e.key === 'Tab') {
      close(false);
    }
  };

  const filled = !!value;
  const listbox = (
    <>
      <div className="relative border-b border-ink/10">
        <Search size={15} strokeWidth={1.4} className="absolute top-1/2 left-3.5 -translate-y-1/2 text-stone" aria-hidden />
        <input
          ref={search}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={onKey}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          aria-controls={`${id}-list`}
          aria-activedescendant={filtered[active] ? `${id}-opt-${active}` : undefined}
          className="h-12 w-full bg-transparent pr-3 pl-10 font-sans text-sm text-ink placeholder:text-stone/70 focus:outline-none"
        />
      </div>
      <ul ref={list} id={`${id}-list`} role="listbox" aria-label={label} className="max-h-64 overflow-y-auto py-1.5 sm:max-h-72">
        {filtered.map((o, i) => (
          <li
            key={o}
            id={`${id}-opt-${i}`}
            data-index={i}
            role="option"
            aria-selected={o === value}
            onMouseEnter={() => setActive(i)}
            onClick={() => pick(o)}
            className={cn(
              'flex cursor-pointer items-center justify-between gap-3 px-4 py-3 font-sans text-sm transition-colors sm:py-2.5',
              i === active ? 'bg-mist' : '',
              o === value ? 'text-ink' : 'text-ink/80',
            )}
          >
            <span className={cn(o === value && 'font-medium')}>{o}</span>
            {o === value && <Check size={15} strokeWidth={2} className="text-ink" aria-hidden />}
          </li>
        ))}
        {filtered.length === 0 && <li className="px-4 py-3 text-sm text-stone">No matches for “{query}”</li>}
      </ul>
    </>
  );

  return (
    <div ref={wrap} className={cn('relative', className)}>
      <button
        ref={trigger}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (!open && (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            setOpen(true);
          }
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-invalid={!!error}
        aria-label={`${label}${value ? `: ${value}` : ''}`}
        className={cn(
          'relative flex h-14 w-full items-end border bg-paper px-4 pb-2 text-left font-sans text-sm transition-colors focus:outline-none disabled:cursor-not-allowed disabled:opacity-55',
          error ? 'border-danger' : open ? 'border-ink' : 'border-ink/12 focus-visible:border-ink',
        )}
      >
        <span
          className={cn(
            'pointer-events-none absolute left-4 text-stone transition-all duration-200',
            filled ? 'top-[0.85rem] -translate-y-1/2 text-[0.65rem]' : 'top-1/2 -translate-y-1/2 text-sm',
          )}
        >
          {disabled && disabledHint && !filled ? disabledHint : label}
        </span>
        <span className={cn('truncate pr-8 text-ink', !filled && 'invisible')}>{value || '—'}</span>
        <span className="absolute top-1/2 right-3.5 -translate-y-1/2">
          {valid && !error && !open ? (
            <Check size={16} strokeWidth={2} className="text-[#3f8f5a]" aria-hidden />
          ) : (
            <ChevronDown size={16} strokeWidth={1.4} className={cn('text-stone transition-transform', open && 'rotate-180')} aria-hidden />
          )}
        </span>
      </button>
      {error && <span className="mt-1 block text-xs text-danger">{error}</span>}

      {createPortal(
        <AnimatePresence>
          {open && !phone && (
            <motion.div
              ref={panel}
              style={pos}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="fixed z-[80] border border-ink/15 bg-paper shadow-[0_18px_40px_-18px_rgba(36,36,36,.35)]"
            >
              {listbox}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
      <AnimatePresence>
        {open && phone && (
          <motion.div className="fixed inset-0 z-[70]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-ink/40" onClick={() => close()} />
            <motion.div
              role="dialog"
              aria-label={label}
              className="absolute inset-x-0 bottom-0 bg-paper pb-[env(safe-area-inset-bottom)]"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <span className="font-serif text-xl">{label}</span>
                <button type="button" onClick={() => close()} className="-mr-2 p-2" aria-label="Close">
                  <X size={18} strokeWidth={1.25} />
                </button>
              </div>
              {listbox}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
