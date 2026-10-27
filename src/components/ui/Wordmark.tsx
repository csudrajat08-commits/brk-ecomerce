import { cn } from '../../lib/format';

/** Typographic BRK identity — stands in for the logo file until brand assets are supplied. */
export function Wordmark({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn('flex flex-col items-center leading-none', className)}>
      <span
        className={cn(
          'font-sans font-medium tracking-[0.5em] uppercase transition-all duration-500',
          compact ? 'h-0 overflow-hidden text-[0.5rem] opacity-0' : 'mb-1.5 text-[0.55rem] opacity-80',
        )}
        style={{ paddingLeft: '0.5em' }}
      >
        Batik
      </span>
      <span className={cn('font-serif tracking-[0.02em] whitespace-nowrap transition-all duration-500', compact ? 'text-[1.2rem] md:text-[1.35rem]' : 'text-[1.3rem] sm:text-[1.6rem] md:text-[1.75rem]')}>
        Riana Kesuma
      </span>
    </span>
  );
}
