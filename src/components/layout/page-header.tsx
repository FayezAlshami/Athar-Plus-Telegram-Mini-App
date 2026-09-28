"use client";

import type { ReactNode } from "react";
import { BackButton } from "./back-button";

/** Title row with a back control on every screen, including inside Telegram. */
export function PageHeader({ title, subtitle, showBack = true, trailing }: { title: string; subtitle?: string; showBack?: boolean; trailing?: ReactNode }) {
  return (
    <header className="flex min-h-11 items-center gap-3">
      {showBack && <BackButton />}
      <div className="min-w-0 flex-1">
        <h1 dir="auto" className="truncate text-page-title">{title}</h1>
        {subtitle && <p className="truncate text-caption text-muted-foreground">{subtitle}</p>}
      </div>
      {trailing}
    </header>
  );
}
