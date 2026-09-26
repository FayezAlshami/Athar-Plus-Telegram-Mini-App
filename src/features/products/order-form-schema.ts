import { z } from "zod";
import type { ProductInputField } from "@/entities/product/types";

export type ValidationMessageKey = "required" | "invalidEmail" | "invalidPhone" | "invalidNumber" | "invalidFormat" | "tooLong" | "tooShort";

const DEFAULT_MAX_LENGTH = 255;
const TEXTAREA_MAX_LENGTH = 2000;
const PHONE_PATTERN = /^\+?[0-9\s\-()]{6,20}$/;
const NUMBER_PATTERN = /^-?\d+(\.\d+)?$/;

/** Converts a PHP-style "/pattern/flags" rule from the backend into a RegExp. */
export function toRegExp(pattern: string): RegExp | null {
  const match = pattern.match(/^\/(.*)\/([a-z]*)$/);
  try {
    return match ? new RegExp(match[1], match[2].replace(/[^gimsuy]/g, "")) : new RegExp(pattern);
  } catch {
    return null;
  }
}

function fieldSchema(field: ProductInputField, message: (key: ValidationMessageKey) => string): z.ZodType<string, string> {
  const maxLength = field.type === "textarea" ? TEXTAREA_MAX_LENGTH : DEFAULT_MAX_LENGTH;
  let schema = z.string().trim().max(field.validation.max ?? maxLength, message("tooLong"));

  if (field.validation.min !== undefined && field.type !== "number") schema = schema.min(field.validation.min, message("tooShort"));

  const rules: { test: (value: string) => boolean; key: ValidationMessageKey }[] = [];
  if (field.type === "email") rules.push({ test: (v) => z.email().safeParse(v).success, key: "invalidEmail" });
  if (field.type === "phone") rules.push({ test: (v) => PHONE_PATTERN.test(v), key: "invalidPhone" });
  if (field.type === "number") rules.push({ test: (v) => NUMBER_PATTERN.test(v), key: "invalidNumber" });
  if (field.type === "select") rules.push({ test: (v) => field.options.some((o) => o.value === v), key: "invalidFormat" });
  const pattern = field.validation.pattern ? toRegExp(field.validation.pattern) : null;
  if (pattern) rules.push({ test: (v) => pattern.test(v), key: "invalidFormat" });

  return schema.superRefine((value, ctx) => {
    if (value === "") {
      if (field.required) ctx.addIssue({ code: "custom", message: message("required") });
      return;
    }
    const failed = rules.find((rule) => !rule.test(value));
    if (failed) ctx.addIssue({ code: "custom", message: message(failed.key) });
  });
}

/** Client-side mirror of the backend's dynamic field rules — for UX only; the server stays authoritative. */
export function buildOrderFormSchema(fields: ProductInputField[], message: (key: ValidationMessageKey) => string) {
  return z.object({
    inputs: z.object(Object.fromEntries(fields.map((field) => [field.key, fieldSchema(field, message)]))),
    customer_note: z.string().trim().max(500, message("tooLong")),
  });
}

export type OrderFormValues = { inputs: Record<string, string>; customer_note: string };
