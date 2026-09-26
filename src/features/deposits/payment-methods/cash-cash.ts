import { Money } from "@phosphor-icons/react";
import type { PaymentMethodModule } from "./types";
import { GenericDepositForm } from "./generic-deposit-form";

/** Cash Cash (كاش كاش). PENDING SPECIFICATION: transfer details and required fields. */
export const cashCashModule: PaymentMethodModule = {
  code: "cash_cash",
  icon: Money,
  DepositForm: GenericDepositForm,
};
