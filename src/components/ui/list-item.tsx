"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { CaretRight } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";

export type ListItemTone = "neutral" | "accent" | "gold" | "danger" | "success";

const ICON_TONES: Record<ListItemTone, string> = {
  neutral: "bg-surface-sunken text-foreground",
  accent: "bg-accent-soft text-accent",
  gold: "bg-gold-soft text-gold",
  danger: "bg-danger-soft text-danger",
  success: "bg-success-soft text-success",
};

interface ListItemProps {
  icon?: ReactNode;
  iconTone?: ListItemTone;
  title: ReactNode;
  subtitle?: ReactNode;
  trailing?: ReactNode;
  href?: string;
  onClick?: () => void;
  showChevron?: boolean;
  /** Compact row with a rounded icon tile, used on the account page. */
  variant?: "default" | "settings";
}

export function ListItem({ icon, iconTone = "neutral", title, subtitle, trailing, href, onClick, showChevron = Boolean(href), variant = "default" }: ListItemProps) {
  const settings = variant === "settings";
  const content = (
    <>
      {icon && (
        <span className={cn("flex shrink-0 items-center justify-center [&_svg]:size-5", settings ? "size-[30px] rounded-[9px] [&_svg]:size-[18px]" : "size-10 rounded-sm", ICON_TONES[iconTone])}>{icon}</span>
      )}
      <span className="min-w-0 flex-1 text-start">
        <span className={cn("block truncate", settings ? "text-small font-medium" : "text-card-title")}>{title}</span>
        {subtitle && <span className="block truncate text-small text-muted-foreground">{subtitle}</span>}
      </span>
      {trailing}
      {showChevron && <CaretRight aria-hidden className="size-4 shrink-0 text-muted-foreground/70 rtl:-scale-x-100" />}
      {settings && <span aria-hidden className="settings-sep pointer-events-none absolute inset-x-0 bottom-0 h-px bg-border" style={{ insetInlineStart: icon ? "3.25rem" : "1rem" }} />}
    </>
  );

  const classes = cn(
    "relative flex w-full items-center gap-3 px-4 transition-colors duration-150",
    settings ? "min-h-[52px] py-2" : "min-h-[60px] py-2.5",
    (href || onClick) && "cursor-pointer active:bg-muted/70 hover:bg-muted/40",
  );

  if (href) return <Link href={href} className={classes}>{content}</Link>;
  if (onClick) return <button type="button" onClick={onClick} className={classes}>{content}</button>;
  return <div className={classes}>{content}</div>;
}

export function ListGroup({ children, className, inset = false }: { children: ReactNode; className?: string; inset?: boolean }) {
  return (
    <div className={cn("overflow-hidden rounded-lg border border-border bg-surface shadow-sm", inset ? "[&>*:last-child_.settings-sep]:hidden" : "divide-y divide-border", className)}>
      {children}
    </div>
  );
}
