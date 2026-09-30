"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { useNotifyTelegramReady, useTelegramBackButton } from "@/lib/telegram/hooks";
import { useTelegramActive } from "@/lib/telegram/telegram-provider";
import { useScrollRestoration } from "@/hooks/use-scroll-restoration";
import { AuthGate } from "./auth-gate";
import { useGoBack } from "./back-button";
import { BackToTop } from "./back-to-top";
import { BottomNav } from "./bottom-nav";
import { OfflineBanner } from "./offline-banner";
import { isPrimaryDestination } from "./navigation";

function useResumeRefresh() {
  const active = useTelegramActive();
  const queryClient = useQueryClient();
  const wasInactive = useRef(false);

  useEffect(() => {
    if (!active) {
      wasInactive.current = true;
      return;
    }
    if (!wasInactive.current) return;
    wasInactive.current = false;
    void queryClient.invalidateQueries({ queryKey: queryKeys.wallet });
    void queryClient.invalidateQueries({ queryKey: queryKeys.ordersRoot });
    void queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
  }, [active, queryClient]);
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isPrimary = isPrimaryDestination(pathname);
  const goBack = useGoBack();
  useScrollRestoration();
  useNotifyTelegramReady();
  useResumeRefresh();

  useTelegramBackButton(pathname !== "/", goBack);

  return (
    <AuthGate>
      <OfflineBanner />
      {children}
      <BackToTop />
      {isPrimary && <BottomNav />}
    </AuthGate>
  );
}
