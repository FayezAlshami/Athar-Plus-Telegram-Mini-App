"use client";

import { forwardRef, type ReactNode } from "react";
import { motion, type HTMLMotionProps } from "motion/react";
import { spring } from "@/lib/animation/tokens";
import { useHaptics } from "@/lib/telegram/hooks";
import { cn } from "@/lib/cn";

interface IconButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  /** Required: icon-only controls must be named for screen readers. */
  label: string;
  icon: ReactNode;
  variant?: "surface" | "ghost";
  badge?: number;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, icon, variant = "surface", badge, className, onClick, type = "button", ...props },
  ref,
) {
  const haptics = useHaptics();

  return (
    <motion.button
      ref={ref}
      type={type}
      aria-label={label}
      whileTap={{ scale: 0.92 }}
      transition={spring.interactive}
      onClick={(event) => {
        haptics.selection();
        onClick?.(event);
      }}
      className={cn(
        "relative inline-flex size-11 shrink-0 items-center justify-center rounded-full text-foreground",
        "transition-colors duration-200 disabled:opacity-40 [&_svg]:size-[22px]",
        variant === "surface" ? "bg-surface-elevated border border-border shadow-sm" : "hover:bg-muted/60",
        className,
      )}
      {...props}
    >
      {icon}
      {badge ? (
        <span className="absolute -top-0.5 -end-0.5 min-w-[18px] h-[18px] rounded-full bg-accent px-1 text-[10px] font-semibold leading-[18px] text-accent-foreground">
          {badge > 9 ? "9+" : badge}
        </span>
      ) : null}
    </motion.button>
  );
});
