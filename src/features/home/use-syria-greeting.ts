"use client";

import { useEffect, useState } from "react";

export type GreetingPeriod = "morning" | "afternoon" | "evening" | "night";

/** Hour in Asia/Damascus, independent of the device timezone. */
export function syriaHour(date = new Date()): number {
  const hour = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Damascus",
    hour: "numeric",
    hourCycle: "h23",
  }).format(date);
  return Number(hour);
}

export function greetingPeriod(hour: number): GreetingPeriod {
  if (hour >= 5 && hour <= 11) return "morning";
  if (hour >= 12 && hour <= 16) return "afternoon";
  if (hour >= 17 && hour <= 20) return "evening";
  return "night";
}

/** Rechecks the Syria hour once a minute so a long session crosses periods. */
export function useSyriaGreetingPeriod(): GreetingPeriod {
  const [period, setPeriod] = useState<GreetingPeriod>(() => greetingPeriod(syriaHour()));

  useEffect(() => {
    const id = window.setInterval(() => setPeriod(greetingPeriod(syriaHour())), 60_000);
    return () => window.clearInterval(id);
  }, []);

  return period;
}
