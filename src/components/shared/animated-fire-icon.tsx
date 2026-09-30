"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";

/** Looping flame for section headers (vector, sharp at 2x/3x). */
export function AnimatedFireIcon({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const uid = useId().replace(/:/g, "");
  const gradA = `fire-a-${uid}`;
  const gradB = `fire-b-${uid}`;
  const glow = `fire-glow-${uid}`;

  return (
    <motion.span
      className={cn("relative inline-flex size-7 shrink-0", className)}
      aria-hidden
      animate={reduce ? undefined : { scale: [1, 1.05, 1], rotate: [-1.5, 1.5, -1.5] }}
      transition={{ duration: 1.35, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg viewBox="0 0 48 48" className="size-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={gradA} x1="24" y1="44" x2="24" y2="6" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FF5A1F" />
            <stop offset="0.45" stopColor="#FF9F1C" />
            <stop offset="1" stopColor="#FFE08A" />
          </linearGradient>
          <linearGradient id={gradB} x1="24" y1="40" x2="24" y2="12" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FF7A18" />
            <stop offset="1" stopColor="#FFD166" />
          </linearGradient>
          <filter id={glow} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <motion.path
          filter={`url(#${glow})`}
          d="M24 6c-2 6-8 8-10 14-1.5 4.5 0 9 4 12.5 2.5 2.2 5.5 3.5 6 3.5s3.5-1.3 6-3.5c4-3.5 5.5-8 4-12.5C28 14 26 12 24 6Z"
          fill={`url(#${gradA})`}
          animate={reduce ? undefined : { d: ["M24 6c-2 6-8 8-10 14-1.5 4.5 0 9 4 12.5 2.5 2.2 5.5 3.5 6 3.5s3.5-1.3 6-3.5c4-3.5 5.5-8 4-12.5C28 14 26 12 24 6Z", "M24 7c-1.5 5.5-7.5 7.5-9.5 13.5-1.2 4.2 0.2 8.5 3.8 11.8 2.2 2 4.8 3.2 5.7 3.2s3.5-1.2 5.7-3.2c3.6-3.3 5-7.6 3.8-11.8C31.5 14.5 29.5 12.5 24 7Z", "M24 6c-2 6-8 8-10 14-1.5 4.5 0 9 4 12.5 2.5 2.2 5.5 3.5 6 3.5s3.5-1.3 6-3.5c4-3.5 5.5-8 4-12.5C28 14 26 12 24 6Z"] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
          d="M24 18c-1.5 3.5-4.5 4.5-5.5 8-.8 2.8 0.2 5.5 2.8 7.5 1.6 1.3 3.5 2 4.7 2s3.1-0.7 4.7-2c2.6-2 3.6-4.7 2.8-7.5-1-3.5-4-4.5-5.5-8Z"
          fill={`url(#${gradB})`}
          animate={reduce ? undefined : { opacity: [0.85, 1, 0.85], scale: [1, 1.04, 1] }}
          transition={{ duration: 0.85, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "24px 32px" }}
        />
      </svg>
    </motion.span>
  );
}
