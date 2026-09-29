import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TelegramAdapter } from "./adapter";
import { authenticateFromHost, rawInitData } from "./telegram-auth";

vi.mock("@/lib/api/endpoints", () => ({
  authApi: {
    telegram: vi.fn(),
    development: vi.fn(),
  },
}));

import { authApi } from "@/lib/api/endpoints";

function telegramAdapter(initData: string): TelegramAdapter {
  return {
    kind: "telegram",
    platform: "ios",
    initData,
    user: { id: 999, first_name: "Unsafe" },
    startParam: null,
    colorScheme: "light",
  } as TelegramAdapter;
}

describe("telegram auth", () => {
  beforeEach(() => {
    vi.mocked(authApi.telegram).mockReset();
    vi.mocked(authApi.development).mockReset();
  });

  it("sends only the raw signed initData to Laravel", async () => {
    const initData = "query_id=AAH&user=%7B%22id%22%3A1%7D&auth_date=1&hash=abc";
    vi.mocked(authApi.telegram).mockResolvedValue({} as never);
    await authenticateFromHost(telegramAdapter(initData));
    expect(authApi.telegram).toHaveBeenCalledWith(initData);
    expect(authApi.telegram).not.toHaveBeenCalledWith(expect.objectContaining({ id: 999 }));
    expect(rawInitData(telegramAdapter(initData))).toBe(initData);
  });

  it("rejects a Telegram session with empty initData instead of sending a constructed user id", async () => {
    await expect(authenticateFromHost(telegramAdapter(""))).rejects.toThrow("telegram_init_data_missing");
    expect(authApi.telegram).not.toHaveBeenCalled();
    expect(authApi.development).not.toHaveBeenCalled();
  });
});
