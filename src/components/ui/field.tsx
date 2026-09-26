import { useId, type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface FieldProps {
  label: string;
  required?: boolean;
  helpText?: string | null;
  error?: string;
  children: (props: { id: string; "aria-describedby"?: string; "aria-invalid"?: boolean }) => ReactNode;
}

/** Label + control + helper/error text. Placeholders are never used as labels. */
export function Field({ label, required, helpText, error, children }: FieldProps) {
  const id = useId();
  const describedBy = error ? `${id}-error` : helpText ? `${id}-help` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-small font-medium text-foreground">
        {label}
        {required && <span aria-hidden className="ms-0.5 text-danger">*</span>}
      </label>
      {children({ id, "aria-describedby": describedBy, "aria-invalid": error ? true : undefined })}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-caption text-danger">
          {error}
        </p>
      ) : helpText ? (
        <p id={`${id}-help`} className="text-caption text-muted-foreground">
          {helpText}
        </p>
      ) : null}
    </div>
  );
}

export const controlClasses = cn(
  "w-full rounded-md border border-border-strong bg-surface-elevated px-4 text-body text-foreground",
  "placeholder:text-muted-foreground/70 transition-[border-color,box-shadow] duration-200",
  "focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent-soft",
  "aria-[invalid=true]:border-danger aria-[invalid=true]:focus:ring-danger-soft disabled:opacity-60",
);
