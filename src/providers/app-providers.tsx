"use client";

import type { ReactNode } from "react";
import { MotionConfig } from "motion/react";
import { AuthProvider } from "@/features/auth/auth-provider";
import { TelegramProvider } from "@/lib/telegram/telegram-provider";
import { QueryProvider } from "./query-provider";
import { ThemeProvider } from "./theme-provider";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import { AppToaster } from "@/components/ui/toast";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <TelegramProvider>
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
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
