export interface AppNotification {
  id: number;
  type: "order_status" | "deposit_status" | "gift_code_redeemed" | "membership_changed" | "promotion";
  title: string;
  body: string | null;
  data: Record<string, string>;
  read_at: string | null;
  created_at: string;
}
