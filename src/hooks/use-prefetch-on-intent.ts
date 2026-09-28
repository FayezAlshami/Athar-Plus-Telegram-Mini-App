"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/**
 * Prefetches a route and its query as soon as a card is hovered, touched, or near the viewport.
 * The work runs once per mount. `ref` is a callback ref, so it can go on any element type.
 */
export function usePrefetchOnIntent<E extends HTMLElement = HTMLDivElement>(href: string, prefetchData?: () => void) {
  const router = useRouter();
  const ran = useRef(false);
  const prefetchDataRef = useRef(prefetchData);

  useEffect(() => {
    prefetchDataRef.current = prefetchData;
  });

  const run = useCallback(() => {
    if (ran.current) return;
    ran.current = true;
    router.prefetch(href);
    prefetchDataRef.current?.();
  }, [href, router]);

  const ref = useCallback(
    (node: E | null) => {
      if (!node || typeof IntersectionObserver === "undefined") return;
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            run();
            observer.disconnect();
          }
        },
        { rootMargin: "240px" },
      );
      observer.observe(node);
      return () => observer.disconnect();
    },
    [run],
  );

  return { ref, onMouseEnter: run, onTouchStart: run };
}
