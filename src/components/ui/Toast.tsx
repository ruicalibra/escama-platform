"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ToastProps {
  message: string;
  visible: boolean;
}

export function Toast({ message, visible }: ToastProps) {
  return (
    <div
      className={cn(
        "fixed bottom-[90px] left-1/2 -translate-x-1/2 bg-escama-text text-white px-5 py-3 rounded-full text-sm font-bold z-[300] max-w-[380px] whitespace-nowrap pointer-events-none transition-all duration-300",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
      )}
    >
      {message}
    </div>
  );
}

// Hook
export function useToast() {
  const [toast, setToast] = useState({ message: "", visible: false });
  let timer: ReturnType<typeof setTimeout>;

  const showToast = (message: string, duration = 2400) => {
    clearTimeout(timer);
    setToast({ message, visible: true });
    timer = setTimeout(() => setToast((t) => ({ ...t, visible: false })), duration);
  };

  useEffect(() => () => clearTimeout(timer), []);
  return { toast, showToast };
}
