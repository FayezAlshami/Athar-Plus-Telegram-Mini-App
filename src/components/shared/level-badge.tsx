"use client";

import { useTranslations } from "next-intl";
import type { MembershipLevelCode } from "@/entities/membership/types";
import { Badge } from "@/components/ui/badge";
import { LevelSeal } from "./level-seal";

const LEVEL_TONE = { normal: "neutral", essential: "accent", plus: "gold" } as const;

/** Seal plus level name, for places that compare levels side by side. */
export function LevelBadge({ level }: { level: MembershipLevelCode }) {
  const t = useTranslations("membership.level");
  return (
    <Badge tone={LEVEL_TONE[level]} icon={<LevelSeal level={level} size={16} decorative />} className="ps-1.5 font-semibold [&_svg]:size-4">
      {t(level)}
    </Badge>
  );
}
