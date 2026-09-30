"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUp } from "@phosphor-icons/react";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { useHaptics } from "@/lib/telegram/hooks";
import { spring } from "@/lib/animation/tokens";
import { cn } from "@/lib/cn";

export function BackToTop() {
  const t = useTranslations("common");
  const online = useOnlineStatus();
  const haptics = useHaptics();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 2);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          aria-label={t("backToTop")}
          initial={{ opacity: 0, scale: 0.6, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 12 }}
          whileTap={{ scale: 0.9 }}
          transition={spring.interactive}
          onClick={() => {
            haptics.selection();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={cn(
            "fixed end-4 z-40 flex size-11 items-center justify-center rounded-full border border-border bg-surface-elevated text-foreground shadow-lg",
            // Clears the bottom bar, and the offline notice when it is showing.
            online
              ? "bottom-[calc(max(var(--bottom-inset,0px),var(--safe-bottom))+12px)]"
              : "bottom-[calc(max(var(--bottom-inset,0px),var(--safe-bottom))+76px)]",
          )}
        >
          <ArrowUp className="size-5" weight="bold" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
