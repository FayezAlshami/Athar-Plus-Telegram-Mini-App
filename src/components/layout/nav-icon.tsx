"use client";

import { motion, useReducedMotion } from "motion/react";
import type { PrimaryDestination } from "./navigation";
import { cn } from "@/lib/cn";

export function NavIcon({ icon: Icon, active }: { icon: PrimaryDestination["icon"]; active: boolean }) {
  const reduce = useReducedMotion();

  return (
    <motion.span
      className="inline-flex"
      animate={active && !reduce ? { y: [0, -1.5, 0], scale: [1, 1.06, 1] } : { y: 0, scale: 1 }}
      transition={active && !reduce ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }}
    >
      <Icon
        size={24}
        variant={active ? "Bold" : "Outline"}
        color="currentColor"
        className={cn("transition-colors duration-200", active ? "text-accent" : "text-muted-foreground")}
      />
    </motion.span>
  );
}
