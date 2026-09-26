import type { TelegramAdapter } from "./adapter";
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
    this.colorScheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  ready() {}
  setChromeColors() {}
  safeAreaInsets() {
    return { top: 0, bottom: 0, left: 0, right: 0 };
  }
  viewportHeight() {
    return null;
  }
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
  openLink(url: string) {
    window.open(url, "_blank", "noopener,noreferrer");
  }
  openTelegramLink(url: string) {
    window.open(url, "_blank", "noopener,noreferrer");
  }
  close() {}
}
