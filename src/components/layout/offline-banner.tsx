"use client";

import { useTranslations } from "next-intl";
import { WifiSlash } from "@phosphor-icons/react";
import { useOnlineStatus } from "@/hooks/use-online-status";

export function OfflineBanner() {
  const online = useOnlineStatus();
  const t = useTranslations("common");
  if (online) return null;

  return (
    <div role="status" className="sticky top-0 z-40 flex items-center justify-center gap-2 bg-foreground px-4 py-2 text-caption text-background">
      <WifiSlash className="size-4" weight="bold" />
      <span>{t("offline")}</span>
    </div>
  );
}
