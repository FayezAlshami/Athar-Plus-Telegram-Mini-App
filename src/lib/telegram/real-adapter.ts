import type { HapticImpact, HapticNotice, HomeScreenStatus, TelegramAdapter } from "./adapter";
import type { TelegramThemeParams } from "./telegram.types";
import { combineSafeAreaInsets, ZERO_INSET } from "./telegram-safe-area";
import { normalizeColorScheme } from "./telegram-theme";
import { notifyTelegramReady } from "./telegram-ready";
import type { TelegramWebApp } from "./web-app";

export class RealTelegramAdapter implements TelegramAdapter {
  readonly kind = "telegram" as const;

  constructor(private readonly webApp: TelegramWebApp) {}

  get platform() {
    return this.webApp.platform;
  }
  get initData() {
    return this.webApp.initData;
  }
  get user() {
    return this.webApp.initDataUnsafe.user ?? null;
  }
  get startParam() {
    return this.webApp.initDataUnsafe.start_param ?? null;
  }
  get colorScheme() {
    return normalizeColorScheme(this.webApp.colorScheme);
  }

  ready() {
    this.webApp.expand();
    if (this.supports("7.7")) this.webApp.disableVerticalSwipes?.();
  }

  notifyReady() {
    notifyTelegramReady(this.webApp);
  }

  setChromeColors({ header, background }: { header: string; background: string }) {
    if (!this.supports("6.1")) return;
    this.webApp.setHeaderColor(header);
    this.webApp.setBackgroundColor(background);
    if (this.supports("7.10")) this.webApp.setBottomBarColor?.(background);
  }

  themeParams(): TelegramThemeParams {
    return this.webApp.themeParams ?? {};
  }

  onThemeChange(handler: () => void) {
    this.webApp.onEvent("themeChanged", handler);
    return () => this.webApp.offEvent("themeChanged", handler);
  }

  deviceSafeArea() {
    return this.webApp.safeAreaInset ?? ZERO_INSET;
  }

  contentSafeArea() {
    return this.webApp.contentSafeAreaInset ?? ZERO_INSET;
  }

  safeAreaInsets() {
    return combineSafeAreaInsets(this.deviceSafeArea(), this.contentSafeArea());
  }

  viewportHeight() {
    return this.webApp.viewportStableHeight || null;
  }

  isFullscreen() {
    return Boolean(this.webApp.isFullscreen);
  }

  requestFullscreen() {
    if (!this.supports("8.0") || !this.webApp.requestFullscreen) return;
    try {
      this.webApp.requestFullscreen();
    } catch {
      // Progressive enhancement — the app stays expanded.
    }
  }

  onViewportChange(handler: () => void) {
    const events = ["viewportChanged", "safeAreaChanged", "contentSafeAreaChanged", "fullscreenChanged", "fullscreenFailed"];
    events.forEach((event) => this.webApp.onEvent(event, handler));
    return () => events.forEach((event) => this.webApp.offEvent(event, handler));
  }

  showBackButton(onClick: () => void) {
    if (!this.supports("6.1")) return () => undefined;
    this.webApp.BackButton.onClick(onClick);
    this.webApp.BackButton.show();
    return () => this.webApp.BackButton.offClick(onClick);
  }

  hideBackButton() {
    if (this.supports("6.1")) this.webApp.BackButton.hide();
  }

  impact(style: HapticImpact = "light") {
    if (this.supports("6.1")) this.webApp.HapticFeedback.impactOccurred(style);
  }
  notify(type: HapticNotice) {
    if (this.supports("6.1")) this.webApp.HapticFeedback.notificationOccurred(type);
  }
  selection() {
    if (this.supports("6.1")) this.webApp.HapticFeedback.selectionChanged();
  }

  enableClosingConfirmation() {
    if (this.supports("6.2")) this.webApp.enableClosingConfirmation?.();
  }

  disableClosingConfirmation() {
    if (this.supports("6.2")) this.webApp.disableClosingConfirmation?.();
  }

  openLink(url: string) {
    this.webApp.openLink(url);
  }
  openTelegramLink(url: string) {
    this.webApp.openTelegramLink(url);
  }
  close() {
    this.webApp.close();
  }

  checkHomeScreenStatus() {
    if (!this.supports("8.0") || !this.webApp.checkHomeScreenStatus) {
      return Promise.resolve("unsupported" as const);
    }
    return new Promise<HomeScreenStatus>((resolve) => {
      this.webApp.checkHomeScreenStatus?.((status) => resolve(status));
    });
  }

  addToHomeScreen() {
    if (this.supports("8.0")) this.webApp.addToHomeScreen?.();
  }

  onHomeScreenAdded(handler: () => void) {
    if (!this.supports("8.0")) return () => undefined;
    this.webApp.onEvent("homeScreenAdded", handler);
    return () => this.webApp.offEvent("homeScreenAdded", handler);
  }

  private supports(version: string) {
    return this.webApp.isVersionAtLeast(version);
  }
}
