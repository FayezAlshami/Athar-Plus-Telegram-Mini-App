import type { TelegramSafeAreaInset, TelegramWebAppUser } from "./web-app";
import type {
  HapticImpact,
  HapticNotice,
  HomeScreenStatus,
  TelegramColorScheme,
  TelegramThemeParams,
} from "./telegram.types";

export type { HapticImpact, HapticNotice, HomeScreenStatus };

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
  readonly colorScheme: TelegramColorScheme;

  ready(): void;
  /** `WebApp.ready()` — once, after theme and the app shell can be displayed. */
  notifyReady(): void;
  setChromeColors(colors: { header: string; background: string }): void;
  themeParams(): TelegramThemeParams;
  onThemeChange(handler: () => void): () => void;

  deviceSafeArea(): TelegramSafeAreaInset;
  contentSafeArea(): TelegramSafeAreaInset;
  safeAreaInsets(): TelegramSafeAreaInset;
  viewportHeight(): number | null;
  isFullscreen(): boolean;
  requestFullscreen(): void;
  onViewportChange(handler: () => void): () => void;

  showBackButton(onClick: () => void): () => void;
  hideBackButton(): void;

  impact(style?: HapticImpact): void;
  notify(type: HapticNotice): void;
  selection(): void;

  enableClosingConfirmation(): void;
  disableClosingConfirmation(): void;

  openLink(url: string): void;
  openTelegramLink(url: string): void;
  close(): void;

  /** Bot API 8.0 home-screen shortcut. `unsupported` outside mobile Telegram. */
  checkHomeScreenStatus(): Promise<HomeScreenStatus>;
  addToHomeScreen(): void;
  onHomeScreenAdded(handler: () => void): () => void;
}
