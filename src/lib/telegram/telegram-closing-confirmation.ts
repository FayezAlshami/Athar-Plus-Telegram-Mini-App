/**
 * Native Telegram close protection (the Mini App X button).
 * Multiple dirty screens share one hold count so one unmount cannot
 * disable confirmation while another form is still unsaved.
 */

export interface ClosingConfirmationHost {
  enableClosingConfirmation(): void;
  disableClosingConfirmation(): void;
}

let holds = 0;
let host: ClosingConfirmationHost | null = null;
let hostEnabled = false;

function syncHost(): void {
  if (!host) return;
  const shouldEnable = holds > 0;
  if (shouldEnable === hostEnabled) return;
  hostEnabled = shouldEnable;
  if (shouldEnable) host.enableClosingConfirmation();
  else host.disableClosingConfirmation();
}

export function bindClosingConfirmationHost(next: ClosingConfirmationHost | null): void {
  host = next;
  hostEnabled = false;
  syncHost();
}

/** Call while `held` is true. Cleanup releases this hold. */
export function holdClosingConfirmation(held: boolean): () => void {
  if (!held) return () => undefined;
  holds += 1;
  syncHost();
  let released = false;
  return () => {
    if (released) return;
    released = true;
    holds = Math.max(0, holds - 1);
    syncHost();
  };
}

export function closingConfirmationHolds(): number {
  return holds;
}

export function resetClosingConfirmation(): void {
  holds = 0;
  host = null;
  hostEnabled = false;
}

export function canConfirmAppClose(
  webApp:
    | {
        enableClosingConfirmation?: () => void;
        disableClosingConfirmation?: () => void;
      }
    | null
    | undefined,
): webApp is ClosingConfirmationHost {
  return (
    typeof webApp?.enableClosingConfirmation === "function" && typeof webApp.disableClosingConfirmation === "function"
  );
}
