"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useTelegramBackButton } from "@/lib/telegram/hooks";
import { useScrollRestoration } from "@/hooks/use-scroll-restoration";
import { AuthGate } from "./auth-gate";
import { useGoBack } from "./back-button";
import { BackToTop } from "./back-to-top";
import { BottomNav } from "./bottom-nav";
import { OfflineBanner } from "./offline-banner";
import { isPrimaryDestination } from "./navigation";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isPrimary = isPrimaryDestination(pathname);
  const goBack = useGoBack();
  useScrollRestoration();

  useTelegramBackButton(true, goBack);

  return (
    <AuthGate>
      <OfflineBanner />
      {children}
      <BackToTop />
      {isPrimary && <BottomNav />}
    </AuthGate>
  );
}
