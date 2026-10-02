"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { Check, Copy } from "@phosphor-icons/react";
import { useHaptics } from "@/lib/telegram/hooks";
import { duration } from "@/lib/animation/tokens";
import { copyText } from "@/lib/clipboard";
import { cn } from "@/lib/cn";

const RESET_DELAY_MS = 1600;

export function CopyStatusIcon({ copied, className }: { copied: boolean; className?: string }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={copied ? "copied" : "copy"}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ duration: duration.fast }}
        className="inline-flex shrink-0"
      >
        {copied ? <Check className={cn("size-5 text-success", className)} weight="bold" /> : <Copy className={cn("size-5", className)} />}
      </motion.span>
    </AnimatePresence>
  );
}

export function CopyButton({ value, className }: { value: string; className?: string }) {
  const t = useTranslations("common");
  const haptics = useHaptics();
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      aria-label={copied ? t("copied") : t("copy")}
      onClick={async () => {
        const ok = await copyText(value);
        if (!ok) return;
        haptics.selection();
        setCopied(true);
        window.setTimeout(() => setCopied(false), RESET_DELAY_MS);
      }}
      className={cn("inline-flex size-11 items-center justify-center rounded-full text-muted-foreground transition-colors active:bg-muted", className)}
    >
      <CopyStatusIcon copied={copied} />
    </button>
  );
}
