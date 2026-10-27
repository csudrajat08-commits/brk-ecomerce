import type { MouseEvent } from 'react';

/**
 * Click handler for product links: a plain click opens the Quick View (the
 * add-to-bag panel) instead of navigating; modified clicks (new tab/window)
 * keep the normal link behaviour.
 */
export function quickViewClick(open: () => void) {
  return (e: MouseEvent) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    open();
  };
}
