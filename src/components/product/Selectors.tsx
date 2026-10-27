import type { ReactNode } from 'react';
import type { ColorOption } from '../../types/commerce';
import { cn } from '../../lib/format';

export function ColorSwatches({ colors, value, onChange, compact }: { colors: ColorOption[]; value: string; onChange: (c: string) => void; compact?: boolean }) {
  return (
    <fieldset>
      <legend className={cn('eyebrow text-stone', compact ? 'mb-2 text-[0.62rem]' : 'mb-3')}>
        Colour — <span className="text-ink normal-case tracking-normal">{value}</span>
      </legend>
      <div className="flex gap-3">
        {colors.map((c) => (
          <button
            key={c.name}
            type="button"
            onClick={() => onChange(c.name)}
            aria-pressed={value === c.name}
            aria-label={c.name}
            title={c.name}
            className={cn('rounded-full p-[3px] transition-shadow', compact ? 'h-6 w-6' : 'h-7 w-7', value === c.name ? 'ring-1 ring-ink' : 'ring-1 ring-transparent hover:ring-ink/30')}
          >
            <span className="block h-full w-full rounded-full border border-ink/10" style={{ background: c.hex }} />
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function SizeSelector({
  sizes,
  value,
  onChange,
  error,
  aside,
  compact,
}: {
  sizes: string[];
  value: string | null;
  onChange: (s: string) => void;
  error?: boolean;
  aside?: ReactNode;
  compact?: boolean;
}) {
  return (
    <fieldset>
      <div className={cn('flex items-baseline justify-between', compact ? 'mb-2' : 'mb-3')}>
        <legend className={cn('eyebrow', compact && 'text-[0.62rem]', error ? 'text-danger' : 'text-stone')}>{error ? 'Please select a size' : 'Size'}</legend>
        {aside}
      </div>
      <div className="flex flex-wrap gap-2">
        {sizes.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            aria-pressed={value === s}
            className={cn(
              'border transition-colors active:scale-95',
              compact ? 'h-9 min-w-10 px-2.5 text-xs' : 'h-11 min-w-12 px-3 text-sm',
              value === s ? 'border-ink bg-ink text-ivory' : error ? 'border-danger/60 hover:border-ink' : 'border-ink/20 hover:border-ink',
            )}
          >
            {s}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
