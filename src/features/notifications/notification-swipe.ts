/** Horizontal travel toward the start edge. RTL reveals the action on the left. */
export function shouldDismissNotification(offsetX: number, direction: "rtl" | "ltr", threshold = 72): boolean {
  const towardStart = direction === "rtl" ? offsetX : -offsetX;
  return towardStart >= threshold;
}
