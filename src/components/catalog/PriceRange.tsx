import { formatIDR } from '../../lib/format';

interface Props {
  bounds: [number, number];
  value: [number, number];
  onChange: (v: [number, number]) => void;
  step?: number;
}

/** Dual-thumb IDR price range built from two native range inputs (keyboard accessible). */
export function PriceRange({ bounds, value, onChange, step = 50_000 }: Props) {
  const [min, max] = bounds;
  const [lo, hi] = value;
  const pct = (v: number) => ((v - min) / Math.max(1, max - min)) * 100;

  return (
    <div>
      <div className="relative h-6">
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-ink/15" />
        <div className="absolute top-1/2 h-px -translate-y-1/2 bg-ink" style={{ left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }} />
        <input
          type="range"
          className="range-thumb"
          min={min}
          max={max}
          step={step}
          value={lo}
          onChange={(e) => onChange([Math.min(Number(e.target.value), hi - step), hi])}
          aria-label="Minimum price"
          aria-valuetext={formatIDR(lo)}
        />
        <input
          type="range"
          className="range-thumb"
          min={min}
          max={max}
          step={step}
          value={hi}
          onChange={(e) => onChange([lo, Math.max(Number(e.target.value), lo + step)])}
          aria-label="Maximum price"
          aria-valuetext={formatIDR(hi)}
        />
      </div>
      <div className="mt-3 flex justify-between text-xs tabular-nums">
        <span>{formatIDR(lo)}</span>
        <span>{formatIDR(hi)}</span>
      </div>
    </div>
  );
}
