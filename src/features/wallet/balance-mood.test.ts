import { describe, expect, it } from "vitest";
import { moodFromBalance } from "./balance-mood";

describe("moodFromBalance", () => {
  it("melts when the wallet is empty", () => {
    expect(moodFromBalance(0).id).toBe("melted");
    expect(moodFromBalance(-12).id).toBe("melted");
  });

  it("pleads under a dollar, then brightens as the balance grows", () => {
    expect(moodFromBalance(2).id).toBe("pleading");
    expect(moodFromBalance(100).id).toBe("teary");
    expect(moodFromBalance(500).id).toBe("smile");
    expect(moodFromBalance(2000).id).toBe("cool");
    expect(moodFromBalance(5000).id).toBe("rich");
    expect(moodFromBalance(20000).id).toBe("star");
    expect(moodFromBalance(100000).id).toBe("party");
  });
});
