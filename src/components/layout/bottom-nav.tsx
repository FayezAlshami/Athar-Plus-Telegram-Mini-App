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
import { PRIMARY_DESTINATIONS } from "./navigation";

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
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

  useFixedBottomInset(navRef);

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
      const listBox = list.getBoundingClientRect();
      const itemBox = item.getBoundingClientRect();
      setIndicator({
        left: itemBox.left - listBox.left - list.clientLeft + INSET,
        width: Math.max(itemBox.width - INSET * 2, 0),
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
      ref={navRef}
      aria-label={t("primary")}
      inert={keyboardOpen}
      // Slides away while the on-screen keyboard is up instead of riding on top of it.
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
        {indicator && (
          <motion.span
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
                  "flex h-full select-none flex-col items-center justify-center gap-0.5 rounded-full text-[11px] font-medium transition-[color,scale] duration-150 active:scale-95",
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
