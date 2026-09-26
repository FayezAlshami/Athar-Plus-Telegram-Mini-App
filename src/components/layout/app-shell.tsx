"use client";

import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTelegramBackButton } from "@/lib/telegram/hooks";
import { AuthGate } from "./auth-gate";
import { BottomNav } from "./bottom-nav";
import { isPrimaryDestination } from "./navigation";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isPrimary = isPrimaryDestination(pathname);

  useTelegramBackButton(!isPrimary, () => (window.history.length > 1 ? router.back() : router.push("/")));

  return (
    <AuthGate>
      {children}
      {isPrimary && <BottomNav />}
    </AuthGate>
  );
}
