"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "motion/react";
import { Heart } from "@phosphor-icons/react";
import { toast } from "@/components/ui/toast";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { useErrorMessage } from "@/lib/api/use-error-message";
import { useHaptics } from "@/lib/telegram/hooks";
import { cn } from "@/lib/cn";
import { useToggleFavorite } from "./queries";

const BURST = 8;

type FavoriteVariant = "overlay" | "plain";

/**
 * overlay — sits on product imagery (rail / detail).
 * plain — sits in list rows beside the content so it never covers the title.
 */
export function FavoriteToggle({
  productId,
  isFavorite,
  variant = "overlay",
  className,
}: {
  productId: number;
  isFavorite: boolean;
  variant?: FavoriteVariant;
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
  const [burst, setBurst] = useState(0);
  const reduce = useReducedMotion();
  const pending = useRef(0);

  const [syncedFavorite, setSyncedFavorite] = useState(isFavorite);
  if (syncedFavorite !== isFavorite) {
    setSyncedFavorite(isFavorite);
    setSaved(isFavorite);
  }

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
        const generation = pending.current + 1;
        pending.current = generation;
        setSaved(next);
        if (next) {
          setPulse(true);
          window.setTimeout(() => setPulse(false), 400);
          if (!reduce) setBurst((value) => value + 1);
          haptics.impact("light");
        }
        toggle.mutate(
          { productId, save: next },
          {
            onError: (error) => {
              if (pending.current !== generation) return;
              setSaved(!next);
              toast.error(errorMessage(error));
            },
          },
        );
        toast.success(next ? t("saved") : t("removed"), {
          action: {
            label: tCommon("undo"),
            onClick: () => {
              const undoGeneration = pending.current + 1;
              pending.current = undoGeneration;
              setSaved(!next);
              toggle.mutate(
                { productId, save: !next },
                {
                  onError: (error) => {
                    if (pending.current !== undoGeneration) return;
                    setSaved(next);
                    toast.error(errorMessage(error));
                  },
                },
              );
            },
          },
        });
      }}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center rounded-full transition-transform",
        pulse && "scale-110",
        variant === "overlay" && "size-11 border border-white/25 bg-neutral-900/55 text-white shadow-md backdrop-blur-sm",
        variant === "plain" && "size-10 border border-border bg-surface-elevated text-muted-foreground shadow-sm hover:bg-surface-sunken hover:text-foreground",
        saved && variant === "plain" && "border-danger/25 bg-danger/10 text-danger",
        className,
      )}
    >
      {burst > 0 && (
        <span key={burst} aria-hidden className="pointer-events-none absolute inset-0">
          {Array.from({ length: BURST }, (_, index) => {
            const angle = (index / BURST) * Math.PI * 2;
            return (
              <motion.span
                key={index}
                className={cn(
                  "absolute left-1/2 top-1/2 -ml-[3px] -mt-[3px] size-1.5 rounded-full",
                  variant === "plain" ? "bg-danger" : "bg-white",
                )}
                initial={{ x: 0, y: 0, scale: 0.3, opacity: 1 }}
                animate={{ x: Math.cos(angle) * 16, y: Math.sin(angle) * 16, scale: 1, opacity: 0 }}
                transition={{ duration: 0.48, ease: [0.2, 0, 0, 1] }}
              />
            );
          })}
        </span>
      )}
      <Heart
        className={cn(
          "size-[18px]",
          saved ? "text-danger" : variant === "overlay" ? "text-white drop-shadow-sm" : "text-current",
        )}
        weight="fill"
      />
    </button>
  );
}
