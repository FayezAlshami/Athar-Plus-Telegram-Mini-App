/**
 * Analytics event names. No third-party service is integrated yet; `track`
 * is the single seam to connect one once approved.
 */
export type AnalyticsEvent =
  | "app_opened"
  | "search_performed"
  | "product_viewed"
  | "deposit_started"
  | "order_started"
  | "order_created"
  | "gift_code_redeemed"
  | "plus_viewed"
  | "theme_changed"
  | "language_changed";

export function track(event: AnalyticsEvent, properties: Record<string, string | number | boolean> = {}): void {
  if (process.env.NODE_ENV === "development") {
    console.debug("[analytics]", event, properties);
  }
}
