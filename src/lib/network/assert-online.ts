import { ApiError } from "@/lib/api/errors";

/** Writes fail immediately while offline. They are never queued to succeed later. */
export function assertOnline(): void {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    throw new ApiError(0, "network_error", "Network request failed");
  }
}
