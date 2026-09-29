import type { HapticImpact, HapticNotice } from "./telegram.types";

export interface HapticHost {
  impact(style?: HapticImpact): void;
  notify(type: HapticNotice): void;
  selection(): void;
}

export function hapticsAllowed(): boolean {
  if (typeof window === "undefined") return false;
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** No-op when Telegram is missing, reduced motion is on, or the client is too old. */
export function createHapticControls(host: HapticHost | null): HapticHost {
  return {
    impact: (style: HapticImpact = "light") => {
      if (hapticsAllowed()) host?.impact(style);
    },
    notify: (type: HapticNotice) => {
      if (hapticsAllowed()) host?.notify(type);
    },
    selection: () => {
      if (hapticsAllowed()) host?.selection();
    },
  };
}
