"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft } from "@phosphor-icons/react";
import { IconButton } from "@/components/ui/icon-button";
import { useTelegramState } from "@/lib/telegram/telegram-provider";

/** Leaves the current screen. On the home screen inside Telegram, closes the mini app. */
export function useGoBack() {
  const router = useRouter();
  const pathname = usePathname();
  const telegram = useTelegramState();

  return () => {
    if (pathname === "/") {
      if (telegram.status === "ready") telegram.adapter.close();
      return;
    }
    if (window.history.length > 1) router.back();
    else router.push("/");
  };
}

export function BackButton({ className }: { className?: string }) {
  const t = useTranslations("nav");
  const goBack = useGoBack();

  return (
    <IconButton
      label={t("back")}
      icon={<ArrowLeft className="rtl:-scale-x-100" />}
      onClick={goBack}
      className={className}
    />
  );
}
