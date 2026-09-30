/**
 * Pages may scroll-to-close. Sheets and the image viewer suppress that
 * until every hold is released.
 */

export interface VerticalSwipeHost {
  setVerticalSwipes(enabled: boolean): void;
}

let holds = 0;
let host: VerticalSwipeHost | null = null;
let enabled = true;

function sync(): void {
  if (!host) return;
  enabled = holds === 0;
  host.setVerticalSwipes(enabled);
}

export function bindVerticalSwipeHost(next: VerticalSwipeHost | null): void {
  host = next;
  enabled = true;
  sync();
}

export function suppressVerticalSwipes(held: boolean): () => void {
  if (!held) return () => undefined;
  holds += 1;
  sync();
  let released = false;
  return () => {
    if (released) return;
    released = true;
    holds = Math.max(0, holds - 1);
    sync();
  };
}

export function verticalSwipeHolds(): number {
  return holds;
}

export function resetVerticalSwipes(): void {
  holds = 0;
  host = null;
  enabled = true;
}
