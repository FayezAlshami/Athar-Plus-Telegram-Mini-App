"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowUp } from "@phosphor-icons/react";

export function BackToTop() {
  const t = useTranslations("common");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 2);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      aria-label={t("backToTop")}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed end-4 z-40 flex size-11 items-center justify-center rounded-full border border-border bg-surface-elevated text-foreground shadow-lg bottom-[calc(var(--bottom-nav-height)+var(--safe-bottom)+16px)]"
    >
      <ArrowUp className="size-5" weight="bold" />
    </button>
  );
}
