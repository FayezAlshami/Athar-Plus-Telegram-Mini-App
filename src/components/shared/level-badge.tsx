"use client";

import { useTranslations } from "next-intl";
import { Crown, Leaf, UserCircle } from "@phosphor-icons/react";
import type { MembershipLevelCode } from "@/entities/membership/types";
import { Badge } from "@/components/ui/badge";

const LEVEL_TONE = { normal: "neutral", essential: "accent", plus: "gold" } as const;
const LEVEL_ICON = { normal: UserCircle, essential: Leaf, plus: Crown } as const;

export function LevelBadge({ level }: { level: MembershipLevelCode }) {
  const t = useTranslations("membership.level");
  const Icon = LEVEL_ICON[level];
  return (
    <Badge tone={LEVEL_TONE[level]} icon={<Icon weight="fill" />}>
      {t(level)}
    </Badge>
  );
}
