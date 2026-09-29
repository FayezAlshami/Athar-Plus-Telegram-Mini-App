"use client";

import { createContext, useContext, useEffect, useSyncExternalStore, type ReactNode } from "react";
import type { TelegramAdapter } from "./adapter";
import { resolveTelegramAdapter } from "./resolve-adapter";
import { applyCssVariables, resolveSafeAreas, safeAreaCssVariables } from "./telegram-safe-area";
import { bindClosingConfirmationHost, holdClosingConfirmation } from "./telegram-closing-confirmation";
import { applyTelegramThemeParams } from "./telegram-theme";

type TelegramState = { status: "loading" } | { status: "unavailable" } | { status: "ready"; adapter: TelegramAdapter };

const TelegramContext = createContext<TelegramState>({ status: "loading" });

// The host environment never changes during a session, so it is resolved once.
let resolvedAdapter: TelegramAdapter | null | undefined;
const LOADING: TelegramState = { status: "loading" };
let snapshot: TelegramState = LOADING;

function getSnapshot(): TelegramState {
  if (resolvedAdapter === undefined) {
    resolvedAdapter = resolveTelegramAdapter();
    snapshot = resolvedAdapter ? { status: "ready", adapter: resolvedAdapter } : { status: "unavailable" };
  }
  return snapshot;
}

const subscribe = () => () => undefined;
const getServerSnapshot = () => LOADING;

function applyHostChrome(adapter: TelegramAdapter) {
  applyCssVariables(
    safeAreaCssVariables(
      resolveSafeAreas(adapter.deviceSafeArea(), adapter.contentSafeArea()),
      adapter.viewportHeight(),
    ),
  );
  applyTelegramThemeParams(adapter.themeParams());
}

export function TelegramProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    if (state.status !== "ready") return;
    const adapter = state.adapter;
    adapter.notifyReady();
    adapter.ready();
    bindClosingConfirmationHost(adapter);
    const releaseSessionGuard =
      adapter.kind === "telegram" ? holdClosingConfirmation(true) : holdClosingConfirmation(false);
    applyHostChrome(adapter);
    adapter.requestFullscreen();
    const stopViewport = adapter.onViewportChange(() => applyHostChrome(adapter));
    const stopTheme = adapter.onThemeChange(() => applyTelegramThemeParams(adapter.themeParams()));
    return () => {
      releaseSessionGuard();
      bindClosingConfirmationHost(null);
      stopViewport();
      stopTheme();
    };
  }, [state]);

  return <TelegramContext.Provider value={state}>{children}</TelegramContext.Provider>;
}

export function useTelegramState(): TelegramState {
  return useContext(TelegramContext);
}
