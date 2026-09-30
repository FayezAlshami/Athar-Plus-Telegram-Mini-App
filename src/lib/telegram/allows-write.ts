/** Reads the signed initData user flag. Display-only unsafe data is not used. */
export function allowsWriteToPmFromInitData(initData: string): boolean {
  try {
    const raw = new URLSearchParams(initData).get("user");
    if (!raw) return false;
    const user = JSON.parse(raw) as { allows_write_to_pm?: boolean };
    return user.allows_write_to_pm === true;
  } catch {
    return false;
  }
}
