"use client";

import { motion } from "motion/react";
import { spring } from "@/lib/animation/tokens";
import { useHaptics } from "@/lib/telegram/hooks";
import { cn } from "@/lib/cn";

/** iOS-style switch. The knob follows the inline end when on, so it mirrors in RTL. */
export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  const haptics = useHaptics();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => {
        haptics.impact("soft");
        onChange(!checked);
      }}
      className={cn(
        "flex h-7 w-12 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200",
        checked ? "justify-end bg-accent" : "justify-start bg-border-strong",
      )}
    >
      <motion.span layout transition={spring.interactive} className="size-6 rounded-full bg-white shadow-sm" />
    </button>
  );
}
