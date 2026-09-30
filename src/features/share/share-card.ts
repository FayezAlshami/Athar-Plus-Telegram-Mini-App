import { shareApi } from "@/lib/api/endpoints";
import type { TelegramAdapter } from "@/lib/telegram/adapter";

/** Native prepared card when the client supports it. Falls back only if preparation fails. */
export async function sharePreparedCard(
  adapter: TelegramAdapter,
  input: { type: "product" | "referral"; product_id?: number },
  fallback: () => void,
): Promise<void> {
  if (!adapter.canShareMessage()) {
    fallback();
    return;
  }
  try {
    const prepared = await shareApi.prepare(input);
    await adapter.shareMessage(prepared.id);
  } catch {
    fallback();
  }
}
