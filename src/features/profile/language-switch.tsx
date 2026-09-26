"use client";

import { useTranslations } from "next-intl";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { useLocaleSwitch } from "@/lib/i18n/use-locale-switch";
import type { Locale } from "@/lib/i18n/config";

export function LanguageSwitch() {
  const t = useTranslations("profile");
  const { locale, switchLocale } = useLocaleSwitch();

  return (
    <div className="p-3">
      <SegmentedControl<Locale>
        label={t("language")}
        value={locale}
        onChange={switchLocale}
        options={[
          { value: "ar", label: t("arabic") },
          { value: "en", label: t("english") },
        ]}
      />
    </div>
  );
}
