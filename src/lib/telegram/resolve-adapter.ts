import type { TelegramAdapter } from "./adapter";
import { MockTelegramAdapter } from "./mock-adapter";
import { RealTelegramAdapter } from "./real-adapter";

const MOCK_ENABLED = process.env.NEXT_PUBLIC_TELEGRAM_MOCK === "true";

/** Real Telegram when signed initData exists; the mock only when explicitly enabled. */
export function resolveTelegramAdapter(): TelegramAdapter | null {
  const webApp = window.Telegram?.WebApp;
  if (webApp?.initData) return new RealTelegramAdapter(webApp);
  if (MOCK_ENABLED) return new MockTelegramAdapter();
  return null;
}
