"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { TelegramLogo, WarningCircle } from "@phosphor-icons/react";
import { useAuth } from "@/features/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { ButterflyLoader } from "@/components/shared/butterfly-loader";
import { EmptyState } from "@/components/shared/empty-state";

const BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;

function Splash() {
  const t = useTranslations();
  return (
    <div className="flex min-h-[var(--app-height)] flex-col items-center justify-center gap-3 overflow-hidden" role="status">
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: "easeOut" }}>
        <ButterflyLoader />
      </motion.div>
      <motion.p
        className="font-display text-xl font-semibold"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
      >
        {t("app.name")}
      </motion.p>
      <motion.p
        className="text-small text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.45 }}
      >
        {t("gate.connecting")}
      </motion.p>
      <motion.div
        className="relative mt-1 h-1 w-28 overflow-hidden rounded-full bg-muted"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <motion.span
          className="absolute inset-y-0 w-1/2 rounded-full bg-gradient-to-l from-accent to-primary"
          animate={{ x: ["-110%", "210%"] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
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
      ) : status === "write_access_required" ? (
        <EmptyState
          icon={<TelegramLogo weight="fill" />}
          title={t("gate.writeAccessTitle")}
          body={t("gate.writeAccessBody")}
          action={<Button variant="accent" onClick={retry}>{t("gate.allowBot")}</Button>}
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
