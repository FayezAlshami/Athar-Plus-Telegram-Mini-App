import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes } from "react";
import { CaretDown } from "@phosphor-icons/react/dist/ssr";
import { controlClasses } from "./field";
import { cn } from "@/lib/cn";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...props }, ref) {
  return <input ref={ref} dir="auto" className={cn(controlClasses, "h-12", className)} {...props} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea(
  { className, rows = 4, ...props },
  ref,
) {
  return <textarea ref={ref} dir="auto" rows={rows} className={cn(controlClasses, "resize-none py-3", className)} {...props} />;
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select({ className, ...props }, ref) {
  return (
    <span className="relative block">
      <select ref={ref} className={cn(controlClasses, "h-12 appearance-none pe-11", className)} {...props} />
      {/* appearance-none removes the native arrow; this keeps the control recognizable as a picker. */}
      <CaretDown aria-hidden className="pointer-events-none absolute end-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" weight="bold" />
    </span>
  );
});
