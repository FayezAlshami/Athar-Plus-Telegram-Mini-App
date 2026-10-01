"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { LottieSvg } from "lottie-react";
import { cn } from "@/lib/cn";
import { notoAnimatedEmojiUrl } from "@/lib/media/noto-animated-emoji";

/** Google Noto Animated Emoji (Lottie) with a static glyph fallback. */
export function NotoAnimatedEmoji({
  code,
  glyph,
  size = 32,
  className,
  pulse = false,
}: {
  code: string;
  glyph: string;
  size?: number;
  className?: string;
  /** Gentle bob for section headers (e.g. 🔥 beside «خدمات مميزة»). */
  pulse?: boolean;
}) {
  const reduce = useReducedMotion();
  const [failed, setFailed] = useState(false);

  const body =
    reduce || failed ? (
      <span aria-hidden className="leading-none" style={{ fontSize: size * 0.88 }}>
        {glyph}
      </span>
    ) : (
      <>
        <span aria-hidden className="pointer-events-none absolute leading-none opacity-35" style={{ fontSize: size * 0.88 }}>
          {glyph}
        </span>
        <LottieSvg
          src={notoAnimatedEmojiUrl(code)}
          autoplay
          loop
          className="relative size-full"
          style={{ width: size, height: size }}
          subscriptions={{
            error: () => setFailed(true),
          }}
        />
      </>
    );

  return (
    <motion.span
      className={cn("relative inline-flex shrink-0 items-center justify-center overflow-visible", className)}
      style={{ width: size, height: size }}
      aria-hidden
      animate={pulse && !reduce ? { y: [0, -3, 0], scale: [1, 1.06, 1] } : undefined}
      transition={pulse && !reduce ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" } : undefined}
    >
      {body}
    </motion.span>
  );
}
