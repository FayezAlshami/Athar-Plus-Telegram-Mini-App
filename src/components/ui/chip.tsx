"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { spring } from "@/lib/animation/tokens";
import { useHaptics } from "@/lib/telegram/hooks";
import { cn } from "@/lib/cn";

interface ChipProps {
  selected?: boolean;
  onClick?: () => void;
  icon?: ReactNode;
  children: ReactNode;
}

export function Chip({ selected = false, onClick, icon, children }: ChipProps) {
  const haptics = useHaptics();
  return (
    <motion.button
      type="button"
      aria-pressed={selected}
      whileTap={{ scale: 0.95 }}
      transition={spring.interactive}
      onClick={() => {
        haptics.selection();
        onClick?.();
      }}
      className={cn(
        "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-small font-medium transition-colors duration-200 [&_svg]:size-4",
        selected ? "border-transparent bg-primary text-primary-foreground" : "border-border-strong bg-surface text-foreground",
      )}
    >
      {icon}
      {children}
    </motion.button>
  );
}
