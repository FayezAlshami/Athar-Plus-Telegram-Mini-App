"use client";

import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { WifiSlash } from "@phosphor-icons/react";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { spring } from "@/lib/animation/tokens";

/**
 * Floating notice above the bottom bar. It never pushes content or hides under
 * the Telegram header, and it steps aside as soon as the connection returns.
 */
export function OfflineBanner() {
  const online = useOnlineStatus();
  const t = useTranslations("common");

  return (
    <AnimatePresence>
      {!online && (
        <motion.div
          role="status"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={spring.entrance}
          className="pointer-events-none fixed inset-x-0 z-40 flex justify-center ps-[max(1rem,var(--safe-left))] pe-[max(1rem,var(--safe-right))] bottom-[calc(max(var(--bottom-inset,0px),var(--safe-bottom))+12px)]"
        >
          <p className="pointer-events-auto flex max-w-[var(--content-max-width)] items-center gap-2.5 rounded-lg bg-foreground px-4 py-2.5 text-caption text-background shadow-lg">
            <WifiSlash className="size-4 shrink-0" weight="bold" />
            <span>{t("offline")}</span>
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
