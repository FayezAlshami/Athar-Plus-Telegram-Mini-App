import type { Variants } from "motion/react";
import { distance, duration, easing, spring, stagger } from "./tokens";

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: distance.medium },
  visible: { opacity: 1, y: 0, transition: spring.entrance },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: duration.normal, ease: easing.standard } },
};

export const listContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: stagger.list } },
};

export const gridContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: stagger.grid } },
};

export const pageTransition: Variants = {
  initial: { opacity: 0, y: distance.small },
  enter: { opacity: 1, y: 0, transition: { duration: duration.normal, ease: easing.emphasized } },
};
