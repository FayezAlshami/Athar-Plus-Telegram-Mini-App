"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { BackButton } from "./back-button";
import { isPrimaryDestination } from "./navigation";
import { StickyTopBar } from "./sticky-top-bar";

/**
 * Sticky title row. Inner screens get a back control (including inside Telegram);
 * bottom-nav tabs are roots and never show one.
 */
export function PageHeader({ title, subtitle, showBack, trailing }: { title: string; subtitle?: string; showBack?: boolean; trailing?: ReactNode }) {
  const pathname = usePathname();
  const withBack = showBack ?? !isPrimaryDestination(pathname);

  return (
    <StickyTopBar>
      <header className="flex min-h-11 items-center gap-3">
        {withBack && <BackButton />}
        <div className="min-w-0 flex-1">
          <h1 dir="auto" className="truncate text-page-title">{title}</h1>
          {subtitle && <p dir="auto" className="truncate text-caption text-muted-foreground">{subtitle}</p>}
        </div>
        {trailing && <div className="flex shrink-0 items-center gap-2">{trailing}</div>}
      </header>
    </StickyTopBar>
  );
}
