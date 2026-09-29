"use client";

import { useEffect, useRef, useState } from "react";
import { useTelegramState } from "./telegram-provider";
import type { HapticImpact, HapticNotice, HomeScreenStatus } from "./adapter";

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

/** Home-screen shortcut availability for the current Telegram client. */
export function useHomeScreenShortcut() {
  const state = useTelegramState();
  const [status, setStatus] = useState<HomeScreenStatus | "checking">("checking");

  useEffect(() => {
    if (state.status !== "ready") return;
    const adapter = state.adapter;
    let cancelled = false;
    adapter.checkHomeScreenStatus().then((next) => {
      if (!cancelled) setStatus(next);
    });
    const detach = adapter.onHomeScreenAdded(() => setStatus("added"));
    return () => {
      cancelled = true;
      detach();
    };
  }, [state]);

  const add = () => {
    if (state.status !== "ready") return;
    state.adapter.addToHomeScreen();
  };

  return { status, add };
}
