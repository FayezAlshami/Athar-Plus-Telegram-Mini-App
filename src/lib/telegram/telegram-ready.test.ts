import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TelegramWebApp } from "./web-app";

describe("notifyTelegramReady", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("calls WebApp.ready once and ignores later attempts", async () => {
    const { hasNotifiedTelegramReady, notifyTelegramReady } = await import("./telegram-ready");
    const ready = vi.fn();
    const webApp = { ready } as unknown as TelegramWebApp;

    notifyTelegramReady(webApp);
    notifyTelegramReady(webApp);

    expect(ready).toHaveBeenCalledTimes(1);
    expect(hasNotifiedTelegramReady()).toBe(true);
  });

  it("is a no-op when ready is missing", async () => {
    const { hasNotifiedTelegramReady, notifyTelegramReady } = await import("./telegram-ready");
    notifyTelegramReady({} as TelegramWebApp);
    notifyTelegramReady(null);
    expect(hasNotifiedTelegramReady()).toBe(true);
  });
});
