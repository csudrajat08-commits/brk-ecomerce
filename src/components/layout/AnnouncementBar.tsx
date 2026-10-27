import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useHomeContent } from '../../hooks/useCatalog';
import { cn } from '../../lib/format';

export function AnnouncementBar({ hidden }: { hidden: boolean }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const announcements = useHomeContent().announcements;
  const n = Math.max(1, announcements.length);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setI((x) => (x + 1) % n), 5000);
    return () => clearInterval(t);
  }, [paused, n]);

  const step = (d: number) => setI((x) => (x + d + n) % n);
  const a = announcements[i % n];
  if (!a) return null;

  return (
    <div
      className={cn('overflow-hidden bg-ink text-ivory transition-[height] duration-500 ease-[var(--ease-editorial)]', hidden ? 'h-0' : 'h-9')}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-hidden={hidden}
    >
      <div className="container-brk flex h-9 items-center justify-between gap-4">
        <button type="button" onClick={() => step(-1)} className="p-1 opacity-60 hover:opacity-100" aria-label="Previous announcement" tabIndex={hidden ? -1 : 0}>
          <ChevronLeft size={14} strokeWidth={1.25} />
        </button>
        <div className="relative h-full flex-1 overflow-hidden text-center" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={i}
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -12, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Link to={a.to} className="eyebrow truncate text-[0.625rem] tracking-[0.2em] hover:text-sand" tabIndex={hidden ? -1 : 0}>
                {a.text}
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>
        <button type="button" onClick={() => step(1)} className="p-1 opacity-60 hover:opacity-100" aria-label="Next announcement" tabIndex={hidden ? -1 : 0}>
          <ChevronRight size={14} strokeWidth={1.25} />
        </button>
      </div>
    </div>
  );
}
