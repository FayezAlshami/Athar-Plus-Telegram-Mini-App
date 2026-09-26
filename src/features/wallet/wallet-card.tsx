"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Clock, Gift, Plus } from "@phosphor-icons/react";
import type { Wallet } from "@/entities/wallet/types";
import { Money } from "@/components/shared/money";
import { Skeleton } from "@/components/ui/skeleton";
import { ButterflyMark } from "@/components/shared/butterfly";
import { spring } from "@/lib/animation/tokens";

/** High-trust balance card. `compact` is used on Home as an entry point to the wallet. */
export function WalletCard({ wallet, compact = false }: { wallet: Wallet | undefined; compact?: boolean }) {
  const t = useTranslations("wallet");

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring.entrance}
      className="relative overflow-hidden rounded-xl bg-[image:var(--hero-gradient)] p-5 text-white shadow-lg"
    >
      <ButterflyMark className="pointer-events-none absolute -end-4 -top-4 size-32 text-white/[0.06]" />
      <p className="text-small text-white/70">{t("balance")}</p>
      {wallet ? (
        <Money amountMinor={wallet.balance_minor} currency={wallet.currency} className="mt-1 block text-[2rem] leading-tight" />
      ) : (
        <Skeleton className="mt-2 h-9 w-32 bg-white/15" />
      )}
      {wallet && wallet.pending_deposits.count > 0 && (
        <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-caption">
          <Clock className="size-3.5" />
          {t("pendingDeposits", { count: wallet.pending_deposits.count })}
        </p>
      )}
      <div className="mt-5 flex gap-2">
        <Link
          href="/wallet/deposit"
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-white text-button text-[#0f2a55] transition-transform active:scale-[0.97]"
        >
          <Plus weight="bold" className="size-4" />
          {t("deposit")}
        </Link>
        {!compact && (
          <Link
            href="/gift-codes"
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-white/12 text-button text-white transition-transform active:scale-[0.97]"
          >
            <Gift className="size-4" />
            {t("giftCode")}
          </Link>
        )}
      </div>
    </motion.div>
  );
}
