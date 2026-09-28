"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import { spring } from "@/lib/animation/tokens";
import { prefetchPrimaryRoute } from "@/features/catalog/prefetch-primary-routes";
import { useHaptics } from "@/lib/telegram/hooks";
import { cn } from "@/lib/cn";
import { PRIMARY_DESTINATIONS } from "./navigation";

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useTranslations("nav");
  const haptics = useHaptics();

  const warm = (href: string) => {
    router.prefetch(href);
    prefetchPrimaryRoute(queryClient, href);
  };

  return (
    <nav
      aria-label={t("home")}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/90 pb-[var(--safe-bottom)] backdrop-blur-xl"
    >
      <ul className="mx-auto flex h-[var(--bottom-nav-height)] max-w-[var(--content-max-width)] items-stretch px-2">
        {PRIMARY_DESTINATIONS.map(({ href, labelKey, icon: Icon }) => {
          const active = pathname === href;
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                onMouseEnter={() => !active && warm(href)}
                onTouchStart={() => !active && warm(href)}
                onClick={() => !active && haptics.selection()}
                className={cn(
                  "relative flex h-full flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors duration-200",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {active && (
                  <motion.span layoutId="bottom-nav-indicator" transition={spring.interactive} className="absolute top-1.5 h-8 w-14 rounded-full bg-accent-soft" />
                )}
                <Icon className={cn("relative size-6", active && "text-accent")} weight={active ? "fill" : "regular"} />
                <span className="relative">{t(labelKey)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
