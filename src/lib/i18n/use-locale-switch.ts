"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { accountApi } from "@/lib/api/endpoints";
import { writeCookie } from "@/lib/cookies";
import { track } from "@/lib/analytics/events";
import { LOCALE_COOKIE, type Locale } from "./config";

/** Persists the language server-side and re-renders with the new locale/direction. */
export function useLocaleSwitch() {
  const current = useLocale();
  const router = useRouter();
  const [isSwitching, startTransition] = useTransition();

  const switchLocale = (locale: Locale) => {
    if (locale === current) return;
    writeCookie(LOCALE_COOKIE, locale);
    track("language_changed", { locale });
    void accountApi.updateProfile({ locale }).catch(() => undefined);
    startTransition(() => router.refresh());
  };

  return { locale: current, switchLocale, isSwitching };
}
