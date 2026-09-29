import type { AuthSession } from "@/entities/user/types";
import { authApi } from "@/lib/api/endpoints";
import type { TelegramAdapter } from "./adapter";

/**
 * The only Telegram credential this app sends to Laravel is the raw signed
 * `initData` string. `initDataUnsafe.user.id` is display-only and is never
 * treated as proof of identity.
 */
export function rawInitData(adapter: TelegramAdapter): string {
  return adapter.initData;
}

export function authenticateFromHost(adapter: TelegramAdapter): Promise<AuthSession> {
  if (adapter.kind === "mock") {
    const user = adapter.user;
    if (!user) {
      return Promise.reject(new Error("telegram_mock_user_missing"));
    }
    return authApi.development({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      language_code: user.language_code,
      photo_url: user.photo_url,
    });
  }

  const initData = rawInitData(adapter);
  if (initData === "") {
    return Promise.reject(new Error("telegram_init_data_missing"));
  }
  return authApi.telegram(initData);
}
