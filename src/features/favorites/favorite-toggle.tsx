"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { toast } from "@/components/ui/toast";
import { AnimatedHeartIcon } from "@/components/illustrations/animated-icons";
import { armDelayedCommit, UNDO_WINDOW_MS, type DelayedCommit } from "@/lib/feedback/delayed-commit";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { useErrorMessage } from "@/lib/api/use-error-message";
import { useHaptics } from "@/lib/telegram/hooks";
import { cn } from "@/lib/cn";
import { useToggleFavorite } from "./queries";

const BURST = 8;

export function FavoriteToggle({
  productId,
  isFavorite,
  className,
}: {
  productId: number;
  isFavorite: boolean;
  className?: string;
}) {
  const t = useTranslations("favorites");
  const tCommon = useTranslations("common");
  const online = useOnlineStatus();
  const haptics = useHaptics();
  const errorMessage = useErrorMessage();
  const toggle = useToggleFavorite();
  const [saved, setSaved] = useState(isFavorite);
  const [pulse, setPulse] = useState(false);
  const burstRef = useRef<HTMLSpanElement>(null);
  const pending = useRef<DelayedCommit | null>(null);

  useEffect(() => setSaved(isFavorite), [isFavorite]);

  const playBurst = () => {
    const root = burstRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const dots = root.querySelectorAll("span");
    dots.forEach((dot, index) => {
      const angle = (index / BURST) * Math.PI * 2;
      gsap.fromTo(
        dot,
        { x: 0, y: 0, scale: 0.3, opacity: 1 },
        {
          x: Math.cos(angle) * 18,
          y: Math.sin(angle) * 18,
          scale: 1,
          opacity: 0,
          duration: 0.48,
          ease: "power2.out",
        },
      );
    });
  };

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? t("saved") : t("save")}
      disabled={!online}
      title={!online ? tCommon("offlineAction") : undefined}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!online) return;
        const next = !saved;
        pending.current?.undo();
        setSaved(next);
        if (next) {
          setPulse(true);
          window.setTimeout(() => setPulse(false), 400);
          playBurst();
          haptics.impact("light");
        }
        const armed = armDelayedCommit({
          delayMs: UNDO_WINDOW_MS,
          setTimer: (callback, delayMs) => window.setTimeout(callback, delayMs),
          clearTimer: (id) => window.clearTimeout(id),
          commit: () => {
            toggle.mutate(
              { productId, save: next },
              { onError: (error) => {
                setSaved(!next);
                toast.error(errorMessage(error));
              } },
            );
          },
        });
        pending.current = armed;
        toast.success(next ? t("saved") : t("removed"), {
          action: {
            label: tCommon("undo"),
            onClick: () => {
              if (!armed.undo()) return;
              setSaved(!next);
            },
          },
        });
      }}
      className={cn(
        "relative inline-flex size-9 items-center justify-center rounded-full border border-border bg-surface-elevated/95 text-muted-foreground shadow-sm backdrop-blur-sm transition-colors",
        saved && "border-danger/30 text-danger",
        className,
      )}
    >
      <span ref={burstRef} aria-hidden className="pointer-events-none absolute inset-0">
        {Array.from({ length: BURST }, (_, index) => (
          <span key={index} className="absolute left-1/2 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-danger opacity-0" />
        ))}
      </span>
      <AnimatedHeartIcon filled={saved} pulsing={pulse} />
    </button>
  );
}
