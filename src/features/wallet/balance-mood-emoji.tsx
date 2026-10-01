"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "motion/react";
import { LottieSvg, type LottieHandle } from "lottie-react";
import { useHaptics } from "@/lib/telegram/hooks";
import { cn } from "@/lib/cn";
import { moodFromBalance, notoLottieUrl, type BalanceMoodId } from "./balance-mood";

const TAP: Record<BalanceMoodId, { x?: number[]; y?: number[]; rotate: number[]; scale: number[] }> = {
  melted: { x: [0, -7, 7, -5, 5, 0], rotate: [0, -10, 10, 0], scale: [1, 0.92, 1] },
  pleading: { x: [0, -6, 6, 0], y: [0, -4, 0], rotate: [0, -8, 8, 0], scale: [1, 1.08, 1] },
  teary: { y: [0, -10, 0], rotate: [0, -6, 6, 0], scale: [1, 1.18, 1] },
  smile: { y: [0, -12, 0], rotate: [0, 10, 0], scale: [1, 1.22, 1] },
  cool: { y: [0, -14, 0], rotate: [0, -12, 8, 0], scale: [1, 1.28, 1] },
  rich: { y: [0, -16, 0], rotate: [0, 14, -8, 0], scale: [1, 1.34, 1] },
  star: { y: [0, -18, 0], rotate: [0, -16, 16, 0], scale: [1, 1.4, 1] },
  party: { y: [0, -20, 0], rotate: [0, 18, -14, 0], scale: [1, 1.46, 1] },
};

/** Animated Noto emoji beside the balance. Tapping it replays the clip and gives a little bounce. */
export function BalanceMoodEmoji({ amountMinor, compact = false }: { amountMinor: number; compact?: boolean }) {
  const t = useTranslations("wallet");
  const reduce = useReducedMotion();
  const haptics = useHaptics();
  const lottieRef = useRef<LottieHandle>(null);
  const [pokes, setPokes] = useState(0);
  const mood = moodFromBalance(amountMinor);
  const size = compact ? 36 : 44;
  const label = t(`mood.${mood.id}`);

  const poke = () => {
    haptics.impact(mood.haptic);
    lottieRef.current?.seek(0);
    lottieRef.current?.play();
    setPokes((count) => count + 1);
  };

  return (
    <motion.button
      type="button"
      aria-label={label}
      title={label}
      onClick={poke}
      animate={
        reduce
          ? undefined
          : pokes === 0
            ? { y: [0, -5, 0], rotate: [0, -5, 5, 0] }
            : TAP[mood.id]
      }
      transition={
        pokes === 0 && !reduce
          ? { duration: 2.8, repeat: Infinity, ease: "easeInOut" }
          : { duration: 0.55, ease: "easeOut" }
      }
      onAnimationComplete={() => {
        if (pokes > 0) setPokes(0);
      }}
      whileTap={reduce ? undefined : { scale: 1.12 }}
      className={cn(
        "relative -my-1 inline-flex shrink-0 items-center justify-center overflow-visible rounded-full outline-none",
        "focus-visible:ring-2 focus-visible:ring-white/80",
      )}
      style={{ width: size, height: size }}
    >
      {["rich", "star", "party"].includes(mood.id) && (
        <span aria-hidden className="pointer-events-none absolute inset-0 rounded-full bg-white/25 blur-md" />
      )}
      {reduce ? (
        <span aria-hidden className="relative leading-none" style={{ fontSize: size * 0.86 }}>
          {mood.glyph}
        </span>
      ) : (
        <>
          <span aria-hidden className="pointer-events-none absolute leading-none opacity-40" style={{ fontSize: size * 0.86 }}>
            {mood.glyph}
          </span>
          <LottieSvg
            lottieRef={lottieRef}
            src={notoLottieUrl(mood.code)}
            autoplay
            loop
            className="relative size-full"
            style={{ width: size, height: size }}
          />
        </>
      )}
    </motion.button>
  );
}
