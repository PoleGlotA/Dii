"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

type ToastVariant = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextType {
  push: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((message: string, variant: ToastVariant = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const remove = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        {toasts.map((t) => {
          const styles =
            t.variant === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : t.variant === "error"
                ? "bg-red-50 border-red-200 text-red-800"
                : "bg-blue-50 border-blue-200 text-blue-800";
          const Icon =
            t.variant === "success" ? CheckCircle2 : t.variant === "error" ? AlertCircle : Info;
          return (
            <div
              key={t.id}
              className={`flex items-start gap-2 px-4 py-3 border rounded-xl shadow-md text-sm animate-slide-up ${styles}`}
            >
              <Icon size={16} className="mt-0.5 shrink-0" />
              <p className="flex-1 leading-snug">{t.message}</p>
              <button
                onClick={() => remove(t.id)}
                className="opacity-60 hover:opacity-100 transition-opacity"
                aria-label="Закрити"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
