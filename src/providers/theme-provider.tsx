"use client";

import { createContext, useCallback, useContext, useEffect, useSyncExternalStore, type ReactNode } from "react";
import { THEME_COOKIE } from "@/lib/constants/storage-keys";
import { readCookie, writeCookie } from "@/lib/cookies";
import { track } from "@/lib/analytics/events";
import { useTelegramState } from "@/lib/telegram/telegram-provider";
import { normalizeColorScheme } from "@/lib/telegram/telegram-theme";

export type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function currentDocumentTheme(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

/** The `dark` class on <html> is the source of truth; colors crossfade in CSS. */
function subscribeToTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore<Theme>(subscribeToTheme, currentDocumentTheme, () => "light");
  const telegram = useTelegramState();

  // Follow Telegram's scheme until the user chooses explicitly.
  useEffect(() => {
    if (telegram.status !== "ready") return;
    const adapter = telegram.adapter;
    const followHost = () => {
      if (readCookie(THEME_COOKIE)) return;
      applyTheme(normalizeColorScheme(adapter.colorScheme));
    };
    followHost();
    return adapter.onThemeChange(followHost);
  }, [telegram]);

  // Keep Telegram's header/background in sync with the brand surfaces.
  useEffect(() => {
    if (telegram.status !== "ready") return;
    const styles = getComputedStyle(document.documentElement);
    const background = styles.getPropertyValue("--background").trim();
    telegram.adapter.setChromeColors({ header: background, background });
  }, [telegram, theme]);

  const setTheme = useCallback((next: Theme) => {
    writeCookie(THEME_COOKIE, next);
    applyTheme(next);
    track("theme_changed", { theme: next });
  }, []);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
