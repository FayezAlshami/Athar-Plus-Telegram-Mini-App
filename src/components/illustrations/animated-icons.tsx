"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";

const float = {
  animate: { y: [0, -4, 0], rotate: [0, 2, 0] },
  transition: { duration: 4, repeat: Infinity, ease: "easeInOut" as const },
};

/** Soft orbit accent for hero sections. */
export function AnimatedOrbitAccent({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.svg
      aria-hidden
      viewBox="0 0 120 120"
      className={cn("pointer-events-none text-accent/35", className)}
      animate={reduce ? undefined : { rotate: 360 }}
      transition={reduce ? undefined : { duration: 28, repeat: Infinity, ease: "linear" }}
    >
      <circle cx="60" cy="60" r="44" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 10" />
      <motion.circle cx="60" cy="16" r="5" fill="currentColor" animate={reduce ? undefined : float.animate} transition={float.transition} />
    </motion.svg>
  );
}

/** Empty favorites illustration. */
export function AnimatedHeartEmpty({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.svg aria-hidden viewBox="0 0 64 64" className={cn("text-accent", className)} animate={reduce ? undefined : float.animate} transition={float.transition}>
      <path
        d="M32 54s-18-11-18-26c0-7 5-12 12-12 4 0 6 2 6 2s2-2 6-2c7 0 12 5 12 12 0 15-18 26-18 26z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <motion.path
        d="M22 22c2-3 6-4 10-2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        animate={reduce ? undefined : { pathLength: [0.2, 1, 0.2] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.svg>
  );
}

/** Heart icon with a short pulse when saved. */
export function AnimatedHeartIcon({ filled, pulsing }: { filled: boolean; pulsing?: boolean }) {
  const reduce = useReducedMotion();
  return (
    <motion.svg aria-hidden viewBox="0 0 24 24" className="size-5" animate={pulsing && !reduce ? { scale: [1, 1.22, 1] } : undefined} transition={{ duration: 0.35 }}>
      <path
        d="M12 20.5s-6.5-4.2-6.5-9.4C5.5 7.6 8.4 5 12 5c1.6 0 2.9.7 3.8 1.6.9-.9 2.2-1.6 3.8-1.6 3.6 0 6.5 2.6 6.5 6.1 0 5.2-6.5 9.4-6.5 9.4z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </motion.svg>
  );
}
