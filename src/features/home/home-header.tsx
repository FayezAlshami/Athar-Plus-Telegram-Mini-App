"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { BellSimple, Star } from "@phosphor-icons/react";
import { StatusAvatar } from "@/components/shared/status-avatar";
import { LevelSeal } from "@/components/shared/level-seal";
import { useAuth } from "@/features/auth/auth-provider";
import { useNotifications } from "@/features/notifications/queries";
import { duration } from "@/lib/animation/tokens";
import { useSyriaGreetingPeriod, type GreetingPeriod } from "./use-syria-greeting";

const ROTATE_MS = 6000;

function phrasesFor(period: GreetingPeriod, t: ReturnType<typeof useTranslations<"home">>): string[] {
  if (period === "morning") return [t("greetings.morning.a"), t("greetings.morning.b"), t("greetings.morning.c")];
  if (period === "afternoon") return [t("greetings.afternoon.a"), t("greetings.afternoon.b"), t("greetings.afternoon.c")];
  if (period === "evening") return [t("greetings.evening.a"), t("greetings.evening.b"), t("greetings.evening.c")];
  return [t("greetings.night.a"), t("greetings.night.b"), t("greetings.night.c")];
}

function RotatingPhrase({ period }: { period: GreetingPeriod }) {
  const t = useTranslations("home");
  const reduce = useReducedMotion();
  const phrases = phrasesFor(period, t);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [period]);

  useEffect(() => {
    if (reduce || phrases.length < 2) return;
    const id = window.setInterval(() => setIndex((current) => (current + 1) % phrases.length), ROTATE_MS);
    return () => window.clearInterval(id);
  }, [reduce, phrases.length, period]);

  const text = phrases[index] ?? "";

  return (
    <p className="relative h-5 overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={text}
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -6 }}
          transition={{ duration: duration.normal }}
          className="absolute inset-x-0 truncate text-caption text-muted-foreground"
        >
          {text}
        </motion.span>
      </AnimatePresence>
    </p>
  );
}

export function HomeHeader() {
  const t = useTranslations();
  const { user } = useAuth();
  const notifications = useNotifications();
  const period = useSyriaGreetingPeriod();
  const unread = notifications.data?.pages[0]?.meta.unread_count ?? 0;
  const name = user?.first_name ?? "";

  return (
    <header className="flex items-center gap-3">
      <Link href="/profile" aria-label={t("nav.profile")} className="shrink-0 rounded-full active:scale-95">
        <StatusAvatar name={name || "A"} src={user?.photo_url} availableLabel={t("home.available")} />
      </Link>
      <div className="min-w-0 flex-1">
        <p className="text-caption font-medium tracking-wide text-muted-foreground">{t("home.welcome")}</p>
        <span className="flex min-w-0 items-center gap-1.5">
          <h1 dir="auto" className="truncate font-display text-[1.35rem] font-semibold leading-tight text-foreground">
            {name}
          </h1>
          {user && (
            <Link href="/membership" className="shrink-0 rounded-full active:scale-90">
              <LevelSeal level={user.membership.level} size={20} />
            </Link>
          )}
          {user?.telegram_is_premium && <Star className="size-4 shrink-0 text-gold" weight="fill" aria-label={t("profile.telegramPremium")} />}
        </span>
        <RotatingPhrase period={period} />
      </div>
      <Link
        href="/notifications"
        aria-label={unread > 0 ? `${t("nav.notifications")} (${unread})` : t("nav.notifications")}
        className="relative flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-surface-elevated shadow-sm transition-transform active:scale-95"
      >
        <BellSimple className="size-[22px]" weight={unread > 0 ? "fill" : "regular"} />
        <AnimatePresence>
          {unread > 0 && (
            <motion.span
              key={unread}
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.4, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 24 }}
              className="absolute -top-1 -end-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[11px] font-semibold leading-none text-white ring-2 ring-background"
            >
              {unread > 99 ? "99+" : unread}
            </motion.span>
          )}
        </AnimatePresence>
      </Link>
    </header>
  );
}
