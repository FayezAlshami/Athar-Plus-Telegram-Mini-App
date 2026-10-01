import type { ReactNode } from "react";
import Link from "next/link";
import { CaretRight } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/cn";

export function Section({
  title,
  titleAdornment,
  action,
  tone = "title",
  children,
}: {
  title: string;
  titleAdornment?: ReactNode;
  action?: { label: string; href: string };
  /** `caption` is the small label used above settings groups. */
  tone?: "title" | "caption";
  children: ReactNode;
}) {
  return (
    <section className={cn("flex flex-col", tone === "caption" ? "gap-2" : "gap-3")}>
      <div className="flex items-center justify-between gap-3 px-1">
        <h2 className={cn("flex min-w-0 items-center gap-1.5", tone === "caption" ? "text-caption font-medium text-muted-foreground" : "text-section-title")}>
          {titleAdornment}
          <span className="truncate">{title}</span>
        </h2>
        {action && (
          <Link href={action.href} className="-me-1 inline-flex min-h-11 cursor-pointer items-center gap-1 rounded-full px-3 text-small font-medium text-accent transition-colors active:bg-accent-soft">
            {action.label}
            <CaretRight aria-hidden className="size-3.5 rtl:-scale-x-100" weight="bold" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
