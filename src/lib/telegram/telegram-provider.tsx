"use client";

import { createContext, useContext, useEffect, useSyncExternalStore, type ReactNode } from "react";
import type { TelegramAdapter } from "./adapter";
import { resolveTelegramAdapter } from "./resolve-adapter";

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

function applyViewportVariables(adapter: TelegramAdapter) {
  const root = document.documentElement.style;
  const insets = adapter.safeAreaInsets();
  const height = adapter.viewportHeight();

  root.setProperty("--safe-top", `max(env(safe-area-inset-top, 0px), ${insets.top}px)`);
  root.setProperty("--safe-bottom", `max(env(safe-area-inset-bottom, 0px), ${insets.bottom}px)`);
  root.setProperty("--app-height", height ? `${height}px` : "100dvh");
}

export function TelegramProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    if (state.status !== "ready") return;
    const adapter = state.adapter;
    adapter.ready();
    applyViewportVariables(adapter);
    return adapter.onViewportChange(() => applyViewportVariables(adapter));
  }, [state]);

  return <TelegramContext.Provider value={state}>{children}</TelegramContext.Provider>;
}

export function useTelegramState(): TelegramState {
  return useContext(TelegramContext);
}
