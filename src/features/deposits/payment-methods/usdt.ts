import { CurrencyCircleDollar } from "@phosphor-icons/react";
import type { PaymentMethodModule } from "./types";
import { GenericDepositForm } from "./generic-deposit-form";

/** USDT. PENDING SPECIFICATION: networks, receiving addresses, transaction hash. */
export const usdtModule: PaymentMethodModule = {
  code: "usdt",
  icon: CurrencyCircleDollar,
  DepositForm: GenericDepositForm,
};
