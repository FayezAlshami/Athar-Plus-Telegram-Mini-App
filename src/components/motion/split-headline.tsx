"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

/** Reveals a headline word by word (Arabic) or character by character (English). */
export function SplitHeadline({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rtl = document.documentElement.dir === "rtl";
    const split = SplitText.create(node, {
      type: rtl ? "words" : "words,chars",
      mask: "words",
      aria: "auto",
    });
    const targets = rtl ? split.words : split.chars;
    const tween = gsap.from(targets, {
      yPercent: 110,
      opacity: 0,
      duration: 0.55,
      stagger: 0.028,
      ease: "power3.out",
    });

    return () => {
      tween.kill();
      split.revert();
    };
  }, [text]);

  return (
    <p ref={ref} dir="auto" className={className}>
      {text}
    </p>
  );
}
