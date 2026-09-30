import { toast } from "@/components/ui/toast";
import type { TelegramAdapter } from "@/lib/telegram/adapter";

const ORDERS_KEY = "athar.successful-orders";
const DISMISS_KEY = "athar.home-cta-dismissed";

/** After the second successful order, offer a home-screen shortcut once. */
export async function maybeNudgeHomeScreen(
  adapter: TelegramAdapter,
  copy: { title: string; action: string; dismiss: string },
): Promise<void> {
  const current = Number(await adapter.deviceGet(ORDERS_KEY));
  const next = Number.isFinite(current) ? current + 1 : 1;
  await adapter.deviceSet(ORDERS_KEY, String(next));
  if (next < 2) return;
  if ((await adapter.deviceGet(DISMISS_KEY)) === "1") return;
  const status = await adapter.checkHomeScreenStatus();
  if (status !== "missed") return;
  toast(copy.title, {
    action: { label: copy.action, onClick: () => adapter.addToHomeScreen() },
    cancel: {
      label: copy.dismiss,
      onClick: () => {
        void adapter.deviceSet(DISMISS_KEY, "1");
      },
    },
  });
}
