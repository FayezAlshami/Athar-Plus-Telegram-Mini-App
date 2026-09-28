"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";

const float = {
  animate: { y: [0, -4, 0], rotate: [0, 2, 0] },
  transition: { duration: 4, repeat: Infinity, ease: "easeInOut" as const },
};

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
