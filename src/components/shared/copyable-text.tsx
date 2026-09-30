"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { toast } from "@/components/ui/toast";
import { useHaptics } from "@/lib/telegram/hooks";
import { copyText } from "@/lib/clipboard";
import { cn } from "@/lib/cn";

const RESET_DELAY_MS = 1600;

/** Copies `value` on tap without navigating a parent link. */
export function CopyableText({
  value,
  label,
  children,
  className,
}: {
  value: string;
  label: string;
  children: ReactNode;
  className?: string;
}) {
  const t = useTranslations("common");
  const haptics = useHaptics();
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      aria-label={copied ? t("copied") : label}
      onClick={async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const ok = await copyText(value);
        if (!ok) return;
        haptics.selection();
        toast.success(t("copied"));
        setCopied(true);
        window.setTimeout(() => setCopied(false), RESET_DELAY_MS);
      }}
      className={cn(className)}
    >
      {children}
    </button>
  );
}
