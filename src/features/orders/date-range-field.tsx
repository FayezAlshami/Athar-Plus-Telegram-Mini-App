"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, CalendarBlank } from "@phosphor-icons/react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { controlClasses } from "@/components/ui/field";
import { cn } from "@/lib/cn";

function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function parseIso(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

function intlLocale(locale: string): string {
  return locale === "ar" ? "ar-u-nu-latn" : "en-GB";
}

export function DateRangeField({
  from,
  to,
  onChange,
}: {
  from: string;
  to: string;
  onChange: (next: { from: string; to: string }) => void;
}) {
  const t = useTranslations("orders");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(() => (from ? parseIso(from) : new Date()));
  const [draftFrom, setDraftFrom] = useState(from);
  const [draftTo, setDraftTo] = useState(to);

  const today = toIsoDate(new Date());
  const format = useMemo(
    () => new Intl.DateTimeFormat(intlLocale(locale), { day: "numeric", month: "short", year: "numeric" }),
    [locale],
  );
  const monthLabel = useMemo(
    () => new Intl.DateTimeFormat(intlLocale(locale), { month: "long", year: "numeric" }),
    [locale],
  );
  const weekdayLabels = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(intlLocale(locale), { weekday: "narrow" });
    const start = locale === "ar" ? 6 : 1;
    return Array.from({ length: 7 }, (_, index) => formatter.format(new Date(2024, 0, 7 + ((start + index) % 7))));
  }, [locale]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const weekStart = locale === "ar" ? 6 : 1;
  const leading = (firstWeekday - weekStart + 7) % 7;
  const days = new Date(year, month + 1, 0).getDate();

  const openSheet = () => {
    setDraftFrom(from);
    setDraftTo(to);
    setCursor(from ? parseIso(from) : new Date());
    setOpen(true);
  };

  const pick = (iso: string) => {
    if (iso > today) return;
    if (!draftFrom || (draftFrom && draftTo)) {
      setDraftFrom(iso);
      setDraftTo("");
      return;
    }
    const nextFrom = iso < draftFrom ? iso : draftFrom;
    const nextTo = iso < draftFrom ? draftFrom : iso;
    setDraftFrom(nextFrom);
    setDraftTo(nextTo);
    onChange({ from: nextFrom, to: nextTo });
    setOpen(false);
  };

  const trigger = (label: string, value: string) => (
    <button type="button" onClick={openSheet} className={cn(controlClasses, "flex h-12 items-center justify-between gap-2 text-start")}>
      <span className="min-w-0">
        <span className="block text-caption text-muted-foreground">{label}</span>
        <span className={cn("block truncate text-small", !value && "text-muted-foreground")}>
          {value ? format.format(parseIso(value)) : t("pickDate")}
        </span>
      </span>
      <CalendarBlank className="size-5 shrink-0 text-accent" />
    </button>
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-2">
        {trigger(t("from"), from)}
        {trigger(t("to"), to)}
      </div>
      <BottomSheet open={open} onOpenChange={setOpen} title={t("period")}>
        <div className="flex items-center justify-between pb-3">
          <button type="button" aria-label={t("previousMonth")} onClick={() => setCursor(new Date(year, month - 1, 1))} className="flex size-11 items-center justify-center rounded-full border border-border bg-surface transition-transform active:scale-95">
            <ArrowLeft className="size-4 rtl:-scale-x-100" />
          </button>
          <p className="text-card-title">{monthLabel.format(cursor)}</p>
          <button type="button" aria-label={t("nextMonth")} onClick={() => setCursor(new Date(year, month + 1, 1))} className="flex size-11 items-center justify-center rounded-full border border-border bg-surface transition-transform active:scale-95">
            <ArrowRight className="size-4 rtl:-scale-x-100" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-caption text-muted-foreground">
          {weekdayLabels.map((label, index) => <span key={`${label}-${index}`}>{label}</span>)}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1 pb-4">
          {Array.from({ length: leading }, (_, index) => <span key={`pad-${index}`} />)}
          {Array.from({ length: days }, (_, index) => {
            const iso = toIsoDate(new Date(year, month, index + 1));
            const disabled = iso > today;
            const start = iso === draftFrom;
            const end = iso === draftTo;
            const inRange = Boolean(draftFrom && draftTo && iso >= draftFrom && iso <= draftTo);
            return (
              <button
                key={iso}
                type="button"
                disabled={disabled}
                aria-label={format.format(parseIso(iso))}
                aria-pressed={start || end || inRange}
                aria-current={iso === today ? "date" : undefined}
                onClick={() => pick(iso)}
                className={cn(
                  "flex h-11 items-center justify-center rounded-full text-small tabular-nums transition-colors enabled:active:bg-muted",
                  inRange && "bg-accent-soft text-accent",
                  (start || end) && "bg-accent text-accent-foreground",
                  iso === today && !start && !end && "ring-1 ring-accent",
                  disabled && "text-muted-foreground/40",
                )}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
        <div className="flex gap-2 pb-2">
          <Button
            variant="secondary"
            fullWidth
            onClick={() => {
              setDraftFrom("");
              setDraftTo("");
              onChange({ from: "", to: "" });
              setOpen(false);
            }}
          >
            {t("clearPeriod")}
          </Button>
          <Button
            fullWidth
            onClick={() => {
              onChange({ from: draftFrom, to: draftTo || draftFrom });
              setOpen(false);
            }}
            disabled={!draftFrom}
          >
            {t("applyPeriod")}
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
}
