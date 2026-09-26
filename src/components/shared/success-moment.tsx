"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { spring } from "@/lib/animation/tokens";
import { ButterflyMark } from "./butterfly";
import { AnimatedWords } from "./animated-words";

/** The branded success beat: butterfly lift + word reveal. Used for meaningful completions only. */
export function SuccessMoment({ title, body, actions }: { title: string; body?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-col items-center py-6 text-center">
      <motion.div
        initial={{ scale: 0.4, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={spring.entrance}
        className="relative mb-5 flex size-20 items-center justify-center rounded-full bg-accent-soft text-accent"
      >
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full border border-accent/40"
          initial={{ scale: 1, opacity: 0.8 }}
          animate={{ scale: 1.6, opacity: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
        <ButterflyMark animated className="size-11" />
      </motion.div>
      <AnimatedWords as="h2" text={title} className="text-page-title" />
      {body && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-2 max-w-[300px] text-small text-muted-foreground">
          {body}
        </motion.p>
      )}
      {actions && <div className="mt-6 flex w-full flex-col gap-2">{actions}</div>}
    </div>
  );
}
