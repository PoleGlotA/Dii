"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Hash, ArrowLeft, Search } from "lucide-react";
import { useApp } from "@/lib/store";
import { PostCard } from "@/components/PostCard";
import { EmptyState } from "@/components/ui/EmptyState";

export default function TagPage() {
  const { name } = useParams<{ name: string }>();
  const tag = decodeURIComponent(name).toLowerCase();
  const { state } = useApp();

  const matches = state.posts
    .filter((p) => p.tags.some((t) => t.toLowerCase() === tag))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="max-w-5xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors"
      >
        <ArrowLeft size={15} /> Назад
      </Link>

      <div className="bg-gradient-to-br from-brand-50 to-brand-100 border border-brand-100 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white shadow-elev-1 flex items-center justify-center">
            <Hash size={20} className="text-brand-600" />
          </div>
          <div>
            <p className="text-sm text-brand-700 font-medium">Тег</p>
            <h1 className="text-h1 text-gray-900">#{tag}</h1>
          </div>
        </div>
        <p className="text-sm text-gray-700 mt-3">
          {matches.length === 0
            ? "Поки що нічого з цим тегом"
            : `${matches.length} ${matches.length === 1 ? "публікація" : matches.length < 5 ? "публікації" : "публікацій"}`}
        </p>
      </div>

      {matches.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Нічого не знайдено"
          description="Ще немає публікацій з цим тегом. Спробуйте інший пошук."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {matches.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      )}
    </div>
  );
}
