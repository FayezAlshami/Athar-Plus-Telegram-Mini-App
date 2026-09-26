"use client";

import { useEffect, useRef } from "react";
import { useTelegramState } from "./telegram-provider";
import type { HapticImpact, HapticNotice } from "./adapter";

/** Safe haptics: silently no-op before readiness or outside Telegram. */
export function useHaptics() {
  const state = useTelegramState();
  const adapter = state.status === "ready" ? state.adapter : null;

  return {
    impact: (style: HapticImpact = "light") => adapter?.impact(style),
    notify: (type: HapticNotice) => adapter?.notify(type),
    selection: () => adapter?.selection(),
  };
}

/** Shows Telegram's native back button while `enabled`. */
export function useTelegramBackButton(enabled: boolean, onBack: () => void) {
  const state = useTelegramState();
  const onBackRef = useRef(onBack);

  useEffect(() => {
    onBackRef.current = onBack;
  });

  useEffect(() => {
    if (state.status !== "ready") return;
    const adapter = state.adapter;
    if (!enabled) {
      adapter.hideBackButton();
      return;
    }
    const detach = adapter.showBackButton(() => onBackRef.current());
    return () => {
      detach();
      adapter.hideBackButton();
    };
  }, [state, enabled]);
}
