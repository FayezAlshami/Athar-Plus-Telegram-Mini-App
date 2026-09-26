import { describe, expect, it } from "vitest";
import type { ProductInputField } from "@/entities/product/types";
import { buildOrderFormSchema, toRegExp } from "./order-form-schema";

const field = (overrides: Partial<ProductInputField>): ProductInputField => ({
  key: "value", type: "text", label: "Value", placeholder: null, help_text: null, required: true, validation: {}, options: [], ...overrides,
});

const message = (key: string) => key;

describe("buildOrderFormSchema", () => {
  it("validates product-specific field types", () => {
    const schema = buildOrderFormSchema([field({ key: "email", type: "email" }), field({ key: "player", validation: { pattern: "/^[0-9]{5,15}$/" } })], message);

    expect(schema.safeParse({ inputs: { email: "a@b.co", player: "123456" }, customer_note: "" }).success).toBe(true);

    const invalid = schema.safeParse({ inputs: { email: "nope", player: "abc" }, customer_note: "" });
    expect(invalid.success).toBe(false);
    expect(invalid.error?.issues.map((issue) => issue.message)).toEqual(["invalidEmail", "invalidFormat"]);
  });

  it("allows empty optional fields but not empty required ones", () => {
    const schema = buildOrderFormSchema([field({ key: "a", required: false }), field({ key: "b" })], message);
    const result = schema.safeParse({ inputs: { a: "", b: "" }, customer_note: "" });
    expect(result.error?.issues).toHaveLength(1);
    expect(result.error?.issues[0].path).toEqual(["inputs", "b"]);
  });

  it("parses PHP-style regex delimiters", () => {
    expect(toRegExp("/^abc$/i")?.test("ABC")).toBe(true);
  });
});
