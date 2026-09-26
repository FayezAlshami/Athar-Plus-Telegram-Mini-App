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
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: amountMinor % factor === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amountMinor / factor);
}

const LOCAL_CURRENCY_LABEL: Record<string, Record<Locale, string>> = {
  SYP: { ar: "ل.س", en: "SYP" },
};

export function formatLocalAmount(amount: number, currency: string, locale: Locale): string {
  const number = new Intl.NumberFormat(intlLocale(locale), { maximumFractionDigits: 0 }).format(amount);
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
