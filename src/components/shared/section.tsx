import type { ReactNode } from "react";
import Link from "next/link";

export function Section({ title, action, children }: { title: string; action?: { label: string; href: string }; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-section-title">{title}</h2>
        {action && (
          <Link href={action.href} className="text-small font-medium text-accent">
            {action.label}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
