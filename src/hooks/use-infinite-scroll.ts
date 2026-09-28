"use client";

import { useEffect, useRef } from "react";

/** Loads the next page when the sentinel nears the viewport. The button remains the accessible fallback. */
export function useInfiniteScroll(enabled: boolean, isFetching: boolean, onLoadMore: () => void) {
  const ref = useRef<HTMLDivElement | null>(null);
  const callback = useRef(onLoadMore);

  useEffect(() => {
    callback.current = onLoadMore;
  });

  useEffect(() => {
    const node = ref.current;
    if (!node || !enabled || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting) && !isFetching) callback.current();
      },
      { rootMargin: "280px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled, isFetching]);

  return ref;
}
