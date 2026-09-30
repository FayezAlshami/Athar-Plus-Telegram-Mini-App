"use client";

import { useLayoutEffect, type RefObject } from "react";

// Fixed bars (bottom nav, sticky CTA) report their height so page padding,
// the back-to-top button and banners clear them without hard-coded offsets.
const insets = new Map<symbol, number>();

function publish() {
  const tallest = insets.size ? Math.max(...insets.values()) : 0;
  document.documentElement.style.setProperty("--bottom-inset", `${tallest}px`);
}

/** Publishes the element's height as `--bottom-inset` while mounted and `enabled`. */
export function useFixedBottomInset(ref: RefObject<HTMLElement | null>, enabled = true) {
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node || !enabled) return;
    const key = Symbol("bottom-inset");
    const measure = () => {
      insets.set(key, node.offsetHeight);
      publish();
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => {
      observer.disconnect();
      insets.delete(key);
      publish();
    };
  }, [ref, enabled]);
}
