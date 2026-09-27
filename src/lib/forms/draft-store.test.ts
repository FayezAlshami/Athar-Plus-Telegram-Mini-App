import { describe, expect, it } from "vitest";
import { draftStore } from "./draft-store";

describe("draftStore", () => {
  it("round-trips a draft and clears it", () => {
    draftStore.write("purchase.4", { inputs: { email: "a@b.co" }, customer_note: "hi" });
    expect(draftStore.read("purchase.4")).toEqual({ inputs: { email: "a@b.co" }, customer_note: "hi" });
    draftStore.clear("purchase.4");
    expect(draftStore.read("purchase.4")).toBeNull();
  });
});
