import { Bank } from "@phosphor-icons/react";
import type { PaymentMethodModule } from "./types";
import { cashCashModule } from "./cash-cash";
import { usdtModule } from "./usdt";
import { GenericDepositForm } from "./generic-deposit-form";

const MODULES: Record<string, PaymentMethodModule> = Object.fromEntries(
  [cashCashModule, usdtModule].map((module) => [module.code, module]),
);

const FALLBACK_MODULE: Omit<PaymentMethodModule, "code"> = { icon: Bank, DepositForm: GenericDepositForm };

export function paymentMethodModule(code: string): PaymentMethodModule {
  return MODULES[code] ?? { code, ...FALLBACK_MODULE };
}
