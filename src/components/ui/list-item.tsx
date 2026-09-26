"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { CaretRight } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";

interface ListItemProps {
  icon?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  trailing?: ReactNode;
  href?: string;
  onClick?: () => void;
  showChevron?: boolean;
}

export function ListItem({ icon, title, subtitle, trailing, href, onClick, showChevron = Boolean(href) }: ListItemProps) {
  const content = (
    <>
      {icon && (
        <span className="flex size-10 shrink-0 items-center justify-center rounded-sm bg-surface-sunken text-foreground [&_svg]:size-5">{icon}</span>
      )}
      <span className="min-w-0 flex-1 text-start">
        <span className="block truncate text-card-title">{title}</span>
        {subtitle && <span className="block truncate text-small text-muted-foreground">{subtitle}</span>}
      </span>
      {trailing}
      {showChevron && <CaretRight aria-hidden className="size-4 shrink-0 text-muted-foreground rtl:-scale-x-100" />}
    </>
  );

  const classes = cn("flex min-h-[60px] w-full items-center gap-3 px-4 py-2.5 transition-colors active:bg-muted/60");

  if (href) return <Link href={href} className={classes}>{content}</Link>;
  if (onClick) return <button type="button" onClick={onClick} className={classes}>{content}</button>;
  return <div className={classes}>{content}</div>;
}

export function ListGroup({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface", className)}>{children}</div>;
}
