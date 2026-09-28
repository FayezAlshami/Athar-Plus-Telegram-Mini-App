"use client";

import { createContext, useCallback, useContext, useMemo, useState, useTransition, type ReactNode } from "react";
import { NextIntlClientProvider, type AbstractIntlMessages } from "next-intl";
import { accountApi } from "@/lib/api/endpoints";
import { writeCookie } from "@/lib/cookies";
import { track } from "@/lib/analytics/events";
import { directionOf, isLocale, LOCALE_COOKIE, type Locale } from "./config";

const messageLoaders: Record<Locale, () => Promise<{ default: AbstractIntlMessages }>> = {
  ar: () => import("./messages/ar.json"),
  en: () => import("./messages/en.json"),
};

interface LocaleActions {
  locale: Locale;
  isSwitching: boolean;
  /** Swaps copy and direction in place, without a full page reload. */
  applyLocale: (locale: Locale) => Promise<void>;
  switchLocale: (locale: Locale) => void;
}

const LocaleActionsContext = createContext<LocaleActions | null>(null);

export function LocaleProvider({
  initialLocale,
  initialMessages,
  children,
}: {
  initialLocale: string;
  initialMessages: AbstractIntlMessages;
  children: ReactNode;
}) {
  const starting = isLocale(initialLocale) ? initialLocale : "ar";
  const [locale, setLocale] = useState<Locale>(starting);
  const [messages, setMessages] = useState(initialMessages);
  const [isSwitching, startTransition] = useTransition();

  const applyLocale = useCallback(
    async (next: Locale) => {
      if (next === locale) return;
      const loaded = await messageLoaders[next]();
      writeCookie(LOCALE_COOKIE, next);
      document.documentElement.lang = next;
      document.documentElement.dir = directionOf(next);
      startTransition(() => {
        setMessages(loaded.default);
        setLocale(next);
      });
    },
    [locale],
  );

  const switchLocale = useCallback(
    (next: Locale) => {
      if (next === locale) return;
      track("language_changed", { locale: next });
      void applyLocale(next);
      void accountApi.updateProfile({ locale: next }).catch(() => undefined);
    },
    [applyLocale, locale],
  );

  const actions = useMemo(
    () => ({ locale, isSwitching, applyLocale, switchLocale }),
    [locale, isSwitching, applyLocale, switchLocale],
  );

  return (
    <LocaleActionsContext.Provider value={actions}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    </LocaleActionsContext.Provider>
  );
}

export function useLocaleActions(): LocaleActions {
  const value = useContext(LocaleActionsContext);
  if (!value) throw new Error("useLocaleActions must be used within LocaleProvider");
  return value;
}
