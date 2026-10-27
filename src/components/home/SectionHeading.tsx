import type { ReactNode } from 'react';
import { cn } from '../../lib/format';
import { Reveal } from '../ui/Reveal';

interface Props {
  index?: string;
  eyebrow: string;
  title: ReactNode;
  aside?: ReactNode;
  className?: string;
  tone?: 'ink' | 'ivory';
}

/** Editorial section heading: index number + eyebrow, large serif title, optional right-hand aside. */
export function SectionHeading({ index, eyebrow, title, aside, className, tone = 'ink' }: Props) {
  return (
    <Reveal className={cn('flex flex-col gap-6 md:flex-row md:items-end md:justify-between', className)}>
      <div>
        <p className={cn('eyebrow flex items-center gap-3', tone === 'ink' ? 'text-stone' : 'text-ivory/60')}>
          {index && <span className="tabular-nums">{index}</span>}
          {index && <span className={cn('h-px w-6', tone === 'ink' ? 'bg-ink/30' : 'bg-ivory/40')} />}
          {eyebrow}
        </p>
        <h2 className="display mt-4 text-[2.5rem] md:text-6xl xl:text-[4.5rem]">{title}</h2>
      </div>
      {aside && <div className="md:pb-2">{aside}</div>}
    </Reveal>
  );
}
