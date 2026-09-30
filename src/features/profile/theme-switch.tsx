"use client";

import { useTranslations } from "next-intl";
import { Moon, Sun } from "@phosphor-icons/react";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/providers/theme-provider";

/** One row: dark mode on or off. */
export function ThemeSwitch() {
  const t = useTranslations("profile");
  const { theme, setTheme } = useTheme();
  const dark = theme === "dark";

  return (
    <div className="relative flex min-h-[52px] items-center gap-3 px-4">
      <span className="flex size-[30px] shrink-0 items-center justify-center rounded-[9px] bg-surface-sunken text-foreground [&_svg]:size-[18px]">
        {dark ? <Moon weight="fill" /> : <Sun weight="fill" />}
      </span>
      <span className="min-w-0 flex-1 text-start text-small font-medium">{t("darkMode")}</span>
      <Switch checked={dark} label={t("darkMode")} onChange={(on) => setTheme(on ? "dark" : "light")} />
    </div>
  );
}
