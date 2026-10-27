import { Check } from 'lucide-react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/format';

const box = (error?: string) =>
  cn(
    'peer h-14 w-full border bg-paper px-4 pt-5 pb-1.5 text-sm text-ink transition-colors focus:outline-none',
    error ? 'border-danger' : 'border-ink/12 focus:border-ink',
  );

const floatLabel =
  'pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-sm text-stone transition-all duration-200 peer-focus:top-[0.85rem] peer-focus:text-[0.65rem] peer-[:not(:placeholder-shown)]:top-[0.85rem] peer-[:not(:placeholder-shown)]:text-[0.65rem]';

interface Common {
  label: string;
  error?: string;
  /** Show the green check (field filled & valid) */
  valid?: boolean;
  className?: string;
}

/** Text input with a floating label and inline ✓ / error state. */
export function FloatInput({ label, error, valid, className, ...input }: Common & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={cn('block', className)}>
      <span className="relative block">
        <input {...input} placeholder=" " aria-invalid={!!error} className={cn(box(error), 'pr-10')} />
        <span className={floatLabel}>{label}</span>
        {valid && !error && <Check size={16} strokeWidth={2} className="absolute top-1/2 right-3.5 -translate-y-1/2 text-[#3f8f5a]" aria-hidden />}
      </span>
      {error && <span className="mt-1 block text-xs text-danger">{error}</span>}
    </label>
  );
}

/** Selectable option card (delivery / payment). */
export function OptionCard({
  name,
  checked,
  onChange,
  icon,
  title,
  detail,
  aside,
  children,
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
  icon: ReactNode;
  title: string;
  detail: string;
  aside?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <label
      className={cn(
        'relative flex cursor-pointer flex-col border p-4 transition-[border-color,box-shadow,background-color] duration-200',
        checked ? 'border-ink bg-paper shadow-[0_0_0_1px_var(--color-ink)]' : 'border-ink/12 bg-paper/60 hover:border-ink/40',
      )}
    >
      <input type="radio" name={name} checked={checked} onChange={onChange} className="sr-only" />
      <span className="flex items-start gap-3">
        <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center transition-colors', checked ? 'bg-ink text-ivory' : 'bg-mist text-ink')}>{icon}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm">{title}</span>
          <span className="mt-0.5 block text-xs text-stone">{detail}</span>
        </span>
        {aside && <span className="shrink-0 text-sm tabular-nums">{aside}</span>}
      </span>
      {children}
    </label>
  );
}
