import { Minus, Plus } from 'lucide-react';
import { cn } from '../../lib/format';

interface Props {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md';
  label?: string;
}

export function QuantityStepper({ value, onChange, min = 1, max = 10, size = 'md', label = 'Quantity' }: Props) {
  const h = size === 'sm' ? 'h-8' : 'h-12';
  const w = size === 'sm' ? 'w-8' : 'w-11';
  return (
    <div className={cn('inline-flex items-center border border-ink/20', h)} role="group" aria-label={label}>
      <button type="button" className={cn('flex h-full items-center justify-center hover:bg-mist disabled:opacity-30', w)} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="Decrease quantity">
        <Minus size={13} strokeWidth={1.5} />
      </button>
      <span className="min-w-8 text-center text-sm tabular-nums" aria-live="polite">
        {value}
      </span>
      <button type="button" className={cn('flex h-full items-center justify-center hover:bg-mist disabled:opacity-30', w)} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Increase quantity">
        <Plus size={13} strokeWidth={1.5} />
      </button>
    </div>
  );
}
