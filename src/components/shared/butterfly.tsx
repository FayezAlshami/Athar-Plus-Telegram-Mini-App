"use client";

import { motion } from "motion/react";
import { easing } from "@/lib/animation/tokens";
import { cn } from "@/lib/cn";

/** Athar butterfly motif — simplified geometric mark used sparingly. */
export function ButterflyMark({ className, animated = false }: { className?: string; animated?: boolean }) {
  const wing = animated
    ? { animate: { scaleX: [1, 0.72, 1] }, transition: { duration: 0.9, ease: easing.standard, repeat: 1 } }
    : {};

  return (
    <svg viewBox="0 0 64 64" aria-hidden className={cn("size-10", className)} fill="none">
      <motion.g style={{ originX: "32px", originY: "32px" }} {...wing}>
        <path d="M31 30C27 18 17 10 8 12c-6 2-4 14 4 19 5 3 12 3 19-1Z" fill="currentColor" opacity="0.9" />
        <path d="M31 34c-6-2-14 0-17 6-3 7 3 12 9 9 5-3 8-9 8-15Z" fill="currentColor" opacity="0.6" />
        <path d="M33 30c4-12 14-20 23-18 6 2 4 14-4 19-5 3-12 3-19-1Z" fill="currentColor" opacity="0.9" />
        <path d="M33 34c6-2 14 0 17 6 3 7-3 12-9 9-5-3-8-9-8-15Z" fill="currentColor" opacity="0.6" />
      </motion.g>
      <rect x="31" y="22" width="2" height="22" rx="1" fill="currentColor" />
    </svg>
  );
}
