"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { TelegramLogo, WarningCircle } from "@phosphor-icons/react";
import { useAuth } from "@/features/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { ButterflyMark } from "@/components/shared/butterfly";
import { EmptyState } from "@/components/shared/empty-state";

const BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;

function Splash() {
  const t = useTranslations();
  return (
    <div className="flex min-h-[var(--app-height)] flex-col items-center justify-center gap-4" role="status">
      <motion.div
        className="text-accent"
        animate={{ opacity: [0.55, 1, 0.55], scale: [0.97, 1, 0.97] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <ButterflyMark className="size-14" />
      </motion.div>
      <p className="font-display text-lg font-semibold">{t("app.name")}</p>
      <p className="text-small text-muted-foreground">{t("gate.connecting")}</p>
    </div>
  );
}

export function AuthGate({ children }: { children: ReactNode }) {
  const { status, retry } = useAuth();
  const t = useTranslations();

  if (status === "authenticated") return <>{children}</>;
  if (status === "authenticating") return <Splash />;

  return (
    <div className="mx-auto flex min-h-[var(--app-height)] max-w-sm flex-col justify-center px-4">
      {status === "unavailable" ? (
        <EmptyState
          icon={<TelegramLogo weight="fill" />}
          title={t("gate.openInTelegramTitle")}
          body={t("gate.openInTelegramBody")}
          action={
            BOT_USERNAME && (
              <Button variant="accent" onClick={() => window.location.assign(`https://t.me/${BOT_USERNAME}`)}>
                {t("gate.openBot")}
              </Button>
            )
          }
        />
      ) : (
        <EmptyState
          icon={<WarningCircle />}
          title={t("gate.failedTitle")}
          body={t("gate.failedBody")}
          action={<Button onClick={retry}>{t("common.retry")}</Button>}
        />
      )}
    </div>
  );
}
