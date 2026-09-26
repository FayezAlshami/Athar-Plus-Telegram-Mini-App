import type { Transition } from "motion/react";

/** Motion tokens — every animation in the app derives from these values. */
export const duration = {
  instant: 0.12,
  fast: 0.18,
  normal: 0.28,
  slow: 0.42,
  themeReveal: 0.48,
} as const;

export const easing = {
  standard: [0.2, 0, 0, 1],
  emphasized: [0.3, 0, 0, 1],
  exit: [0.4, 0, 1, 1],
} as const;

export const spring = {
  /** Direct manipulation: presses, toggles, indicators. */
  interactive: { type: "spring", stiffness: 520, damping: 34, mass: 0.7 },
  /** Elements entering the screen. */
  entrance: { type: "spring", stiffness: 280, damping: 30, mass: 0.9 },
  /** Soft layout changes. */
  layout: { type: "spring", stiffness: 380, damping: 36 },
} as const satisfies Record<string, Transition>;

export const stagger = {
  list: 0.045,
  grid: 0.035,
} as const;

export const distance = {
  small: 8,
  medium: 16,
  large: 28,
} as const;

export const pressScale = {
  button: 0.97,
  card: 0.985,
} as const;
