"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";

const FLIGHT_S = 5.2;
const FLAP_S = 0.36;

function Wings({ side, flap }: { side: "left" | "right"; flap: boolean }) {
  const isLeft = side === "left";
  return (
    <motion.g
      style={{ originX: isLeft ? "31px" : "33px", originY: "32px" }}
      animate={flap ? { scaleX: [1, 0.22, 1], skewY: isLeft ? [0, 6, 0] : [0, -6, 0] } : undefined}
      transition={flap ? { duration: FLAP_S, repeat: Infinity, ease: "easeInOut" } : undefined}
    >
      {isLeft ? (
        <>
          <path d="M31 30C27 18 17 10 8 12c-6 2-4 14 4 19 5 3 12 3 19-1Z" fill="url(#bf-upper)" />
          <path d="M31 34c-6-2-14 0-17 6-3 7 3 12 9 9 5-3 8-9 8-15Z" fill="url(#bf-lower)" />
          <circle cx="15" cy="19" r="2.2" fill="var(--color-background)" opacity="0.55" />
        </>
      ) : (
        <>
          <path d="M33 30c4-12 14-20 23-18 6 2 4 14-4 19-5 3-12 3-19-1Z" fill="url(#bf-upper)" />
          <path d="M33 34c6-2 14 0 17 6 3 7-3 12-9 9-5-3-8-9-8-15Z" fill="url(#bf-lower)" />
          <circle cx="49" cy="19" r="2.2" fill="var(--color-background)" opacity="0.55" />
        </>
      )}
    </motion.g>
  );
}

/** Flying Athar butterfly used as the app intro / loading indicator. */
export function ButterflyLoader({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const fly = !reduce;

  return (
    <div className={cn("relative flex h-36 w-48 items-center justify-center", className)} aria-hidden>
      <motion.div
        className="absolute size-24 rounded-full bg-accent/20 blur-2xl"
        animate={fly ? { scale: [0.9, 1.15, 0.9], opacity: [0.5, 0.9, 0.5] } : undefined}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute bottom-2 h-2 w-12 rounded-full bg-foreground/10 blur-[2px]"
        animate={fly ? { x: [0, 26, 0, -26, 0], scaleX: [1, 0.7, 1, 0.7, 1], opacity: [0.7, 0.35, 0.7, 0.35, 0.7] } : undefined}
        transition={{ duration: FLIGHT_S, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="relative"
        animate={
          fly
            ? {
                x: [0, 26, 0, -26, 0],
                y: [0, -16, -4, -16, 0],
                rotate: [0, 10, 0, -10, 0],
              }
            : undefined
        }
        transition={{ duration: FLIGHT_S, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.div
          animate={fly ? { y: [0, -3, 0] } : undefined}
          transition={{ duration: FLAP_S, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg viewBox="0 0 64 64" className="size-20 drop-shadow-[0_6px_14px_rgba(15,118,110,0.25)]" fill="none">
            <defs>
              <linearGradient id="bf-upper" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--color-accent)" />
                <stop offset="100%" stopColor="var(--color-primary)" />
              </linearGradient>
              <linearGradient id="bf-lower" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.55" />
                <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.85" />
              </linearGradient>
            </defs>
            <Wings side="left" flap={fly} />
            <Wings side="right" flap={fly} />
            <rect x="31" y="22" width="2" height="22" rx="1" fill="var(--color-primary)" />
            <path d="M31.5 22.5c-1-3-3-5-5-6M32.5 22.5c1-3 3-5 5-6" stroke="var(--color-primary)" strokeWidth="0.9" strokeLinecap="round" />
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
}
