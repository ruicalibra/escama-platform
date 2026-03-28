"use client";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "ocean" | "ghost" | "white" | "coral" | "kelp" | "light";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const variants = {
  ocean: "bg-gradient-to-br from-ocean to-ocean-dark text-white shadow-[0_6px_20px_rgba(13,110,253,0.3)] hover:shadow-[0_8px_28px_rgba(13,110,253,0.4)]",
  ghost: "bg-transparent text-ocean border-2 border-ocean",
  white: "bg-white text-escama-text border-2 border-escama-border",
  coral: "bg-gradient-to-br from-coral to-[#C43510] text-white shadow-[0_6px_20px_rgba(232,69,26,0.3)]",
  kelp: "bg-gradient-to-br from-kelp to-[#0A6038] text-white",
  light: "bg-ocean-light text-ocean",
};

const sizes = {
  sm: "px-4 py-2 text-xs",
  md: "px-5 py-3.5 text-sm",
  lg: "px-6 py-4 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "ocean", size = "md", loading, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "flex items-center justify-content-center gap-2 rounded-md font-bold font-body transition-all active:scale-[0.97] w-full justify-center",
          "disabled:bg-escama-border disabled:text-escama-text-3 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading ? <span className="animate-spin mr-1">⏳</span> : null}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
