"use client";

import { motion } from "motion/react";
import { BellSimple, Crown, Gift, Megaphone, Receipt, Trash, Wallet, type Icon } from "@phosphor-icons/react";
import type { AppNotification } from "@/entities/notification/types";
import type { Locale } from "@/lib/i18n/config";
import { directionOf } from "@/lib/i18n/config";
import { formatRelative } from "@/lib/formatting/dates";
import { fadeUp } from "@/lib/animation/variants";
import { cn } from "@/lib/cn";
import { NOTIFICATION_TONE_CLASS, notificationTone } from "./notification-tone";
import { shouldDismissNotification } from "./notification-swipe";

const TYPE_ICON: Record<AppNotification["type"], Icon> = {
  order_status: Receipt,
  deposit_status: Wallet,
  gift_code_redeemed: Gift,
  membership_changed: Crown,
  promotion: Megaphone,
  admin_message: BellSimple,
};

const SWIPE_LIMIT = 88;

export function NotificationRow({
  notification,
  locale,
  dismissLabel,
  onDismiss,
}: {
  notification: AppNotification;
  locale: Locale;
  dismissLabel: string;
  onDismiss: (notification: AppNotification) => void;
}) {
  const Icon = TYPE_ICON[notification.type] ?? BellSimple;
  const tone = NOTIFICATION_TONE_CLASS[notificationTone(notification)];
  const direction = directionOf(locale);
  const unread = !notification.read_at;

  return (
    <motion.li variants={fadeUp} className="relative overflow-hidden rounded-lg">
      <div className="absolute inset-0 flex items-center justify-end rounded-lg bg-danger px-5 text-white" aria-hidden>
        <Trash className="size-5" weight="bold" />
      </div>
      <motion.div
        drag="x"
        dragConstraints={{ left: direction === "rtl" ? 0 : -SWIPE_LIMIT, right: direction === "rtl" ? SWIPE_LIMIT : 0 }}
        dragElastic={0.12}
        dragSnapToOrigin
        dragDirectionLock
        onDragEnd={(_, info) => {
          if (shouldDismissNotification(info.offset.x, direction)) onDismiss(notification);
        }}
        className={cn("relative z-10 flex gap-3 border p-4 shadow-sm", tone.card)}
      >
        <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-md", tone.icon)}>
          <Icon className="size-5" weight="duotone" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p className="min-w-0 break-words text-card-title text-foreground" dir="auto">{notification.title}</p>
            <span className="flex shrink-0 items-center gap-1.5 pt-0.5 text-caption text-muted-foreground">
              {formatRelative(notification.created_at, locale)}
              {unread && <span aria-hidden className={cn("size-2 rounded-full", tone.dot)} />}
            </span>
          </div>
          {notification.body && <p className="mt-1 whitespace-pre-line break-words text-small text-muted-foreground" dir="auto">{notification.body}</p>}
        </div>
        <button type="button" className="sr-only" onClick={() => onDismiss(notification)}>{dismissLabel}</button>
      </motion.div>
    </motion.li>
  );
}
