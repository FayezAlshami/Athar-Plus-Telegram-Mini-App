"use client";

import type { UseFormRegisterReturn } from "react-hook-form";
import type { ProductInputField } from "@/entities/product/types";
import { Field } from "@/components/ui/field";
import { Input, Select, Textarea } from "@/components/ui/input";

const INPUT_ATTRIBUTES: Record<ProductInputField["type"], { type: string; inputMode?: "email" | "tel" | "decimal" | "text"; autoComplete?: string }> = {
  text: { type: "text" },
  email: { type: "email", inputMode: "email", autoComplete: "email" },
  password: { type: "password", inputMode: "text", autoComplete: "off" },
  phone: { type: "tel", inputMode: "tel", autoComplete: "tel" },
  number: { type: "text", inputMode: "decimal" },
  select: { type: "text" },
  textarea: { type: "text" },
};

/** Renders one backend-defined product field with the right mobile keyboard. */
export function DynamicField({ field, registration, error }: { field: ProductInputField; registration: UseFormRegisterReturn; error?: string }) {
  return (
    <Field label={field.label} required={field.required} helpText={field.help_text} error={error}>
      {(a11y) =>
        field.type === "textarea" ? (
          <Textarea {...a11y} {...registration} placeholder={field.placeholder ?? undefined} />
        ) : field.type === "select" ? (
          <Select {...a11y} {...registration} defaultValue="">
            <option value="" disabled>
              {field.placeholder ?? field.label}
            </option>
            {field.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        ) : (
          <Input {...a11y} {...registration} {...INPUT_ATTRIBUTES[field.type]} placeholder={field.placeholder ?? undefined} />
        )
      }
    </Field>
  );
}
