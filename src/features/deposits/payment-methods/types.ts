import type { ComponentType } from "react";
import type { Icon } from "@phosphor-icons/react";
import type { PaymentMethod } from "@/entities/wallet/types";

/**
 * Frontend counterpart of a backend PaymentMethod. Each method lives in its own
 * module; adding a method means adding a module and registering it — no switch.
 */
export interface PaymentMethodModule {
  code: string;
  icon: Icon;
  /** Method-specific deposit experience. Rendered only when the backend marks the method available. */
  DepositForm: ComponentType<{ method: PaymentMethod }>;
}
