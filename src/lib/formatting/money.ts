import type { Locale } from "@/lib/i18n/config";

const MINOR_UNITS: Record<string, number> = { USD: 100 };

/** Latin digits in both locales keep prices unambiguous for Syrian customers. */
function intlLocale(locale: Locale): string {
  return locale === "ar" ? "ar-u-nu-latn" : "en-US";
}

/**
 * Wallet currency is rendered identically in both languages ("$42.50") and
 * always inside an LTR isolate, which reads naturally within Arabic text.
 */
export function formatMoney(amountMinor: number, currency: string): string {
  const factor = MINOR_UNITS[currency] ?? 100;
  const negative = amountMinor < 0;
  const absolute = Math.abs(Math.trunc(amountMinor));
  const whole = Math.trunc(absolute / factor);
  const fraction = absolute % factor;
  const grouped = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0, useGrouping: true }).format(whole);
  const digits = fraction === 0 ? grouped : `${grouped}.${String(fraction).padStart(2, "0")}`;
  const body = currency === "USD" ? `$${digits}` : `${digits} ${currency}`;
  return negative ? `-${body}` : body;
}

const LOCAL_CURRENCY_LABEL: Record<string, Record<Locale, string>> = {
  SYP: { ar: "ل.س", en: "SYP" },
};

export function formatLocalAmount(amount: number, currency: string, locale: Locale): string {
  const whole = Math.trunc(amount);
  const number = new Intl.NumberFormat(intlLocale(locale), { maximumFractionDigits: 0 }).format(whole);
  return `${number} ${LOCAL_CURRENCY_LABEL[currency]?.[locale] ?? currency}`;
}

/** Parses a user-typed major amount ("12.5") into minor units without float drift. */
export function parseMajorToMinor(value: string, currency = "USD"): number | null {
  const normalized = value.replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d))).replace(",", ".").trim();
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const [whole, fraction = ""] = normalized.split(".");
  const factor = MINOR_UNITS[currency] ?? 100;
  return Number(whole) * factor + Number(fraction.padEnd(2, "0"));
}

export function minorToMajorInput(amountMinor: number): string {
  const absolute = Math.abs(Math.trunc(amountMinor));
  const factor = 100;
  const whole = Math.trunc(absolute / factor);
  const fraction = absolute % factor;
  return fraction === 0 ? String(whole) : `${whole}.${String(fraction).padStart(2, "0")}`;
}
