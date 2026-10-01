"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Clock, Gift, Plus } from "@phosphor-icons/react";
import type { Wallet } from "@/entities/wallet/types";
import { Money } from "@/components/shared/money";
import { Skeleton } from "@/components/ui/skeleton";
import { spring } from "@/lib/animation/tokens";
import { cn } from "@/lib/cn";
import { BalanceMoodEmoji } from "./balance-mood-emoji";

const actionClass =
  "flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-md text-button transition-transform active:scale-[0.98]";

/** Balance card: label → amount → deposit (primary) + gift code (secondary). */
export function WalletCard({ wallet, compact = false }: { wallet: Wallet | undefined; compact?: boolean }) {
  const t = useTranslations("wallet");

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring.entrance}
      aria-label={t("balance")}
      className={cn(
        "rounded-xl bg-[image:var(--wallet-card-gradient)] text-white shadow-md",
        compact ? "p-4" : "p-5",
      )}
    >
      <div className="flex flex-col gap-1">
        <p className="text-caption font-medium text-white/75">{t("balance")}</p>
        {wallet ? (
          <div className="mt-0.5 flex items-center gap-2" dir="ltr">
            <Money
              amountMinor={wallet.balance_minor}
              currency={wallet.currency}
              className="font-display text-[2.125rem] leading-none tracking-tight text-white sm:text-[2.375rem]"
            />
            <BalanceMoodEmoji amountMinor={wallet.balance_minor} compact={compact} />
          </div>
        ) : (
          <Skeleton className="mt-1 h-10 w-36 max-w-[70%] rounded-sm bg-white/15" aria-hidden />
        )}
      </div>

      {wallet && wallet.pending_deposits.count > 0 && (
        <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-caption text-white/90">
          <Clock className="size-3.5 shrink-0" aria-hidden />
          {t("pendingDeposits", { count: wallet.pending_deposits.count })}
        </p>
      )}

      <div className={cn("flex gap-2.5", wallet?.pending_deposits.count ? "mt-4" : "mt-5")}>
        <Link href="/wallet/deposit" className={cn(actionClass, "bg-white text-[#0f2a55] shadow-sm")}>
          <Plus weight="bold" className="size-4 shrink-0" aria-hidden />
          {t("deposit")}
        </Link>
        <Link
          href="/gift-codes"
          className={cn(actionClass, "border border-white/30 bg-white/10 text-white backdrop-blur-[2px]")}
        >
          <Gift className="size-4 shrink-0" aria-hidden />
          {t("giftCode")}
        </Link>
      </div>
    </motion.section>
  );
}
