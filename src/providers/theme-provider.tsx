"use client";

import { createContext, useCallback, useContext, useEffect, useSyncExternalStore, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { duration } from "@/lib/animation/tokens";
import { THEME_COOKIE } from "@/lib/constants/storage-keys";
import { readCookie, writeCookie } from "@/lib/cookies";
import { track } from "@/lib/analytics/events";
import { useTelegramState } from "@/lib/telegram/telegram-provider";

export type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  /** `origin` is the viewport point the reveal animation expands from. */
  setTheme: (theme: Theme, origin?: { x: number; y: number }) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const CROSSFADE_CLASS = "theme-crossfade";

function currentDocumentTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Circular reveal via the View Transitions API, with a short crossfade fallback. */
function transitionTo(theme: Theme, origin?: { x: number; y: number }) {
  if (prefersReducedMotion()) {
    applyTheme(theme);
    return;
  }

  if (!document.startViewTransition) {
    const root = document.documentElement;
    root.classList.add(CROSSFADE_CLASS);
    applyTheme(theme);
    window.setTimeout(() => root.classList.remove(CROSSFADE_CLASS), duration.normal * 1000);
    return;
  }

  const x = origin?.x ?? window.innerWidth / 2;
  const y = origin?.y ?? 0;
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

  const transition = document.startViewTransition(() => flushSync(() => applyTheme(theme)));
  transition.ready
    .then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: duration.themeReveal * 1000, easing: "cubic-bezier(0.3, 0, 0, 1)", pseudoElement: "::view-transition-new(root)" },
      );
    })
    .catch(() => undefined);
}

/** The <html data-theme> attribute is the single source of truth; React observes it. */
function subscribeToTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore<Theme>(subscribeToTheme, currentDocumentTheme, () => "light");
  const telegram = useTelegramState();

  // Follow Telegram's scheme until the user chooses explicitly.
  useEffect(() => {
    if (telegram.status !== "ready" || readCookie(THEME_COOKIE)) return;
    applyTheme(telegram.adapter.colorScheme);
  }, [telegram]);

  // Keep Telegram's header/background in sync with the brand surfaces.
  useEffect(() => {
    if (telegram.status !== "ready") return;
    const styles = getComputedStyle(document.documentElement);
    const background = styles.getPropertyValue("--background").trim();
    telegram.adapter.setChromeColors({ header: background, background });
  }, [telegram, theme]);

  const setTheme = useCallback((next: Theme, origin?: { x: number; y: number }) => {
    writeCookie(THEME_COOKIE, next);
    transitionTo(next, origin);
    track("theme_changed", { theme: next });
  }, []);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
