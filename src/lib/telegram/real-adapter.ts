import type { HapticImpact, HapticNotice, HomeScreenStatus, TelegramAdapter } from "./adapter";
import type { TelegramWebApp } from "./web-app";

const ZERO_INSET = { top: 0, bottom: 0, left: 0, right: 0 };

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
    return this.webApp.colorScheme;
  }

  ready() {
    this.webApp.ready();
    this.webApp.expand();
    if (this.supports("7.7")) this.webApp.disableVerticalSwipes?.();
  }

  setChromeColors({ header, background }: { header: string; background: string }) {
    if (!this.supports("6.1")) return;
    this.webApp.setHeaderColor(header);
    this.webApp.setBackgroundColor(background);
    if (this.supports("7.10")) this.webApp.setBottomBarColor?.(background);
  }

  safeAreaInsets() {
    const device = this.webApp.safeAreaInset ?? ZERO_INSET;
    const content = this.webApp.contentSafeAreaInset ?? ZERO_INSET;
    return {
      top: device.top + content.top,
      bottom: device.bottom + content.bottom,
      left: device.left + content.left,
      right: device.right + content.right,
    };
  }

  viewportHeight() {
    return this.webApp.viewportStableHeight || null;
  }

  onViewportChange(handler: () => void) {
    const events = ["viewportChanged", "safeAreaChanged", "contentSafeAreaChanged"];
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
