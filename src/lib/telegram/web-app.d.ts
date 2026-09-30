import type { TelegramThemeParams } from "./telegram.types";

/** Minimal typing of the Telegram WebApp surface this app uses. */
export interface TelegramWebAppUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
  is_premium?: boolean;
  allows_write_to_pm?: boolean;
}

export interface TelegramPopupButton {
  id?: string;
  type?: "default" | "ok" | "close" | "cancel" | "destructive";
  text?: string;
}

export interface TelegramBottomButton {
  show(): TelegramBottomButton;
  hide(): TelegramBottomButton;
  enable(): TelegramBottomButton;
  disable(): TelegramBottomButton;
  setText(text: string): TelegramBottomButton;
  onClick(callback: () => void): TelegramBottomButton;
  offClick(callback: () => void): TelegramBottomButton;
  setParams?(params: { text?: string; color?: string; text_color?: string; is_active?: boolean; is_visible?: boolean }): TelegramBottomButton;
}

export interface TelegramDeviceStorage {
  setItem(key: string, value: string, callback?: (error: string | null) => void): void;
  getItem(key: string, callback: (error: string | null, value: string | null) => void): void;
}

export interface TelegramSafeAreaInset {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

type HapticImpactStyle = "light" | "medium" | "heavy" | "rigid" | "soft";
type HapticNotificationType = "error" | "success" | "warning";

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: { user?: TelegramWebAppUser; start_param?: string };
  version: string;
  platform: string;
  colorScheme: "light" | "dark";
  themeParams: TelegramThemeParams;
  viewportStableHeight: number;
  isFullscreen?: boolean;
  isActive?: boolean;
  isClosingConfirmationEnabled?: boolean;
  safeAreaInset?: TelegramSafeAreaInset;
  contentSafeAreaInset?: TelegramSafeAreaInset;
  isVersionAtLeast(version: string): boolean;
  ready(): void;
  expand(): void;
  close(): void;
  requestFullscreen?(): void;
  exitFullscreen?(): void;
  enableClosingConfirmation?(): void;
  disableClosingConfirmation?(): void;
  enableVerticalSwipes?(): void;
  showPopup?(params: { title?: string; message: string; buttons?: TelegramPopupButton[] }, callback?: (id: string) => void): void;
  showAlert?(message: string, callback?: () => void): void;
  showConfirm?(message: string, callback?: (ok: boolean) => void): void;
  requestWriteAccess?(callback?: (granted: boolean) => void): void;
  shareMessage?(messageId: string, callback?: (sent: boolean) => void): void;
  shareToStory?(mediaUrl: string, params?: { text?: string; widget_link?: { url: string; name?: string } }): void;
  hideKeyboard?(): void;
  MainButton?: TelegramBottomButton;
  SecondaryButton?: TelegramBottomButton;
  DeviceStorage?: TelegramDeviceStorage;
  addToHomeScreen?(): void;
  checkHomeScreenStatus?(callback: (status: "unsupported" | "unknown" | "added" | "missed") => void): void;
  setHeaderColor(color: string): void;
  setBackgroundColor(color: string): void;
  setBottomBarColor?(color: string): void;
  disableVerticalSwipes?(): void;
  openLink(url: string, options?: { try_instant_view?: boolean }): void;
  openTelegramLink(url: string): void;
  onEvent(event: string, handler: () => void): void;
  offEvent(event: string, handler: () => void): void;
  BackButton: { show(): void; hide(): void; onClick(cb: () => void): void; offClick(cb: () => void): void };
  HapticFeedback: {
    impactOccurred(style: HapticImpactStyle): void;
    notificationOccurred(type: HapticNotificationType): void;
    selectionChanged(): void;
  };
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}
