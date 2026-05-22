"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import { useApp } from "@/lib/store";
import { PostCard } from "@/components/PostCard";
import { EmptyState } from "@/components/ui/EmptyState";

export default function SavedPage() {
  const { state } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!state.currentUser) router.push("/auth");
  }, [state.currentUser, router]);

  if (!state.currentUser) return null;

  const saved = state.posts.filter((p) => state.savedPostIds.includes(p.id));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Bookmark size={22} className="text-blue-600" />
          Збережені
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {saved.length > 0
            ? `${saved.length} ${saved.length === 1 ? "публікація" : saved.length < 5 ? "публікації" : "публікацій"}`
            : "Тут зберігатимуться обрані вами публікації"}
        </p>
      </div>

      {saved.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="Нічого не збережено"
          description="Натисніть на закладку на будь-якій публікації, щоб зберегти її тут."
          action={
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Перейти до стрічки
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {saved.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
