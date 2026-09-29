"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/providers/theme-provider";
import { useTelegramState } from "./telegram-provider";
import type { HomeScreenStatus } from "./adapter";
import type { TelegramColorScheme, TelegramSafeAreas, TelegramThemeParams } from "./telegram.types";
import { createHapticControls } from "./telegram-haptics";
import { resolveSafeAreas, ZERO_INSET } from "./telegram-safe-area";
import { holdClosingConfirmation } from "./telegram-closing-confirmation";
import { fallbackColorScheme } from "./telegram-theme";

/** Safe haptics: silently no-op before readiness, outside Telegram, or with reduced motion. */
export function useHaptics() {
  const state = useTelegramState();
  const adapter = state.status === "ready" ? state.adapter : null;
  return createHapticControls(adapter);
}

export const useTelegramHaptics = useHaptics;

export function useTelegram() {
  return useTelegramState();
}

/**
 * Signals Telegram that the Mini App can be shown. Runs once after the host
 * adapter and Athar theme are initialized and the app shell has mounted.
 */
export function useNotifyTelegramReady() {
  const state = useTelegramState();
  const { theme } = useTheme();

  useEffect(() => {
    if (state.status !== "ready") return;
    state.adapter.notifyReady();
  }, [state, theme]);
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

export function useTelegramTheme(): {
  colorScheme: TelegramColorScheme;
  themeParams: TelegramThemeParams;
  source: "telegram" | "fallback";
} {
  const state = useTelegramState();
  const [colorScheme, setColorScheme] = useState<TelegramColorScheme>(
    state.status === "ready" ? state.adapter.colorScheme : fallbackColorScheme(),
  );
  const [themeParams, setThemeParams] = useState<TelegramThemeParams>(
    state.status === "ready" ? state.adapter.themeParams() : {},
  );

  useEffect(() => {
    if (state.status !== "ready") return;
    const adapter = state.adapter;
    const sync = () => {
      setColorScheme(adapter.colorScheme);
      setThemeParams(adapter.themeParams());
    };
    sync();
    return adapter.onThemeChange(sync);
  }, [state]);

  return {
    colorScheme,
    themeParams,
    source: state.status === "ready" && state.adapter.kind === "telegram" ? "telegram" : "fallback",
  };
}

export function useTelegramSafeArea(): TelegramSafeAreas & { isFullscreen: boolean } {
  const state = useTelegramState();
  const empty = { ...resolveSafeAreas(ZERO_INSET, ZERO_INSET), isFullscreen: false };
  const [areas, setAreas] = useState(empty);

  useEffect(() => {
    if (state.status !== "ready") return;
    const adapter = state.adapter;
    const sync = () => {
      setAreas({
        ...resolveSafeAreas(adapter.deviceSafeArea(), adapter.contentSafeArea()),
        isFullscreen: adapter.isFullscreen(),
      });
    };
    sync();
    return adapter.onViewportChange(sync);
  }, [state]);

  return areas;
}

/**
 * Extra native close (X) protection for a screen or sheet. The Telegram host
 * already keeps a session guard; release after success, cancel, or unmount.
 */
export function useTelegramClosingConfirmation(isDirty: boolean) {
  const state = useTelegramState();

  useEffect(() => {
    if (state.status !== "ready") return holdClosingConfirmation(false);
    return holdClosingConfirmation(isDirty);
  }, [state, isDirty]);
}
