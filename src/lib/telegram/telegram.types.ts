import type { TelegramSafeAreaInset, TelegramWebAppUser } from "./web-app";

export type { TelegramSafeAreaInset, TelegramWebAppUser };

export type TelegramColorScheme = "light" | "dark";
export type HapticImpact = "light" | "medium" | "heavy" | "soft" | "rigid";
export type HapticNotice = "success" | "warning" | "error";
export type HomeScreenStatus = "unsupported" | "unknown" | "added" | "missed";
export type FullscreenAttempt = "entered" | "failed" | "unsupported";

/** Telegram themeParams — chrome only, never Athar brand tokens. */
export interface TelegramThemeParams {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  secondary_bg_color?: string;
  header_bg_color?: string;
  accent_text_color?: string;
  section_bg_color?: string;
  section_header_text_color?: string;
  subtitle_text_color?: string;
  destructive_text_color?: string;
  section_separator_color?: string;
  bottom_bar_bg_color?: string;
}

export interface TelegramSafeAreas {
  device: TelegramSafeAreaInset;
  content: TelegramSafeAreaInset;
  combined: TelegramSafeAreaInset;
}
