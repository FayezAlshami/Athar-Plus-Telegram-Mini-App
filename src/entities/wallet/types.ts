export interface Wallet {
  currency: string;
  balance_minor: number;
  pending_deposits: { count: number; amount_minor: number };
}

export type WalletTransactionType = "deposit" | "purchase" | "refund" | "gift_code" | "adjustment";

export interface WalletTransaction {
  id: string;
  type: WalletTransactionType;
  direction: "credit" | "debit";
  amount_minor: number;
  currency: string;
  balance_after_minor: number;
  status: string;
  created_at: string;
}

export type PaymentMethodAvailability = "available" | "pending_specification" | "disabled";

export interface PaymentMethod {
  code: string;
  name: string;
  description: string | null;
  icon: string | null;
  availability: PaymentMethodAvailability;
  min_amount_minor: number | null;
  max_amount_minor: number | null;
  instructions: Record<string, unknown>;
}

export type DepositStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface Deposit {
  id: string;
  payment_method: string;
  amount_minor: number;
  currency: string;
  status: DepositStatus;
  rejection_reason: string | null;
  created_at: string;
}

export interface GiftCodeRedemption {
  reward_type: string;
  amount_minor: number;
  currency: string;
  transaction: WalletTransaction;
}
