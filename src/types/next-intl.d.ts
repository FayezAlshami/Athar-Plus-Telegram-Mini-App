import type messages from "@/lib/i18n/messages/ar.json";
import type { Locale } from "@/lib/i18n/config";

declare module "next-intl" {
  interface AppConfig {
    Locale: Locale;
    Messages: typeof messages;
  }
}
