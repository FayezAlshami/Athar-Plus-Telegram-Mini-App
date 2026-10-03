import type { Icon } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import { paymentMethodModule } from "./payment-methods/registry";

/** Stable same-origin icons. The service worker and HTTP cache keep them on the phone. */
const BRAND_ICON: Record<string, string> = {
  cash_cash: "/payments/sham-cash.jpg",
  syriatel_cash: "/payments/syriatel.png",
  mtn_cash: "/payments/mtn.jpg",
  binance: "/payments/binance.jpg",
};

export function PaymentMethodMark({ code, className }: { code: string; className?: string }) {
  const src = BRAND_ICON[code];
  if (src) {
    return (
      <img
        src={src}
        alt=""
        width={96}
        height={96}
        decoding="async"
        className={cn("size-12 shrink-0 rounded-md object-cover", className)}
      />
    );
  }

  const Icon = paymentMethodModule(code).icon as Icon;
  return (
    <span className={cn("flex size-12 shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent", className)}>
      <Icon className="size-6" weight="duotone" />
    </span>
  );
}
