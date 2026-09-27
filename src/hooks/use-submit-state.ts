"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type SubmitPhase = "idle" | "loading" | "success" | "error";

const SUCCESS_HOLD_MS = 1600;

/**
 * Button phases for a write. `succeed` is only called from a mutation's onSuccess,
 * after the server has confirmed the action.
 */
export function useSubmitState() {
  const [phase, setPhase] = useState<SubmitPhase>("idle");
  const timer = useRef<number | null>(null);

  const clearTimer = () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
  };

  useEffect(() => clearTimer, []);

  const start = useCallback(() => {
    clearTimer();
    setPhase("loading");
  }, []);

  const succeed = useCallback(() => {
    clearTimer();
    setPhase("success");
    timer.current = window.setTimeout(() => setPhase("idle"), SUCCESS_HOLD_MS);
  }, []);

  const fail = useCallback(() => {
    clearTimer();
    setPhase("error");
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    setPhase("idle");
  }, []);

  return { phase, start, succeed, fail, reset };
}
