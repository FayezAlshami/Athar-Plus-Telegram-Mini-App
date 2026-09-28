import type { ReactNode } from "react";
import Link from "next/link";
import { CaretRight } from "@phosphor-icons/react/dist/ssr";

export function Section({ title, action, children }: { title: string; action?: { label: string; href: string }; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3 px-1">
        <h2 className="text-section-title">{title}</h2>
        {action && (
          <Link href={action.href} className="-me-1 inline-flex h-8 items-center gap-0.5 rounded-full px-2 text-small font-medium text-accent transition-colors active:bg-accent-soft">
            {action.label}
            <CaretRight aria-hidden className="size-3.5 rtl:-scale-x-100" weight="bold" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
