"use client";

import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Star, ShieldCheck, Calendar, ArrowLeft } from "lucide-react";
import { useApp } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { PostCard } from "@/components/PostCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Newspaper } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function PublicUserPage() {
  const { id } = useParams<{ id: string }>();
  const { state, getUserById } = useApp();
  const user = getUserById(id);
  if (!user) return notFound();

  const userPosts = state.posts
    .filter((p) => p.authorId === user.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const activeCount = userPosts.filter((p) => p.status !== "closed").length;
  const closedCount = userPosts.filter((p) => p.status === "closed").length;

  const isOwn = state.currentUser?.id === user.id;

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors"
      >
        <ArrowLeft size={15} /> Назад
      </Link>

      <Card padding="md" className="mb-6">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <Avatar src={user.avatar} name={user.name} size="xl" />
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-h1 text-gray-900">{user.name}</h1>
                  {user.verified && (
                    <Badge tone="brand" icon={<ShieldCheck size={11} />}>Перевірено</Badge>
                  )}
                </div>
                {isOwn && (
                  <Link href="/profile/edit" className="text-sm text-brand-600 hover:underline">
                    Редагувати профіль
                  </Link>
                )}
              </div>
              <Badge tone="amber" icon={<Star size={11} className="fill-warning-500" />}>
                {user.karma} карми
              </Badge>
            </div>
            <p className="flex items-center gap-1.5 text-sm text-gray-500">
              <MapPin size={14} /> {user.location}
            </p>
            <p className="text-body text-gray-700 max-w-prose">{user.bio || "Опис ще не додано"}</p>
            <div className="flex items-center gap-3 text-sm text-gray-500 pt-1 flex-wrap">
              <span className="inline-flex items-center gap-1">
                <Calendar size={13} /> На платформі з {formatDate(user.joinedAt)}
              </span>
              <span>
                Роль:{" "}
                <span className={user.role === "organizer" ? "text-brand-700 font-medium" : "text-gray-700 font-medium"}>
                  {user.role === "organizer" ? "Організатор" : "Волонтер"}
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-gray-100">
          <div className="text-center">
            <p className="text-h2 text-gray-900 font-bold">{userPosts.length}</p>
            <p className="text-xs text-gray-500">Публікацій</p>
          </div>
          <div className="text-center">
            <p className="text-h2 text-gray-900 font-bold">{activeCount}</p>
            <p className="text-xs text-gray-500">Активних</p>
          </div>
          <div className="text-center">
            <p className="text-h2 text-gray-900 font-bold">{closedCount}</p>
            <p className="text-xs text-gray-500">Завершених</p>
          </div>
        </div>
      </Card>

      <h2 className="text-h2 text-gray-900 mb-4">Публікації</h2>
      {userPosts.length === 0 ? (
        <EmptyState
          icon={Newspaper}
          title="Ще немає публікацій"
          description={`${user.name} поки що не створив жодної публікації.`}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {userPosts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      )}
    </div>
  );
}
