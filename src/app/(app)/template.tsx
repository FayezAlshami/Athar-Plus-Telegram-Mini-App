"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { pageTransition } from "@/lib/animation/variants";

/** Re-mounts per navigation, giving every route a short connected entrance. */
export default function RouteTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div variants={pageTransition} initial="initial" animate="enter">
      {children}
    </motion.div>
  );
}
