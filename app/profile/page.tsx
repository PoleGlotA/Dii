"use client";

import { useApp } from "@/lib/store";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Star, Calendar, LogIn, CheckCircle, Clock, XCircle, Pencil, Plus, Settings, Shield } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { TypeBadge } from "@/components/TypeBadge";

const bookingStatusIcon = {
  pending: <Clock size={14} className="text-amber-500" />,
  accepted: <CheckCircle size={14} className="text-green-500" />,
  rejected: <XCircle size={14} className="text-red-500" />,
};

const bookingStatusLabel = {
  pending: "Очікує підтвердження",
  accepted: "Заявку прийнято",
  rejected: "Заявку відхилено",
};

export default function ProfilePage() {
  const { state } = useApp();

  if (!state.currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center">
        <div className="text-5xl">👤</div>
        <h1 className="text-2xl font-bold text-gray-900">Ви не авторизовані</h1>
        <p className="text-gray-500">
          Увійдіть, щоб переглянути свій профіль та заявки
        </p>
        <Link
          href="/auth"
          className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
        >
          <LogIn size={16} />
          Увійти
        </Link>
      </div>
    );
  }

  const user = state.currentUser;
  const myBookings = state.bookings.filter((b) => b.userId === user.id);
  const myPosts = state.posts.filter((p) => p.authorId === user.id);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col sm:flex-row gap-5 items-start">
        <Image
          src={user.avatar}
          alt={user.name}
          width={80}
          height={80}
          className="rounded-full bg-gray-100 shrink-0"
          unoptimized
        />
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                {user.verified && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                    <CheckCircle size={11} /> Верифікований
                  </span>
                )}
                {user.isAdmin && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                    <Shield size={11} /> Адмін
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
            </div>
            <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
              <Star size={14} className="text-amber-500 fill-amber-500" />
              <span className="text-sm font-bold text-amber-700">
                {user.karma}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <MapPin size={14} />
            {user.location}
          </div>
          <p className="text-sm text-gray-600">{user.bio || "Опис ще не додано"}</p>
          <div className="flex items-center gap-2 pt-1 flex-wrap">
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                user.role === "organizer"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {user.role === "organizer" ? "🎯 Організатор" : "🤝 Волонтер"}
            </span>
            <span className="text-xs text-gray-400">
              з {formatDate(user.joinedAt)}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 pt-3">
            <Link
              href="/profile/edit"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 px-3.5 py-1.5 rounded-lg hover:border-blue-400 hover:text-blue-700 transition-colors"
            >
              <Pencil size={14} />
              Редагувати
            </Link>
            <Link
              href="/post/new"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-blue-600 px-3.5 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={14} />
              Публікація
            </Link>
            <Link
              href="/settings"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 px-3.5 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Settings size={14} />
              Налаштування
            </Link>
            {user.isAdmin && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-purple-700 bg-purple-50 border border-purple-200 px-3.5 py-1.5 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <Shield size={14} />
                Адмін
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Карма", value: user.karma, emoji: "⭐" },
          { label: "Подій", value: user.eventsParticipated.length, emoji: "📅" },
          { label: "Заявок", value: myBookings.length, emoji: "✋" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-xl border border-gray-200 p-4 text-center"
          >
            <div className="text-2xl mb-1">{s.emoji}</div>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {myBookings.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Мої заявки
          </h2>
          <ul className="space-y-3">
            {myBookings.map((b) => {
              const post = state.posts.find((p) => p.id === b.postId);
              if (!post) return null;
              return (
                <li key={b.id}>
                  <Link
                    href={`/post/${post.id}`}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <TypeBadge type={post.type} />
                      </div>
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">
                        {post.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                        <Calendar size={11} />
                        {formatDate(post.date)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-600 shrink-0">
                      {bookingStatusIcon[b.status]}
                      <span className="hidden sm:inline">
                        {bookingStatusLabel[b.status]}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {myPosts.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Мої публікації
          </h2>
          <ul className="space-y-3">
            {myPosts.map((post) => (
              <li key={post.id}>
                <Link
                  href={`/post/${post.id}`}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <TypeBadge type={post.type} />
                    </div>
                    <p className="text-sm font-medium text-gray-900 line-clamp-2">
                      {post.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                      <MapPin size={11} />
                      {post.location}
                    </p>
                  </div>
                  {post.type === "ПОДІЯ" && (
                    <span className="text-xs text-gray-500 shrink-0">
                      {post.bookings.length} заявок
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
