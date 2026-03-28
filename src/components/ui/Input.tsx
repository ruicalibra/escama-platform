"use client";
import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, className, ...props }, ref) => {
    return (
      <div className="mb-3.5">
        {label && (
          <label className="block text-[11px] font-bold text-escama-text-3 tracking-[0.5px] uppercase mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "field-input",
            error && "border-coral bg-coral-light",
            className
          )}
          {...props}
        />
        {hint && !error && <p className="text-[11px] text-escama-text-3 mt-1">{hint}</p>}
        {error && <p className="text-[11px] text-coral mt-1">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
