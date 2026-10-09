"use client";

import { useEffect, useRef, useState } from "react";
import { CircleNotch, Pause, Play, WarningCircle } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

function formatDuration(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

type LoadState = "idle" | "loading" | "ready" | "error";

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
  const [loadState, setLoadState] = useState<LoadState>("idle");

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    setLoadState("loading");
    setPlaying(false);
    setProgress(0);
    setElapsed(0);
    audio.load();

    const onTime = () => {
      setElapsed(audio.currentTime);
      setProgress(audio.duration ? audio.currentTime / audio.duration : 0);
    };
    const onLoaded = () => {
      setDuration(Math.round(audio.duration) || durationSeconds || 0);
      setLoadState("ready");
    };
    const onCanPlay = () => setLoadState("ready");
    const onError = () => setLoadState("error");
    const onEnded = () => {
      setPlaying(false);
      setProgress(0);
      setElapsed(0);
    };

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("error", onError);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("error", onError);
      audio.removeEventListener("ended", onEnded);
    };
  }, [src, durationSeconds]);

  useEffect(() => {
    if (!active && playing) {
      audioRef.current?.pause();
      setPlaying(false);
    }
  }, [active, playing]);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio || loadState === "error") return;
    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }
    onPlayRequest();
    if (loadState === "idle") {
      setLoadState("loading");
      audio.load();
    }
    try {
      await audio.play();
      setPlaying(true);
      setLoadState("ready");
    } catch {
      setPlaying(false);
      setLoadState("error");
    }
  };

  const seek = (value: number) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    audio.currentTime = value * audio.duration;
  };

  const retry = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setLoadState("loading");
    audio.load();
  };

  const busy = loadState === "loading" || loadState === "idle";

  return (
    <div className="flex flex-col gap-2 rounded-lg bg-surface-sunken p-3 shadow-[inset_0_0_0_1px_var(--border)]">
      <p className="text-caption font-medium text-muted-foreground">{t("voiceAnswer")}</p>
      <audio ref={audioRef} src={src} preload="metadata" playsInline />
      {loadState === "error" ? (
        <div className="flex items-center justify-between gap-3 rounded-md bg-danger/10 px-3 py-2 text-caption text-danger">
          <span className="inline-flex items-center gap-1.5">
            <WarningCircle className="size-4 shrink-0" weight="fill" />
            {t("audioError")}
          </span>
          <Button type="button" size="sm" variant="secondary" onClick={retry}>{t("audioRetry")}</Button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={busy}
            aria-label={playing ? t("pause") : busy ? t("audioLoading") : t("play")}
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground transition-transform active:scale-95 disabled:opacity-70",
            )}
            onClick={() => void toggle()}
          >
            {busy ? <CircleNotch className="size-5 animate-spin" weight="bold" /> : playing ? <Pause className="size-5" weight="fill" /> : <Play className="size-5" weight="fill" />}
          </button>
          <div className="min-w-0 flex-1">
            <input
              type="range"
              min={0}
              max={1}
              step={0.001}
              value={progress}
              disabled={busy || loadState !== "ready"}
              aria-label={t("scrub")}
              className={cn("h-1.5 w-full accent-accent disabled:opacity-50")}
              onChange={(event) => seek(Number(event.target.value))}
            />
            <div className="mt-1 flex justify-between text-caption tabular-nums text-muted-foreground">
              <span>{busy ? t("audioLoading") : formatDuration(elapsed)}</span>
              <span>{formatDuration(duration || durationSeconds || 0)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
