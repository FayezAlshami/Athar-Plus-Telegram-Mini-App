"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft } from "@phosphor-icons/react";
import { IconButton } from "@/components/ui/icon-button";
import { useTelegramState } from "@/lib/telegram/telegram-provider";

/**
 * Inside Telegram the native BackButton is used; in a regular browser an
 * in-app back control is rendered instead.
 */
export function PageHeader({ title, showBack = true, trailing }: { title: string; showBack?: boolean; trailing?: ReactNode }) {
  const router = useRouter();
  const t = useTranslations("nav");
  const telegram = useTelegramState();
  const nativeBack = telegram.status === "ready" && telegram.adapter.kind === "telegram";

  return (
    <header className="flex min-h-11 items-center gap-3">
      {showBack && !nativeBack && (
        <IconButton label={t("back")} icon={<ArrowLeft className="rtl:-scale-x-100" />} onClick={() => router.back()} />
      )}
      <h1 className="min-w-0 flex-1 truncate text-page-title">{title}</h1>
      {trailing}
    </header>
  );
}
