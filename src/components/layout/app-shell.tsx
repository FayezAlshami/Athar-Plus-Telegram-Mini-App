"use client";

import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTelegramBackButton } from "@/lib/telegram/hooks";
import { useScrollRestoration } from "@/hooks/use-scroll-restoration";
import { AuthGate } from "./auth-gate";
import { BackToTop } from "./back-to-top";
import { BottomNav } from "./bottom-nav";
import { OfflineBanner } from "./offline-banner";
import { isPrimaryDestination } from "./navigation";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isPrimary = isPrimaryDestination(pathname);
  useScrollRestoration();

  useTelegramBackButton(!isPrimary, () => (window.history.length > 1 ? router.back() : router.push("/")));

  return (
    <AuthGate>
      <OfflineBanner />
      {children}
      <BackToTop />
      {isPrimary && <BottomNav />}
    </AuthGate>
  );
}
