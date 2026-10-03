"use client";

import { NotoAnimatedEmoji } from "./noto-animated-emoji";

/** 🏆 beside «الأكثر طلبًا» — the same animated treatment as the featured fire. */
export function AnimatedTrophyIcon({ className }: { className?: string }) {
  return <NotoAnimatedEmoji code="1f3c6" glyph="🏆" size={34} pulse className={className} />;
}
