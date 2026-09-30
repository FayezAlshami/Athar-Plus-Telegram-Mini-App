"use client";

import type { ReactNode } from "react";
import { useScrolled } from "@/hooks/use-scrolled";
import { cn } from "@/lib/cn";

/**
 * Top bar that stays reachable while the page scrolls. It absorbs the page's
 * top padding (safe area included) so it sits flush under the Telegram chrome,
 * and paints a full-bleed frosted backdrop with a hairline once content moves under it.
 */
export function StickyTopBar({ children, className }: { children: ReactNode; className?: string }) {
  const scrolled = useScrolled();

  return (
    <div
      className={cn(
        "sticky top-0 z-30 -mt-[calc(var(--safe-top)+12px)] -mb-3 pt-[calc(var(--safe-top)+12px)] pb-3",
        "before:pointer-events-none before:absolute before:inset-y-0 before:left-1/2 before:-z-10 before:w-screen before:-translate-x-1/2",
        "before:border-b before:bg-background/85 before:backdrop-blur-xl before:backdrop-saturate-150 before:transition-colors before:duration-200",
        scrolled ? "before:border-border" : "before:border-transparent",
        className,
      )}
    >
      {children}
    </div>
  );
}
