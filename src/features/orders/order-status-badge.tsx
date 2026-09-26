"use client";

import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import type { OrderStatus } from "@/entities/order/types";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { duration } from "@/lib/animation/tokens";

const STATUS_TONE: Record<OrderStatus, BadgeTone> = {
  pending: "warning",
  confirmed: "accent",
  processing: "accent",
  completed: "success",
  cancelled: "neutral",
  rejected: "danger",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const t = useTranslations("orders.status");
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span key={status} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: duration.fast }}>
        <Badge tone={STATUS_TONE[status]}>{t(status)}</Badge>
      </motion.span>
    </AnimatePresence>
  );
}
