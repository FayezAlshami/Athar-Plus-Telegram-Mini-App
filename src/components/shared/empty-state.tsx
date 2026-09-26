"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { fadeUp } from "@/lib/animation/variants";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  body?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, body, action }: EmptyStateProps) {
  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex flex-col items-center px-6 py-14 text-center">
      <div className="mb-5 flex size-16 items-center justify-center rounded-xl bg-accent-soft text-accent [&_svg]:size-8">{icon}</div>
      <h2 className="text-section-title">{title}</h2>
      {body && <p className="mt-1.5 max-w-[280px] text-small text-muted-foreground">{body}</p>}
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  );
}
