import type { HapticImpact } from "@/lib/telegram/adapter";

export type BalanceMoodId = "melted" | "pleading" | "teary" | "smile" | "cool" | "rich" | "star" | "party";

export interface BalanceMood {
  id: BalanceMoodId;
  /** Noto Animated Emoji hex codepoint, from Google Fonts. */
  code: string;
  glyph: string;
  haptic: HapticImpact;
}

const TIERS: { max: number; mood: BalanceMood }[] = [
  { max: 0, mood: { id: "melted", code: "1fae0", glyph: "🫠", haptic: "soft" } },
  { max: 99, mood: { id: "pleading", code: "1f97a", glyph: "🥺", haptic: "soft" } },
  { max: 499, mood: { id: "teary", code: "1f972", glyph: "🥲", haptic: "light" } },
  { max: 1999, mood: { id: "smile", code: "1f60a", glyph: "😊", haptic: "light" } },
  { max: 4999, mood: { id: "cool", code: "1f60e", glyph: "😎", haptic: "light" } },
  { max: 19999, mood: { id: "rich", code: "1f911", glyph: "🤑", haptic: "medium" } },
  { max: 99999, mood: { id: "star", code: "1f929", glyph: "🤩", haptic: "medium" } },
  { max: Number.POSITIVE_INFINITY, mood: { id: "party", code: "1f973", glyph: "🥳", haptic: "medium" } },
];

/** Picks a living emoji for the wallet: empty melts, a little cash pleads, a fat balance throws a party. */
export function moodFromBalance(amountMinor: number): BalanceMood {
  const amount = Number.isFinite(amountMinor) ? Math.max(0, Math.trunc(amountMinor)) : 0;
  return TIERS.find((tier) => amount <= tier.max)?.mood ?? TIERS[TIERS.length - 1].mood;
}

export { notoAnimatedEmojiUrl as notoLottieUrl } from "@/lib/media/noto-animated-emoji";
