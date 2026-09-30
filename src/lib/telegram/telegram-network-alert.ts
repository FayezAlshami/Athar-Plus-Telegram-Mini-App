let report: ((message: string) => void) | null = null;
let lastAt = 0;

export function bindNetworkAlert(next: ((message: string) => void) | null): void {
  report = next;
}

/** Native alert for a failed write. Debounced so a burst of mutations shows once. */
export function reportNetworkFailure(message: string): void {
  const now = Date.now();
  if (!report || now - lastAt < 2500) return;
  lastAt = now;
  report(message);
}
