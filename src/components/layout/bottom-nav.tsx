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
import { useKeyboardOpen } from "@/hooks/use-keyboard-open";
import { cn } from "@/lib/cn";
import { useFixedBottomInset } from "./bottom-inset";
import { NavIcon } from "./nav-icon";
import { PRIMARY_DESTINATIONS, activeNavIndex, isNavDestinationActive, navTabElement } from "./navigation";

const INSET = 5;

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useTranslations("nav");
  const haptics = useHaptics();
  const reduce = useReducedMotion();
  const navRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const keyboardOpen = useKeyboardOpen();
  const activeIndex = activeNavIndex(pathname);
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

  useFixedBottomInset(navRef);

  const warm = (href: string) => {
    router.prefetch(href);
    prefetchPrimaryRoute(queryClient, href);
  };

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list || activeIndex < 0) {
      setIndicator(null);
      return;
    }

    const measure = () => {
      const item = navTabElement(list, activeIndex);
      if (!item) {
        setIndicator(null);
        return;
      }

      setIndicator({
        left: item.offsetLeft + INSET,
        width: Math.max(item.offsetWidth - INSET * 2, 0),
      });
    };

    measure();
    const raf = requestAnimationFrame(measure);
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    const item = navTabElement(list, activeIndex);
    if (item) observer.observe(item);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [pathname, activeIndex]);

  return (
    <nav
      ref={navRef}
      aria-label={t("primary")}
      inert={keyboardOpen}
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-0 z-40 ps-[max(0.75rem,var(--safe-left))] pe-[max(0.75rem,var(--safe-right))] pb-[max(0.75rem,var(--safe-bottom))]",
        "transition-[translate,opacity] duration-300 ease-[var(--ease-standard)]",
        keyboardOpen && "translate-y-full opacity-0",
      )}
    >
      <ul
        ref={listRef}
        className="pointer-events-auto relative mx-auto flex h-16 w-full max-w-[var(--content-max-width)] items-stretch overflow-clip rounded-full border border-[var(--nav-glass-border)] border-t-transparent bg-[var(--nav-glass)] p-1.5 shadow-[var(--nav-glass-shadow)] [scrollbar-width:none] backdrop-blur-2xl backdrop-saturate-150 [&::-webkit-scrollbar]:hidden"
      >
        {indicator && activeIndex >= 0 && (
          <motion.span
            key={activeIndex}
            aria-hidden
            className="pointer-events-none absolute bottom-1.5 top-1.5 rounded-full bg-[var(--nav-indicator)] shadow-[0_8px_16px_-10px_color-mix(in_srgb,var(--accent)_65%,transparent)]"
            initial={false}
            animate={{ left: indicator.left, width: indicator.width }}
            style={{ x: 0 }}
            transition={
              reduce
                ? { duration: 0 }
                : {
                    left: spring.interactive,
                    width: { type: "spring", stiffness: 260, damping: 26, mass: 0.8 },
                  }
            }
          />
        )}
        {PRIMARY_DESTINATIONS.map(({ href, labelKey, icon }) => {
          const active = isNavDestinationActive(pathname, href);
          return (
            <li key={href} className="relative z-10 min-w-0 flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                onMouseEnter={() => !active && warm(href)}
                onTouchStart={() => !active && warm(href)}
                onClick={() => !active && haptics.selection()}
                className={cn(
                  "flex h-full select-none flex-col items-center justify-center gap-0.5 rounded-full text-[11px] font-medium outline-none transition-[color,scale] duration-150 active:scale-95 focus-visible:outline-none",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                <NavIcon icon={icon} active={active} />
                <span className={cn("max-w-full truncate px-1 leading-none", active && "font-semibold")}>{t(labelKey)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
