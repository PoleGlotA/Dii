"use client";

import { Bookmark } from "lucide-react";
import { useApp } from "@/lib/store";
import { useToast } from "@/lib/toast";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface SaveButtonProps {
  postId: string;
  variant?: "icon" | "full";
  size?: "sm" | "md";
}

export function SaveButton({ postId, variant = "icon", size = "md" }: SaveButtonProps) {
  const { state, isSaved, toggleSaved } = useApp();
  const toast = useToast();
  const router = useRouter();
  const saved = isSaved(postId);

  function handle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!state.currentUser) {
      router.push("/auth");
      return;
    }
    toggleSaved(postId);
    toast.push(saved ? "Видалено зі збережених" : "Збережено в обране", "info");
  }

  if (variant === "full") {
    return (
      <button
        onClick={handle}
        className={cn(
          "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors duration-base text-sm font-medium",
          saved
            ? "bg-warning-50 border-warning-200 text-warning-700"
            : "bg-white border-gray-200 text-gray-700 hover:border-brand-300"
        )}
        aria-pressed={saved}
      >
        <Bookmark size={14} className={saved ? "fill-warning-500 text-warning-500" : ""} />
        {saved ? "Збережено" : "Зберегти"}
      </button>
    );
  }

  const sizeCls = size === "sm" ? "w-8 h-8" : "w-9 h-9";
  return (
    <button
      onClick={handle}
      className={cn(
        "rounded-lg flex items-center justify-center transition-colors duration-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
        sizeCls,
        saved
          ? "bg-warning-50 text-warning-600 hover:bg-warning-100"
          : "bg-white/90 backdrop-blur text-gray-600 hover:bg-white hover:text-gray-900 border border-gray-200"
      )}
      aria-label={saved ? "Видалити зі збережених" : "Зберегти"}
      aria-pressed={saved}
    >
      <Bookmark size={size === "sm" ? 14 : 16} className={saved ? "fill-warning-500" : ""} />
    </button>
  );
}
