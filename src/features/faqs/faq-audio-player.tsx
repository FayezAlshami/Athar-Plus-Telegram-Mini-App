"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";

function formatDuration(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function FaqAudioPlayer({
  src,
  durationSeconds,
  active,
  onPlayRequest,
}: {
  src: string;
  durationSeconds: number | null;
  active: boolean;
  onPlayRequest: () => void;
}) {
  const t = useTranslations("faq");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(durationSeconds ?? 0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => {
      setElapsed(audio.currentTime);
      setProgress(audio.duration ? audio.currentTime / audio.duration : 0);
    };
    const onLoaded = () => setDuration(Math.round(audio.duration) || durationSeconds || 0);
    const onEnded = () => {
      setPlaying(false);
      setProgress(0);
      setElapsed(0);
    };

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("ended", onEnded);
    };
  }, [durationSeconds]);

  useEffect(() => {
    if (!active && playing) {
      audioRef.current?.pause();
      setPlaying(false);
    }
  }, [active, playing]);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }
    onPlayRequest();
    try {
      await audio.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  };

  const seek = (value: number) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    audio.currentTime = value * audio.duration;
  };

  return (
    <div className="flex flex-col gap-2 rounded-lg bg-surface-sunken p-3 shadow-[inset_0_0_0_1px_var(--border)]">
      <audio ref={audioRef} src={src} preload="metadata" />
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={playing ? t("pause") : t("play")}
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground transition-transform active:scale-95"
          onClick={() => void toggle()}
        >
          {playing ? <Pause className="size-5" weight="fill" /> : <Play className="size-5" weight="fill" />}
        </button>
        <div className="min-w-0 flex-1">
          <input
            type="range"
            min={0}
            max={1}
            step={0.001}
            value={progress}
            aria-label={t("scrub")}
            className={cn("h-1.5 w-full accent-accent")}
            onChange={(event) => seek(Number(event.target.value))}
          />
          <div className="mt-1 flex justify-between text-caption tabular-nums text-muted-foreground">
            <span>{formatDuration(elapsed)}</span>
            <span>{formatDuration(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
