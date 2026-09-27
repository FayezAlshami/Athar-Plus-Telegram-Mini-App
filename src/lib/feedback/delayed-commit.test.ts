import { describe, expect, it, vi } from "vitest";
import { armDelayedCommit } from "./delayed-commit";

describe("armDelayedCommit", () => {
  it("commits after the window and undo cancels it", () => {
    vi.useFakeTimers();
    const commit = vi.fn();
    const pending = armDelayedCommit({
      delayMs: 5000,
      commit,
      setTimer: (callback, delay) => window.setTimeout(callback, delay),
      clearTimer: (id) => window.clearTimeout(id),
    });

    vi.advanceTimersByTime(4999);
    expect(commit).not.toHaveBeenCalled();
    expect(pending.undo()).toBe(true);
    vi.advanceTimersByTime(10);
    expect(commit).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("runs the commit when the window elapses", async () => {
    vi.useFakeTimers();
    const commit = vi.fn();
    armDelayedCommit({
      delayMs: 5000,
      commit,
      setTimer: (callback, delay) => window.setTimeout(callback, delay),
      clearTimer: (id) => window.clearTimeout(id),
    });
    await vi.advanceTimersByTimeAsync(5000);
    expect(commit).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });
});
