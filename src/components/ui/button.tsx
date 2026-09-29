"use client";

import { forwardRef, type ReactNode } from "react";
import { motion, type HTMLMotionProps } from "motion/react";
import { Check, CircleNotch } from "@phosphor-icons/react";
import type { SubmitPhase } from "@/hooks/use-submit-state";
import { pressScale, spring } from "@/lib/animation/tokens";
import { useHaptics } from "@/lib/telegram/hooks";
import type { HapticImpact } from "@/lib/telegram/adapter";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "accent" | "secondary" | "ghost" | "gold" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground shadow-sm",
  accent: "bg-accent text-accent-foreground shadow-sm",
  secondary: "bg-surface-elevated text-foreground border border-border-strong",
  ghost: "bg-transparent text-foreground hover:bg-muted/60",
  gold: "bg-gold text-gold-foreground shadow-sm",
  danger: "bg-danger-soft text-danger",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-[0.8125rem] rounded-sm gap-1.5",
  md: "h-11 px-5 rounded-md gap-2",
  lg: "h-13 px-6 rounded-md gap-2.5 text-base",
};

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  /** Visual phase. `success` is only passed after the server confirms the action. */
  phase?: SubmitPhase;
  fullWidth?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  haptic?: HapticImpact | false;
  children?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    loading = false,
    phase,
    fullWidth = false,
    leadingIcon,
    trailingIcon,
    haptic = false,
    className,
    disabled,
    onClick,
    children,
    type = "button",
    ...props
  },
  ref,
) {
  const haptics = useHaptics();
  const isLoading = loading || phase === "loading";
  const isSuccess = phase === "success";
  const isDisabled = disabled || isLoading || isSuccess;

  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={isLoading || undefined}
      whileTap={isDisabled ? undefined : { scale: pressScale.button }}
      transition={spring.interactive}
      onClick={(event) => {
        if (haptic) haptics.impact(haptic);
        onClick?.(event);
      }}
      className={cn(
        "relative inline-flex select-none items-center justify-center text-button whitespace-nowrap",
        "transition-[background-color,opacity,box-shadow] duration-200 disabled:opacity-50",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      <span className={cn("inline-flex items-center gap-[inherit]", (isLoading || isSuccess) && "invisible")}>
        {leadingIcon}
        {children}
        {trailingIcon}
      </span>
      {isLoading && <CircleNotch aria-hidden className="absolute size-5 animate-spin" weight="bold" />}
      {isSuccess && <Check aria-hidden className="absolute size-5" weight="bold" />}
    </motion.button>
  );
});
