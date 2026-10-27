import { useEffect } from 'react';

/**
 * Touch devices have no hover, so hover-driven motion would never play.
 * On `(hover: none)` screens this marks every `[data-touch-hover]` element with
 * `data-inview` while it sits in the middle band of the viewport; CSS variants
 * (`inview:` / `group-inview:` in index.css) replay the hover styling from it.
 */
export function useTouchInView() {
  useEffect(() => {
    if (!window.matchMedia('(hover: none)').matches) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const el = e.target as HTMLElement;
          if (e.isIntersecting) el.dataset.inview = 'true';
          else delete el.dataset.inview;
        }
      },
      { rootMargin: '-30% 0px -30% 0px' },
    );

    const seen = new WeakSet<Element>();
    const scan = (root: ParentNode) => {
      root.querySelectorAll('[data-touch-hover]').forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        io.observe(el);
      });
    };
    scan(document);

    const mo = new MutationObserver((records) => {
      for (const r of records) r.addedNodes.forEach((n) => n instanceof HTMLElement && scan(n.parentNode ?? n));
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);
}
