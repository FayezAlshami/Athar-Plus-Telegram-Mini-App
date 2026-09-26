"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { pressScale, spring } from "@/lib/animation/tokens";
import { cn } from "@/lib/cn";

interface CardProps {
  children: ReactNode;
  className?: string;
  /** Renders the card as a pressable link with physical feedback. */
  href?: string;
  elevated?: boolean;
}

const MotionLink = motion.create(Link);

export function Card({ children, className, href, elevated = false }: CardProps) {
  const classes = cn(
    "block rounded-lg border border-border",
    elevated ? "bg-surface-elevated shadow-md" : "bg-surface shadow-sm",
    className,
  );

  if (href) {
    return (
      <MotionLink href={href} className={classes} whileTap={{ scale: pressScale.card }} transition={spring.interactive}>
        {children}
      </MotionLink>
    );
  }

  return <div className={classes}>{children}</div>;
}
