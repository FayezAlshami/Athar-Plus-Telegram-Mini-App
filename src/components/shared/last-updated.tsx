"use client";

import { useLocale, useTranslations } from "next-intl";
import { useOnlineStatus } from "@/hooks/use-online-status";

export function LastUpdated({ at }: { at: number | undefined }) {
  const t = useTranslations("common");
  const locale = useLocale();
  const online = useOnlineStatus();
  if (!at) return null;
  const time = new Date(at).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });

  return (
    <p className="text-caption text-muted-foreground">
      {!online && <span>{t("offlineReading")} </span>}
      {t("lastUpdated", { time })}
    </p>
  );
}
