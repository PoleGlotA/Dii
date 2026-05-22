"use client";

import { useParams, notFound, useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Calendar,
  Users,
  ExternalLink,
  ArrowLeft,
  Pencil,
  Trash2,
  Share2,
  Star,
  Heart,
  MessageCircle,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { useToast } from "@/lib/toast";
import { TypeBadge, StatusBadge } from "@/components/TypeBadge";
import { ProgressBar } from "@/components/ProgressBar";
import { BookingButton } from "@/components/BookingButton";
import { CommentSection } from "@/components/CommentSection";
import { ParticipantsList } from "@/components/ParticipantsList";
import { SaveButton } from "@/components/SaveButton";
import { DonateModal } from "@/components/DonateModal";
import { DonationsList } from "@/components/DonationsList";
import { EventChat } from "@/components/EventChat";
import { Badge } from "@/components/ui/Badge";
import { formatDate, formatCurrency } from "@/lib/utils";

function renderContent(md: string) {
  const lines = md.split("\n");
  return lines.map((line, i) => {
    if (line.startsWith("## "))
      return (
        <h2 key={i} className="text-xl font-semibold text-gray-900 mt-6 mb-2">
          {line.slice(3)}
        </h2>
      );
    if (line.startsWith("### "))
      return (
        <h3 key={i} className="text-lg font-semibold text-gray-800 mt-4 mb-1">
          {line.slice(4)}
        </h3>
      );
    if (line.startsWith("**") && line.endsWith("**"))
      return (
        <p key={i} className="font-semibold text-gray-900 mb-1">
          {line.slice(2, -2)}
        </p>
      );
    if (line.startsWith("- "))
      return (
        <li key={i} className="text-gray-700 ml-4 list-disc mb-0.5">
          {line.slice(2)}
        </li>
      );
    if (line.trim() === "") return <div key={i} className="h-2" />;
    return (
      <p key={i} className="text-gray-700 leading-relaxed mb-1">
        {line}
      </p>
    );
  });
}

export default function PostPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const { state, getPostById, deletePost } = useApp();
  const post = getPostById(id);

  if (!post) return notFound();

  const [donateOpen, setDonateOpen] = useState(false);

  const isAuthor = state.currentUser?.id === post.authorId;
  const isAdmin = state.currentUser?.isAdmin;
  const isOrganizer = isAuthor || state.currentUser?.role === "organizer";

  const postDonations = state.donations.filter((d) => d.postId === post.id);

  const userBooking = state.bookings.find(
    (b) => b.postId === post.id && b.userId === state.currentUser?.id
  );
  const isParticipant = userBooking?.status === "accepted";
  const canChat = isAuthor || isParticipant;

  function handleDelete() {
    if (!post) return;
    if (!confirm("Видалити цю публікацію? Дію не можна скасувати.")) return;
    deletePost(post.id);
    toast.push("Публікацію видалено", "info");
    router.push("/");
  }

  async function handleShare() {
    if (!post) return;
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({ title: post.title, text: post.description, url });
        return;
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.push("Посилання скопійовано", "success");
    } catch {
      toast.push("Не вдалось скопіювати посилання", "error");
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={15} /> Назад до стрічки
        </Link>
        <div className="flex gap-2 items-center">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 text-sm text-gray-600 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <Share2 size={14} /> Поділитись
          </button>
          <SaveButton postId={post.id} variant="icon" />
          {(isAuthor || isAdmin) && (
            <Link
              href={`/post/${post.id}/edit`}
              className="inline-flex items-center gap-1.5 text-sm text-gray-600 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <Pencil size={14} /> Редагувати
            </Link>
          )}
          {(isAuthor || isAdmin) && (
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 text-sm text-red-600 px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={14} /> Видалити
            </button>
          )}
        </div>
      </div>

      <article className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {post.image && (
          <div className="relative w-full h-56 sm:h-72 bg-gray-100">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover"
              priority
              unoptimized
            />
            {post.featured && (
              <div className="absolute top-3 left-3">
                <Badge tone="amber" icon={<Star size={11} />}>Закріплено</Badge>
              </div>
            )}
          </div>
        )}

        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <TypeBadge type={post.type} />
            <StatusBadge status={post.status} />
            {post.featured && !post.image && (
              <Badge tone="amber" icon={<Star size={11} />}>Закріплено</Badge>
            )}
          </div>

          <h1 className="text-2xl font-bold text-gray-900 leading-tight">
            {post.title}
          </h1>

          <p className="text-gray-600 leading-relaxed">{post.description}</p>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Image
              src={post.authorAvatar}
              alt={post.authorName}
              width={28}
              height={28}
              className="rounded-full bg-gray-100"
              unoptimized
            />
            <Link
              href={`/user/${post.authorId}`}
              className="font-medium text-gray-900 hover:text-blue-700 transition-colors"
            >
              {post.authorName}
            </Link>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-gray-600 py-3 border-y border-gray-100">
            <span className="flex items-center gap-1.5">
              <Calendar size={15} className="text-blue-500" />
              {formatDate(post.date)}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin size={15} className="text-blue-500" />
              {post.location}
            </span>
            {post.type === "ПОДІЯ" && post.maxParticipants !== undefined && (
              <span className="flex items-center gap-1.5">
                <Users size={15} className="text-blue-500" />
                {post.currentParticipants ?? 0} / {post.maxParticipants} місць
              </span>
            )}
            {post.type === "ЗБІР" && post.targetAmount !== undefined && (
              <span className="flex items-center gap-1.5">
                <Heart size={15} className="text-amber-500" />
                {formatCurrency(post.currentAmount ?? 0)} з {formatCurrency(post.targetAmount)}
              </span>
            )}
            <span className="flex items-center gap-1.5 ml-auto">
              <MessageCircle size={15} className="text-gray-400" />
              {post.comments.length}
            </span>
          </div>

          {post.tags.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {post.tags.map((t) => (
                <Link
                  key={t}
                  href={`/tag/${encodeURIComponent(t)}`}
                  className="text-xs px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full hover:bg-blue-50 hover:text-blue-700 transition-colors"
                >
                  #{t}
                </Link>
              ))}
            </div>
          )}

          {post.type === "ЗБІР" &&
            post.targetAmount !== undefined &&
            post.currentAmount !== undefined && (
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                <ProgressBar
                  current={post.currentAmount}
                  target={post.targetAmount}
                  urgency={post.status === "urgent"}
                />
                <div className="flex gap-2">
                  {post.fundingLink && (
                    <a
                      href={post.fundingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white font-semibold py-2.5 rounded-xl hover:bg-green-700 transition-colors text-sm"
                    >
                      <ExternalLink size={15} />
                      На банку
                    </a>
                  )}
                  {state.currentUser && (
                    <button
                      onClick={() => setDonateOpen(true)}
                      className="flex-1 flex items-center justify-center gap-2 bg-amber-500 text-white font-semibold py-2.5 rounded-xl hover:bg-amber-600 transition-colors text-sm"
                    >
                      <Heart size={15} />
                      Задонатити
                    </button>
                  )}
                </div>
              </div>
            )}

          {post.type === "ПОДІЯ" && post.status !== "closed" && (
            <BookingButton post={post} />
          )}

          <div className="prose-content pt-2">{renderContent(post.content)}</div>

          {post.status === "closed" && post.reportText && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-sm font-semibold text-green-800 mb-1">Звіт про завершення</p>
              <p className="text-sm text-green-700">{post.reportText}</p>
            </div>
          )}
        </div>
      </article>

      {postDonations.length > 0 && (
        <div className="mt-4 bg-white rounded-2xl border border-gray-200 p-5 sm:p-6">
          <DonationsList postId={post.id} />
        </div>
      )}

      {post.type === "ПОДІЯ" && post.bookings.length > 0 && (
        <div className="mt-4 bg-white rounded-2xl border border-gray-200 p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Учасники ({post.bookings.length})
          </h2>
          <ParticipantsList
            bookings={post.bookings}
            isOrganizer={!!isOrganizer}
          />
        </div>
      )}

      {canChat && (
        <div className="mt-4 bg-white rounded-2xl border border-gray-200 p-5 sm:p-6">
          <EventChat post={post} />
        </div>
      )}

      <div className="mt-4 bg-white rounded-2xl border border-gray-200 p-5 sm:p-6">
        <CommentSection postId={post.id} comments={post.comments} />
      </div>

      <DonateModal open={donateOpen} post={post} onClose={() => setDonateOpen(false)} />
    </div>
  );
}
