"use client";

import { useEffect, useId, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { duration, easing } from "@/lib/animation/tokens";
import { useHomeScreenShortcut, useSuppressVerticalSwipes } from "@/lib/telegram/hooks";

const SESSION_KEY = "athar.home-prompt-session";

/** Centered prompt the first time each visit can still add the home-screen shortcut. */
export function AddToHomeDialog() {
  const t = useTranslations();
  const reduce = useReducedMotion();
  const titleId = useId();
  const home = useHomeScreenShortcut();
  const [open, setOpen] = useState(false);
  useSuppressVerticalSwipes(open);

  useEffect(() => {
    if (home.status !== "missed" && home.status !== "unknown") {
      if (home.status === "added") setOpen(false);
      return;
    }
    try {
      if (sessionStorage.getItem(SESSION_KEY) === "1") return;
    } catch {
      // Private mode can block storage; still offer the shortcut once.
    }
    setOpen(true);
  }, [home.status]);

  const remember = () => {
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      // The prompt simply returns on the next launch.
    }
  };

  const dismiss = () => {
    remember();
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const add = () => {
    home.add();
    remember();
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center px-5"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduce ? undefined : { opacity: 0 }}
          transition={{ duration: duration.fast, ease: easing.standard }}
        >
          <button type="button" aria-label={t("common.close")} className="absolute inset-0 bg-overlay backdrop-blur-[2px]" onClick={dismiss} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={reduce ? false : { opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? undefined : { opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: duration.normal, ease: easing.emphasized }}
            className="relative w-full max-w-[20.5rem] rounded-xl border border-border bg-surface-elevated px-5 pt-6 pb-5 text-center shadow-lg"
          >
            <span className="mx-auto flex size-28 items-center justify-center overflow-hidden rounded-[1.75rem] bg-white shadow-md ring-1 ring-border">
              <img src="/bot-logo.jpg" alt="" className="size-[88%] object-contain" />
            </span>
            <h2 id={titleId} className="mt-4 text-section-title text-balance">
              {t("profile.addToHomeTitle")}
            </h2>
            <p className="mt-1.5 text-small text-muted-foreground text-pretty">{t("profile.addToHomeBody")}</p>
            <div className="mt-5 flex flex-col gap-2">
              <Button size="lg" fullWidth onClick={add} haptic="medium">
                {t("profile.addToHome")}
              </Button>
              <Button variant="ghost" fullWidth onClick={dismiss}>
                {t("profile.addToHomeLater")}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
