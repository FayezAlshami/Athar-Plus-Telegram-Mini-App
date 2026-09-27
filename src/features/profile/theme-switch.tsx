"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Moon, Sun } from "@phosphor-icons/react";
import { useTheme, type Theme } from "@/providers/theme-provider";
import { spring } from "@/lib/animation/tokens";
import { useHaptics } from "@/lib/telegram/hooks";
import { cn } from "@/lib/cn";

/** Swaps the theme class. The sun and moon icons change in place, without a morph. */
export function ThemeSwitch() {
  const t = useTranslations("profile");
  const { theme, setTheme } = useTheme();
  const haptics = useHaptics();
  const options: { value: Theme; label: string; icon: typeof Sun }[] = [
    { value: "light", label: t("themeLight"), icon: Sun },
    { value: "dark", label: t("themeDark"), icon: Moon },
  ];

  return (
    <div role="radiogroup" aria-label={t("theme")} className="grid grid-cols-2 gap-2 p-3">
      {options.map(({ value, label, icon: Icon }) => {
        const selected = theme === value;
        return (
          <motion.button
            key={value}
            type="button"
            role="radio"
            aria-checked={selected}
            whileTap={{ scale: 0.96 }}
            transition={spring.interactive}
            onClick={() => {
              if (selected) return;
              haptics.impact("soft");
              setTheme(value);
            }}
            className={cn(
              "flex h-12 items-center justify-center gap-2 rounded-md border text-small font-medium transition-colors",
              selected ? "border-accent bg-accent-soft text-foreground" : "border-border bg-surface-sunken text-muted-foreground",
            )}
          >
            <Icon className="size-5" weight={selected ? "fill" : "regular"} />
            {label}
          </motion.button>
        );
      })}
    </div>
  );
}
