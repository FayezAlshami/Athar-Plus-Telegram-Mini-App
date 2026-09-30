/** Explicit direction — empty fields with `dir="auto"` often render LTR in Telegram WebView. */
export function localeInputDir(locale: string): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr";
}

/** Logical alignment; pair with {@link localeInputDir} on the same control. */
export const localeInputClassName = "text-start placeholder:text-start";
