import type { TelegramAdapter } from "./adapter";
import type { TelegramThemeParams } from "./telegram.types";
import { deviceGet, deviceSet } from "./telegram-device-store";
import { notifyTelegramReady } from "./telegram-ready";
import { ZERO_INSET } from "./telegram-safe-area";
import { fallbackColorScheme } from "./telegram-theme";
import type { TelegramWebAppUser } from "./web-app";

/**
 * DEVELOPMENT ONLY. Emulates Telegram in a normal browser. The backend accepts
 * this identity only through /auth/development, which is disabled outside a
 * local environment.
 */
export const MOCK_TELEGRAM_USER: TelegramWebAppUser = {
  id: 100000001,
  first_name: "Athar",
  last_name: "Tester",
  username: "athar_dev",
  language_code: "ar",
};

export class MockTelegramAdapter implements TelegramAdapter {
  readonly kind = "mock" as const;
  readonly platform = "browser";
  readonly initData = "";
  readonly user = MOCK_TELEGRAM_USER;
  readonly startParam: string | null;
  readonly colorScheme: "light" | "dark";

  constructor() {
    const params = new URLSearchParams(window.location.search);
    this.startParam = params.get("startapp");
    this.colorScheme = fallbackColorScheme();
  }

  ready() {}
  notifyReady() {
    notifyTelegramReady(null);
  }
  setChromeColors() {}
  themeParams(): TelegramThemeParams {
    return {};
  }
  onThemeChange() {
    return () => undefined;
  }
  deviceSafeArea() {
    return ZERO_INSET;
  }
  contentSafeArea() {
    return ZERO_INSET;
  }
  safeAreaInsets() {
    return ZERO_INSET;
  }
  viewportHeight() {
    return null;
  }
  isFullscreen() {
    return false;
  }
  requestFullscreen() {}
  onViewportChange(handler: () => void) {
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }
  showBackButton() {
    return () => undefined;
  }
  hideBackButton() {}
  impact() {}
  notify() {}
  selection() {}
  enableClosingConfirmation() {}
  disableClosingConfirmation() {}
  showAlert(message: string) {
    window.alert(message);
    return Promise.resolve();
  }
  showConfirm(message: string) {
    return Promise.resolve(window.confirm(message));
  }
  hasNativeDialogs() {
    return false;
  }
  hasBottomButtons() {
    return false;
  }
  setMainButton() {
    return () => undefined;
  }
  setSecondaryButton() {
    return () => undefined;
  }
  allowsWriteToPm() {
    return true;
  }
  requestWriteAccess() {
    return Promise.resolve(true);
  }
  canShareMessage() {
    return false;
  }
  shareMessage() {
    return Promise.resolve(false);
  }
  shareToStory(mediaUrl: string) {
    window.open(mediaUrl, "_blank", "noopener,noreferrer");
  }
  hideKeyboard() {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  }
  isActive() {
    return true;
  }
  onActiveChange() {
    return () => undefined;
  }
  setVerticalSwipes() {}
  exitFullscreen() {}
  deviceGet(key: string) {
    return deviceGet(undefined, key);
  }
  deviceSet(key: string, value: string) {
    return deviceSet(undefined, key, value);
  }
  setBottomBarColor() {}
  openLink(url: string) {
    window.open(url, "_blank", "noopener,noreferrer");
  }
  openTelegramLink(url: string) {
    window.open(url, "_blank", "noopener,noreferrer");
  }
  close() {}
  checkHomeScreenStatus() {
    return Promise.resolve("missed" as const);
  }
  addToHomeScreen() {}
  onHomeScreenAdded() {
    return () => undefined;
  }
}
