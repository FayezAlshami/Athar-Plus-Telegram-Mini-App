import type { TelegramColorScheme, TelegramThemeParams } from "./telegram.types";

const THEME_PARAM_TO_CSS: Record<keyof TelegramThemeParams, string> = {
  bg_color: "--tg-theme-bg-color",
  text_color: "--tg-theme-text-color",
  hint_color: "--tg-theme-hint-color",
  link_color: "--tg-theme-link-color",
  button_color: "--tg-theme-button-color",
  button_text_color: "--tg-theme-button-text-color",
  secondary_bg_color: "--tg-theme-secondary-bg-color",
  header_bg_color: "--tg-theme-header-bg-color",
  accent_text_color: "--tg-theme-accent-text-color",
  section_bg_color: "--tg-theme-section-bg-color",
  section_header_text_color: "--tg-theme-section-header-text-color",
  subtitle_text_color: "--tg-theme-subtitle-text-color",
  destructive_text_color: "--tg-theme-destructive-text-color",
  section_separator_color: "--tg-theme-section-separator-color",
  bottom_bar_bg_color: "--tg-theme-bottom-bar-bg-color",
};

export function normalizeColorScheme(scheme: string | null | undefined): TelegramColorScheme {
  return scheme === "dark" ? "dark" : "light";
}

/**
 * Exposes Telegram themeParams as `--tg-theme-*` only.
 * Athar brand tokens (`--accent`, `--primary`, `--gold`, …) stay untouched.
 */
export function applyTelegramThemeParams(params: TelegramThemeParams | null | undefined): void {
  const root = document.documentElement.style;
  for (const [key, cssVar] of Object.entries(THEME_PARAM_TO_CSS)) {
    const value = params?.[key as keyof TelegramThemeParams];
    if (typeof value === "string" && value.length > 0) {
      root.setProperty(cssVar, value);
    } else {
      root.removeProperty(cssVar);
    }
  }
}

export function fallbackColorScheme(): TelegramColorScheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
