import { useEffect, useState } from 'react';

/** Locks page scroll while an overlay is open. */
export function useLockBody(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const prev = document.body.style.overflow;
    const sb = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${sb}px`;
    return () => {
      document.body.style.overflow = prev;
      document.body.style.paddingRight = '';
    };
  }, [locked]);
}

/** Calls `onEscape` when Escape is pressed while `active`. */
export function useEscape(active: boolean, onEscape: () => void) {
  useEffect(() => {
    if (!active) return;
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onEscape();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [active, onEscape]);
}

export function useScrolled(threshold = 24) {
  const [scrolled, setScrolled] = useState(() => typeof window !== 'undefined' && window.scrollY > threshold);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > threshold);
    h();
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, [threshold]);
  return scrolled;
}
