import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Horizontal rail helper: scroll progress, prev/next stepping, and
 * click-drag scrolling for mouse users (touch scrolls natively).
 */
export function useRail<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [state, setState] = useState({ progress: 0, canPrev: false, canNext: false, scrollable: false });

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setState({
      progress: max > 0 ? el.scrollLeft / max : 0,
      canPrev: el.scrollLeft > 4,
      canNext: el.scrollLeft < max - 4,
      scrollable: max > 4,
    });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    measure();
    el.addEventListener('scroll', measure, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(el);

    // Mouse drag-to-scroll
    let startX = 0;
    let startLeft = 0;
    let dragging = false;
    let moved = false;
    const down = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0 || el.scrollWidth <= el.clientWidth) return;
      dragging = true;
      moved = false;
      startX = e.clientX;
      startLeft = el.scrollLeft;
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 5) {
        moved = true;
        el.style.scrollSnapType = 'none';
        el.style.cursor = 'grabbing';
      }
      if (moved) el.scrollLeft = startLeft - dx;
    };
    const up = () => {
      if (!dragging) return;
      dragging = false;
      el.style.cursor = '';
      el.style.scrollSnapType = '';
    };
    // Swallow the click that ends a drag so tiles don't navigate
    const click = (e: MouseEvent) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
        moved = false;
      }
    };
    const noDragImg = (e: DragEvent) => e.preventDefault();

    el.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    el.addEventListener('click', click, true);
    el.addEventListener('dragstart', noDragImg);
    return () => {
      el.removeEventListener('scroll', measure);
      ro.disconnect();
      el.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      el.removeEventListener('click', click, true);
      el.removeEventListener('dragstart', noDragImg);
    };
  }, [measure]);

  /** Scroll by one item (first child's width + gap) */
  const step = useCallback((dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const first = el.children[0] as HTMLElement | undefined;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    el.scrollBy({ left: dir * ((first?.offsetWidth ?? el.clientWidth * 0.8) + gap), behavior: 'smooth' });
  }, []);

  return { ref, ...state, step };
}
