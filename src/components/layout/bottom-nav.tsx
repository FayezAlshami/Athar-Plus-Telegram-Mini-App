"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { motion, useReducedMotion } from "motion/react";
import { spring } from "@/lib/animation/tokens";
import { prefetchPrimaryRoute } from "@/features/catalog/prefetch-primary-routes";
import { useHaptics } from "@/lib/telegram/hooks";
import { cn } from "@/lib/cn";
import { PRIMARY_DESTINATIONS } from "./navigation";

const INSET = 5;

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useTranslations("nav");
  const haptics = useHaptics();
  const reduce = useReducedMotion();
  const listRef = useRef<HTMLUListElement>(null);
  const [indicator, setIndicator] = useState<{ x: number; width: number } | null>(null);

  const warm = (href: string) => {
    router.prefetch(href);
    prefetchPrimaryRoute(queryClient, href);
  };

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const measure = () => {
      const item = list.querySelector<HTMLLIElement>("li[data-nav-active]");
      if (!item) {
        setIndicator(null);
        return;
      }
      // offsetLeft is measured from the list's padding edge — the same origin as the
      // indicator's `left: 0` — so it is exact in both LTR and RTL.
      setIndicator({
        x: item.offsetLeft + INSET,
        width: Math.max(item.offsetWidth - INSET * 2, 0),
      });
    };

    measure();
    const raf = requestAnimationFrame(measure);
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    const activeItem = list.querySelector("li[data-nav-active]");
    if (activeItem) observer.observe(activeItem);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [pathname]);

  return (
    <nav
      aria-label={t("primary")}
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,var(--safe-bottom))]"
    >
      <ul
        ref={listRef}
        className="pointer-events-auto relative mx-auto flex h-16 w-full max-w-[var(--content-max-width)] items-stretch overflow-hidden rounded-full border border-[var(--nav-glass-border)] bg-[var(--nav-glass)] p-1.5 shadow-[var(--nav-glass-shadow),inset_0_1px_0_var(--nav-glass-highlight)] backdrop-blur-2xl backdrop-saturate-150"
      >
        <span aria-hidden className="pointer-events-none absolute inset-x-8 top-px h-px bg-[var(--nav-glass-highlight)]" />
        {indicator && (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute bottom-1.5 left-0 top-1.5 rounded-full bg-[var(--nav-indicator)] shadow-[inset_0_1px_0_var(--nav-glass-highlight),0_8px_16px_-10px_color-mix(in_srgb,var(--accent)_65%,transparent)]"
            initial={false}
            animate={{ x: indicator.x, width: indicator.width }}
            transition={
              reduce
                ? { duration: 0 }
                : {
                    x: spring.interactive,
                    width: { type: "spring", stiffness: 260, damping: 26, mass: 0.8 },
                  }
            }
          />
        )}
        {PRIMARY_DESTINATIONS.map(({ href, labelKey, icon: Icon }) => {
          const active = pathname === href;
          return (
            <li key={href} data-nav-active={active ? "" : undefined} className="relative z-10 flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                onMouseEnter={() => !active && warm(href)}
                onTouchStart={() => !active && warm(href)}
                onClick={() => !active && haptics.selection()}
                className={cn(
                  "flex h-full flex-col items-center justify-center gap-0.5 rounded-full text-[11px] font-medium",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                <Icon className={cn("size-[22px]", active ? "text-accent" : "text-muted-foreground")} weight={active ? "fill" : "regular"} />
                <span className={cn("leading-none", active && "font-semibold")}>{t(labelKey)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
