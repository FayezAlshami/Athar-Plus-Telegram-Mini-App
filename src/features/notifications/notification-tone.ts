import type { AppNotification, NotificationTone } from "@/entities/notification/types";

const FAILURE = new Set(["rejected", "cancelled", "failed"]);
const SUCCESS = new Set(["completed", "approved"]);
const PENDING = new Set(["pending", "confirmed", "processing"]);

/** Same rules as the API tone: stored status first, then notification type. Title and body are ignored. */
export function notificationTone(notification: Pick<AppNotification, "type" | "data" | "tone">): NotificationTone {
  if (notification.tone) return notification.tone;

  const status = notification.data?.status;
  if (status && FAILURE.has(status)) return "danger";
  if (status && SUCCESS.has(status)) return "success";
  if (status && PENDING.has(status)) return "warning";

  if (notification.type === "deposit_status" || notification.type === "gift_code_redeemed" || notification.type === "membership_changed") {
    return "success";
  }

  return "info";
}

export const NOTIFICATION_TONE_CLASS = {
  danger: {
    card: "border-danger/25 bg-danger-soft",
    icon: "bg-danger text-white dark:bg-danger/25 dark:text-danger",
    dot: "bg-danger",
  },
  success: {
    card: "border-success/25 bg-success-soft",
    icon: "bg-success text-white dark:bg-success/25 dark:text-success",
    dot: "bg-success",
  },
  warning: {
    card: "border-warning/30 bg-warning-soft",
    icon: "bg-warning text-white dark:bg-warning/25 dark:text-warning",
    dot: "bg-warning",
  },
  info: {
    card: "border-info/25 bg-info-soft",
    icon: "bg-info text-white dark:bg-info/25 dark:text-info",
    dot: "bg-info",
  },
} as const;
