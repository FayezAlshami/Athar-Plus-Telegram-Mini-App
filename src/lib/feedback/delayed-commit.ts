export const UNDO_WINDOW_MS = 5_000;

export interface DelayedCommit {
  undo: () => boolean;
}

/**
 * Runs `commit` after a grace window. `undo` cancels it if it has not run.
 * Used for reversible UI actions. Money movements are never delayed.
 */
export function armDelayedCommit(options: {
  delayMs: number;
  commit: () => Promise<void> | void;
  setTimer: (callback: () => void, delayMs: number) => number;
  clearTimer: (id: number) => void;
}): DelayedCommit {
  let armed = true;
  const id = options.setTimer(() => {
    if (!armed) return;
    armed = false;
    void options.commit();
  }, options.delayMs);

  return {
    undo() {
      if (!armed) return false;
      armed = false;
      options.clearTimer(id);
      return true;
    },
  };
}
