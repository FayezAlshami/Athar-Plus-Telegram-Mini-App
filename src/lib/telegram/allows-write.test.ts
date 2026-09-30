import { describe, expect, it } from "vitest";
import { allowsWriteToPmFromInitData } from "./allows-write";

describe("allowsWriteToPmFromInitData", () => {
  it("reads the signed user flag", () => {
    const user = encodeURIComponent(JSON.stringify({ id: 1, allows_write_to_pm: true }));
    expect(allowsWriteToPmFromInitData(`user=${user}&auth_date=1&hash=abc`)).toBe(true);
  });

  it("is false when the flag is missing or the payload is broken", () => {
    expect(allowsWriteToPmFromInitData("auth_date=1")).toBe(false);
    expect(allowsWriteToPmFromInitData("user=not-json")).toBe(false);
  });
});
