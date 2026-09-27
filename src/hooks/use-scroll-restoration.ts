"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const positions = new Map<string, number>();

/** Remembers window scroll per route for the current session. */
export function useScrollRestoration(): void {
  const pathname = usePathname();

  useEffect(() => {
    const y = positions.get(pathname) ?? 0;
    window.scrollTo(0, y);
    return () => {
      positions.set(pathname, window.scrollY);
    };
  }, [pathname]);
}
