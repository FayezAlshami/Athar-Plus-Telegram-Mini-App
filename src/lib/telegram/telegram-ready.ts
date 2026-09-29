import type { TelegramWebApp } from "./web-app";

let notified = false;

/**
 * Tells Telegram the Mini App can be shown. Call once, after theme + shell
 * are on screen. Missing `ready` (browser / old clients) is a no-op.
 */
export function notifyTelegramReady(webApp: TelegramWebApp | null | undefined): void {
  if (notified) return;
  notified = true;
  if (typeof webApp?.ready !== "function") return;
  webApp.ready();
}

export function hasNotifiedTelegramReady(): boolean {
  return notified;
}
