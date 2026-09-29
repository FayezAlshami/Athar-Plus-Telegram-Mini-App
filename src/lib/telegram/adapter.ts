import type { TelegramSafeAreaInset, TelegramWebAppUser } from "./web-app";

export type HapticImpact = "light" | "medium" | "heavy" | "soft" | "rigid";
export type HapticNotice = "success" | "warning" | "error";

/**
 * Everything the app needs from its host. Components depend on this
 * interface only, so the app runs identically inside Telegram and in a
 * development browser.
 */
export interface TelegramAdapter {
  readonly kind: "telegram" | "mock";
  readonly platform: string;
  /** Raw signed initData — the only value sent to the backend for auth. */
  readonly initData: string;
  /** Display-only; never used for authorization. */
  readonly user: TelegramWebAppUser | null;
  readonly startParam: string | null;
  readonly colorScheme: "light" | "dark";

  ready(): void;
  setChromeColors(colors: { header: string; background: string }): void;
  safeAreaInsets(): TelegramSafeAreaInset;
  viewportHeight(): number | null;
  onViewportChange(handler: () => void): () => void;

  showBackButton(onClick: () => void): () => void;
  hideBackButton(): void;

  impact(style?: HapticImpact): void;
  notify(type: HapticNotice): void;
  selection(): void;

  openLink(url: string): void;
  openTelegramLink(url: string): void;
  close(): void;

  /** Bot API 8.0 home-screen shortcut. `unsupported` outside mobile Telegram. */
  checkHomeScreenStatus(): Promise<HomeScreenStatus>;
  addToHomeScreen(): void;
  onHomeScreenAdded(handler: () => void): () => void;
}

export type HomeScreenStatus = "unsupported" | "unknown" | "added" | "missed";
