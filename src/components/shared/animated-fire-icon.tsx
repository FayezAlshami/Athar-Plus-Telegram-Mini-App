"use client";

import { useReducedMotion } from "motion/react";
import { LottieSvg } from "lottie-react";
import { cn } from "@/lib/cn";
import { notoAnimatedEmojiUrl } from "@/lib/media/noto-animated-emoji";

const FIRE = "1f525";

/** Looping 🔥 from Google Noto Animated Emoji — used beside «خدمات مميزة». */
export function AnimatedFireIcon({ className }: { className?: string }) {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <span className={cn("inline-flex size-7 shrink-0 items-center justify-center text-[1.35rem] leading-none", className)} aria-hidden>
        🔥
      </span>
    );
  }

  return (
    <span className={cn("relative inline-flex size-8 shrink-0", className)} aria-hidden>
      <LottieSvg src={notoAnimatedEmojiUrl(FIRE)} autoplay loop className="size-full" />
    </span>
  );
}
