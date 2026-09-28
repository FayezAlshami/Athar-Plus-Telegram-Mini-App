/** Decodes a dynamic route segment; malformed escapes are kept as typed instead of throwing. */
export function decodeParam(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
