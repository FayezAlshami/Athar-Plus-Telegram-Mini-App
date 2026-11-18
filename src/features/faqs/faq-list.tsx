"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CaretDown, Microphone, Question } from "@phosphor-icons/react";
import type { Faq } from "@/entities/faq/types";
import { StructuredText } from "@/components/shared/structured-text";
import { cn } from "@/lib/cn";
import { FaqAudioPlayer } from "./faq-audio-player";

function FaqItem({
  faq,
  open,
  onToggle,
  playingId,
  onPlay,
}: {
  faq: Faq;
  open: boolean;
  onToggle: () => void;
  playingId: number | null;
  onPlay: (id: number) => void;
}) {
  const t = useTranslations("faq");
  const showAudio = Boolean(faq.has_audio || faq.audio_url);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <button
        type="button"
        className="flex min-h-11 w-full items-center gap-3 px-4 py-3.5 text-start transition-colors active:bg-surface-sunken"
        aria-expanded={open}
        onClick={onToggle}
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
          <Question className="size-5" weight="duotone" />
        </span>
        <span className="min-w-0 flex-1 font-display text-card-title">{faq.question}</span>
        {showAudio && !open && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-surface-sunken px-2 py-1 text-caption text-muted-foreground">
            <Microphone className="size-3.5" weight="fill" />
            {t("voiceBadge")}
          </span>
        )}
        <CaretDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} weight="bold" />
      </button>
      {open && (
        <div className="flex flex-col gap-4 border-t border-border px-4 py-4">
          {faq.answer.length > 0 && <StructuredText blocks={faq.answer} />}
          {showAudio && (
            faq.audio_url ? (
              <FaqAudioPlayer
                src={faq.audio_url}
                durationSeconds={faq.audio_duration_seconds}
                active={playingId === faq.id}
                onPlayRequest={() => onPlay(faq.id)}
              />
            ) : (
              <p className="rounded-lg bg-surface-sunken px-3 py-2 text-caption text-muted-foreground">{t("audioUnavailable")}</p>
            )
          )}
        </div>
      )}
    </div>
  );
}

export function FaqList({ faqs }: { faqs: Faq[] }) {
  const [openId, setOpenId] = useState<number | null>(null);
  const [playingId, setPlayingId] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-3">
      {faqs.map((faq) => (
        <FaqItem
          key={faq.id}
          faq={faq}
          open={openId === faq.id}
          playingId={playingId}
          onPlay={setPlayingId}
          onToggle={() => setOpenId((current) => (current === faq.id ? null : faq.id))}
        />
      ))}
    </div>
  );
}
