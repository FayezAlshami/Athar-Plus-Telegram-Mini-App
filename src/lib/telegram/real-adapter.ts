import type { HapticImpact, HapticNotice, HomeScreenStatus, TelegramAdapter } from "./adapter";
import type { TelegramThemeParams } from "./telegram.types";
import { combineSafeAreaInsets, ZERO_INSET } from "./telegram-safe-area";
import { normalizeColorScheme } from "./telegram-theme";
import { allowsWriteToPmFromInitData } from "./allows-write";
import { canConfirmAppClose } from "./telegram-closing-confirmation";
import { deviceGet, deviceSet } from "./telegram-device-store";
import { notifyTelegramReady } from "./telegram-ready";
import type { TelegramBottomButton, TelegramWebApp } from "./web-app";

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
  }

  notifyReady() {
    notifyTelegramReady(this.webApp);
  }

  setChromeColors({ header, background }: { header: string; background: string }) {
    if (!this.supports("6.1")) return;
    this.webApp.setHeaderColor(header);
    this.webApp.setBackgroundColor(background);
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
    if (!canConfirmAppClose(this.webApp)) return;
    notifyTelegramReady(this.webApp);
    this.webApp.enableClosingConfirmation();
  }

  disableClosingConfirmation() {
    if (!canConfirmAppClose(this.webApp)) return;
    this.webApp.disableClosingConfirmation();
  }

  showAlert(message: string) {
    if (typeof this.webApp.showAlert !== "function") {
      window.alert(message);
      return Promise.resolve();
    }
    return new Promise<void>((resolve) => this.webApp.showAlert?.(message, () => resolve()));
  }

  showConfirm(message: string) {
    if (typeof this.webApp.showConfirm !== "function") return Promise.resolve(window.confirm(message));
    return new Promise<boolean>((resolve) => this.webApp.showConfirm?.(message, (ok) => resolve(Boolean(ok))));
  }

  hasNativeDialogs() {
    return typeof this.webApp.showConfirm === "function";
  }

  hasBottomButtons() {
    return typeof this.webApp.MainButton?.show === "function" && typeof this.webApp.SecondaryButton?.show === "function";
  }

  setMainButton(button: { text: string; enabled: boolean } | null, onClick: () => void) {
    return this.bindBottomButton(this.webApp.MainButton, button, onClick);
  }

  setSecondaryButton(button: { text: string; enabled: boolean } | null, onClick: () => void) {
    return this.bindBottomButton(this.webApp.SecondaryButton, button, onClick);
  }

  allowsWriteToPm() {
    return allowsWriteToPmFromInitData(this.webApp.initData);
  }

  requestWriteAccess() {
    if (this.allowsWriteToPm()) return Promise.resolve(true);
    if (typeof this.webApp.requestWriteAccess !== "function") return Promise.resolve(false);
    return new Promise<boolean>((resolve) => this.webApp.requestWriteAccess?.((granted) => resolve(Boolean(granted))));
  }

  canShareMessage() {
    return typeof this.webApp.shareMessage === "function";
  }

  shareMessage(messageId: string) {
    if (typeof this.webApp.shareMessage !== "function") return Promise.resolve(false);
    return new Promise<boolean>((resolve) => this.webApp.shareMessage?.(messageId, (sent) => resolve(Boolean(sent))));
  }

  shareToStory(mediaUrl: string, params?: { text?: string; widgetLink?: { url: string; name?: string } }) {
    if (typeof this.webApp.shareToStory !== "function") {
      window.open(mediaUrl, "_blank", "noopener,noreferrer");
      return;
    }
    this.webApp.shareToStory(mediaUrl, {
      text: params?.text,
      widget_link: params?.widgetLink,
    });
  }

  hideKeyboard() {
    if (typeof this.webApp.hideKeyboard === "function") this.webApp.hideKeyboard();
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  }

  isActive() {
    return this.webApp.isActive !== false;
  }

  onActiveChange(handler: (active: boolean) => void) {
    const on = () => handler(true);
    const off = () => handler(false);
    this.webApp.onEvent("activated", on);
    this.webApp.onEvent("deactivated", off);
    return () => {
      this.webApp.offEvent("activated", on);
      this.webApp.offEvent("deactivated", off);
    };
  }

  setVerticalSwipes(enabled: boolean) {
    if (enabled) this.webApp.enableVerticalSwipes?.();
    else this.webApp.disableVerticalSwipes?.();
  }

  exitFullscreen() {
    try {
      this.webApp.exitFullscreen?.();
    } catch {
      // Leaving fullscreen is optional.
    }
  }

  deviceGet(key: string) {
    return deviceGet(this.webApp.DeviceStorage, key);
  }

  deviceSet(key: string, value: string) {
    return deviceSet(this.webApp.DeviceStorage, key, value);
  }

  setBottomBarColor(color: string) {
    if (typeof this.webApp.setBottomBarColor === "function") this.webApp.setBottomBarColor(color);
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

  private bindBottomButton(
    button: TelegramBottomButton | undefined,
    spec: { text: string; enabled: boolean } | null,
    onClick: () => void,
  ): () => void {
    if (!button || typeof button.show !== "function") return () => undefined;
    if (!spec) {
      button.hide();
      return () => undefined;
    }
    button.setText(spec.text);
    if (spec.enabled) button.enable();
    else button.disable();
    button.onClick(onClick);
    button.show();
    return () => {
      button.offClick(onClick);
      button.hide();
    };
  }
}
