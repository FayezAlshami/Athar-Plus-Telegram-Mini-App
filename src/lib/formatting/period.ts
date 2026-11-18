const ARABIC = {
  day: ["يوم واحد", "يومان", "أيام", "يوماً"],
  month: ["شهر واحد", "شهران", "أشهر", "شهراً"],
  year: ["سنة واحدة", "سنتان", "سنوات", "سنة"],
} as const;

export type PeriodUnit = "day" | "month" | "year";

export function formatPeriod(count: number, unit: PeriodUnit, locale: string): string {
  if (locale.startsWith("en")) {
    const word = count === 1 ? unit : `${unit}s`;
    return `${count} ${word}`;
  }

  const forms = ARABIC[unit];
  if (count === 1) return forms[0];
  if (count === 2) return forms[1];
  if (count >= 3 && count <= 10) return `${count} ${forms[2]}`;
  return `${count} ${forms[3]}`;
}
