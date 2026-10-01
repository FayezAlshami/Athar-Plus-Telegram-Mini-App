"use client";

import { NotoAnimatedEmoji } from "./noto-animated-emoji";

/** 🔥 beside «خدمات مميزة» — Google Noto Animated Emoji. */
export function AnimatedFireIcon({ className }: { className?: string }) {
  return <NotoAnimatedEmoji code="1f525" glyph="🔥" size={34} pulse className={className} />;
}
