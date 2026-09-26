"use client";

import { motion } from "motion/react";
import { spring } from "@/lib/animation/tokens";

const WORD_STAGGER = 0.06;

/**
 * Word-level reveal. Arabic is never split into characters, which would
 * break letter shaping; words keep their joined forms intact.
 */
export function AnimatedWords({ text, className, as = "p" }: { text: string; className?: string; as?: "h1" | "h2" | "p" }) {
  const Tag = motion[as];
  const words = text.split(" ");

  return (
    <Tag className={className} aria-label={text} initial="hidden" animate="visible" transition={{ staggerChildren: WORD_STAGGER }}>
      {words.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          aria-hidden
          className="inline-block whitespace-pre"
          variants={{ hidden: { opacity: 0, y: 10, filter: "blur(4px)" }, visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: spring.entrance } }}
        >
          {index < words.length - 1 ? `${word} ` : word}
        </motion.span>
      ))}
    </Tag>
  );
}
