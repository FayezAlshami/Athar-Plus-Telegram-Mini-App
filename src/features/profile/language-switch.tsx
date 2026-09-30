"use client";

import { useId } from "react";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Translate } from "@phosphor-icons/react";
import { spring } from "@/lib/animation/tokens";
import { useHaptics } from "@/lib/telegram/hooks";
import { useLocaleSwitch } from "@/lib/i18n/use-locale-switch";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/cn";

const OPTIONS: { value: Locale; label: string; name: "arabic" | "english" }[] = [
  { value: "ar", label: "عربي", name: "arabic" },
  { value: "en", label: "EN", name: "english" },
];

/** One row: language name on the start, a two-option pill on the end. */
export function LanguageSwitch() {
  const t = useTranslations("profile");
  const { locale, switchLocale } = useLocaleSwitch();
  const haptics = useHaptics();
  const layoutId = useId();

  return (
    <div className="relative flex min-h-[52px] items-center gap-3 px-4">
      <span className="flex size-[30px] shrink-0 items-center justify-center rounded-[9px] bg-accent-soft text-accent [&_svg]:size-[18px]">
        <Translate weight="duotone" />
      </span>
      <span className="min-w-0 flex-1 text-start text-small font-medium">{t("language")}</span>
      <div role="radiogroup" aria-label={t("language")} className="flex rounded-full bg-surface-sunken p-0.5">
        {OPTIONS.map((option) => {
          const selected = locale === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={t(option.name)}
              onClick={() => {
                if (selected) return;
                haptics.selection();
                switchLocale(option.value);
              }}
              className={cn("relative h-8 min-w-12 rounded-full px-3 text-caption font-semibold", selected ? "text-foreground" : "text-muted-foreground")}
            >
              {selected && <motion.span layoutId={layoutId} transition={spring.interactive} className="absolute inset-0 rounded-full bg-surface shadow-sm" />}
              <span className="relative">{option.label}</span>
            </button>
          );
        })}
      </div>
      <span aria-hidden className="settings-sep pointer-events-none absolute inset-x-0 bottom-0 h-px bg-border" style={{ insetInlineStart: "3.25rem" }} />
    </div>
  );
}
