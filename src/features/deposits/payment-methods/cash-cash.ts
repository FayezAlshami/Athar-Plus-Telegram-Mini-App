import { Money } from "@phosphor-icons/react";
import type { PaymentMethodModule } from "./types";
import { ShamCashDepositForm } from "./sham-cash-deposit-form";

/** Sham Cash (شام كاش). The customer enters an operation number; the server verifies it. */
export const cashCashModule: PaymentMethodModule = {
  code: "cash_cash",
  icon: Money,
  DepositForm: ShamCashDepositForm,
};
