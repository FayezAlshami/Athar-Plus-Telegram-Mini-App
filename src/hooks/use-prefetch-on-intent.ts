"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/**
 * Prefetches a route and its query as soon as a card is hovered, touched, or near the viewport.
 * The work runs once per mount.
 */
export function usePrefetchOnIntent(href: string, prefetchData?: () => void) {
  const router = useRouter();
  const ran = useRef(false);
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const prefetchDataRef = useRef(prefetchData);
  prefetchDataRef.current = prefetchData;

  const run = useCallback(() => {
    if (ran.current) return;
    ran.current = true;
    router.prefetch(href);
    prefetchDataRef.current?.();
  }, [href, router]);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) run();
      },
      { rootMargin: "240px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [run]);

  return { ref: nodeRef, onMouseEnter: run, onTouchStart: run };
}
