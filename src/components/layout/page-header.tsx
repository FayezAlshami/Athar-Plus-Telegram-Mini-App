"use client";

import type { ReactNode } from "react";
import { BackButton } from "./back-button";

/** Title row with a back control on every screen, including inside Telegram. */
export function PageHeader({ title, showBack = true, trailing }: { title: string; showBack?: boolean; trailing?: ReactNode }) {
  return (
    <header className="flex min-h-11 items-center gap-3">
      {showBack && <BackButton />}
      <h1 className="min-w-0 flex-1 truncate text-page-title">{title}</h1>
      {trailing}
    </header>
  );
}
