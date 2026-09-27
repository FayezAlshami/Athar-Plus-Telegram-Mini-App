"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { Crown } from "@phosphor-icons/react";
import { ButterflyMark } from "@/components/shared/butterfly";

const SHINE_INTERVAL_SECONDS = 5;

/** The premium surface: restrained gold on deep warm dark, with a slow, subtle shine. */
export function PlusCard({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-[image:var(--plus-gradient)] p-5 text-on-plus shadow-lg">
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        initial={{ x: "-150%" }}
        animate={{ x: "400%" }}
        transition={{ duration: 1.8, ease: "easeInOut", repeat: Infinity, repeatDelay: SHINE_INTERVAL_SECONDS }}
      />
      <ButterflyMark className="pointer-events-none absolute -bottom-6 -end-6 size-36 text-gold/10" />
      <div className="relative flex items-center gap-2 text-gold">
        <Crown weight="fill" className="size-5" />
        <span className="font-display text-lg font-semibold">{title}</span>
      </div>
      {children && <div className="relative mt-2">{children}</div>}
    </div>
  );
}
