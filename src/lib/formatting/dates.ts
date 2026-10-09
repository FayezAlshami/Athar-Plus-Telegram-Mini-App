import type { Locale } from "@/lib/i18n/config";

const LOCALE_TAG = (locale: Locale) => (locale === "ar" ? "ar-u-nu-latn" : "en-GB");

export function formatDateTime(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(LOCALE_TAG(locale), {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function formatDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(LOCALE_TAG(locale), { dateStyle: "medium" }).format(new Date(iso));
}

export function formatTime(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(LOCALE_TAG(locale), { timeStyle: "short" }).format(new Date(iso));
}

export function formatRelative(iso: string, locale: Locale): string {
  const seconds = Math.round((new Date(iso).getTime() - Date.now()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(locale === "ar" ? "ar-u-nu-latn" : "en", { numeric: "auto" });
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
  }
  return rtf.format(0, "minute");
}
