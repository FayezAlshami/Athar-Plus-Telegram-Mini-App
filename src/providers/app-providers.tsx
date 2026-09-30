"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { MotionConfig } from "motion/react";
import { AuthProvider } from "@/features/auth/auth-provider";
import { useTelegramDialogs } from "@/lib/telegram/hooks";
import { bindNetworkAlert } from "@/lib/telegram/telegram-network-alert";
import { TelegramProvider } from "@/lib/telegram/telegram-provider";
import { QueryProvider } from "./query-provider";
import { ThemeProvider } from "./theme-provider";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import { AppToaster } from "@/components/ui/toast";

function NetworkAlertBridge() {
  const t = useTranslations();
  const dialogs = useTelegramDialogs();
  const alertRef = useRef(dialogs.alert);
  useEffect(() => {
    alertRef.current = dialogs.alert;
  });

  useEffect(() => {
    bindNetworkAlert(() => {
      void alertRef.current(t("common.offlineAction"));
    });
    return () => bindNetworkAlert(null);
  }, [t]);

  return null;
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <TelegramProvider>
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              <NetworkAlertBridge />
              {children}
              <AppToaster />
              <ServiceWorkerRegister />
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </TelegramProvider>
    </MotionConfig>
  );
}
