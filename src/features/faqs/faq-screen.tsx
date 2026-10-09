"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CaretDown, Microphone, Question } from "@phosphor-icons/react";
import type { Faq } from "@/entities/faq/types";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { StructuredText } from "@/components/shared/structured-text";
import { ErrorState } from "@/components/shared/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/cn";
import { FaqAudioPlayer } from "./faq-audio-player";
import { useFaqs } from "./queries";

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
  const showAudio = faq.has_audio || Boolean(faq.audio_url);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <button
        type="button"
        className="flex w-full items-center gap-3 px-4 py-3.5 text-start transition-colors active:bg-surface-sunken"
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
          {showAudio && faq.audio_url ? (
            <FaqAudioPlayer
              src={faq.audio_url}
              durationSeconds={faq.audio_duration_seconds}
              active={playingId === faq.id}
              onPlayRequest={() => onPlay(faq.id)}
            />
          ) : showAudio ? (
            <p className="rounded-lg bg-surface-sunken px-3 py-2 text-caption text-muted-foreground">{t("audioUnavailable")}</p>
          ) : null}
        </div>
      )}
    </div>
  );
}

export function FaqScreen() {
  const t = useTranslations("faq");
  const { data, error, refetch, isLoading, isFetching, isFetched } = useFaqs();
  const [openId, setOpenId] = useState<number | null>(null);
  const [playingId, setPlayingId] = useState<number | null>(null);

  const initialLoading = isLoading || (isFetching && !isFetched);
  const refreshing = isFetching && isFetched;

  return (
    <PageContainer>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      {refreshing && (
        <p className="-mt-2 mb-2 text-center text-caption text-muted-foreground" aria-live="polite">{t("refreshing")}</p>
      )}
      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : initialLoading ? (
        <div className="flex flex-col gap-3" aria-busy="true" aria-label={t("loading")}>
          {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
          <p className="text-center text-caption text-muted-foreground">{t("loading")}</p>
        </div>
      ) : data && data.length > 0 ? (
        <div className="flex flex-col gap-3">
          {data.map((faq) => (
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
      ) : (
        <p className="rounded-xl border border-dashed border-border bg-surface-sunken px-4 py-8 text-center text-caption text-muted-foreground">{t("empty")}</p>
      )}
    </PageContainer>
  );
}
