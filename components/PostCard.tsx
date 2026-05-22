"use client";

import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Calendar,
  Users,
  MessageSquare,
  Star,
  Heart,
  Clock,
} from "lucide-react";
import type { Post } from "@/types";
import { TypeBadge, StatusBadge } from "./TypeBadge";
import { ProgressBar } from "./ProgressBar";
import { SaveButton } from "./SaveButton";
import { formatDate, formatCurrency } from "@/lib/utils";

interface PostCardProps {
  post: Post;
  priority?: boolean;
}

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr).getTime();
  const now = Date.now();
  return Math.ceil((target - now) / 86400000);
}

export function PostCard({ post, priority }: PostCardProps) {
  const dDays = daysUntil(post.date);
  const isUpcoming = post.type === "ПОДІЯ" && dDays >= 0 && dDays <= 14 && post.status !== "closed";

  return (
    <article className="relative bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-blue-300 hover:shadow-elev-2 transition-all duration-base animate-slide-up h-full flex flex-col group">
      {post.featured && (
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-0.5 bg-amber-100 border border-amber-300 rounded-full text-amber-800 text-[10px] font-semibold shadow-sm">
          <Star size={9} className="fill-amber-500 text-amber-500" /> Закріплено
        </div>
      )}
      <div className="absolute top-2 right-2 z-10">
        <SaveButton postId={post.id} variant="icon" size="sm" />
      </div>

      <Link href={`/post/${post.id}`} className="flex flex-col flex-1">
        {post.image ? (
          <div className="relative w-full h-44 overflow-hidden bg-gray-100">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={priority}
              unoptimized
            />
            {isUpcoming && (
              <div className="absolute bottom-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 bg-black/70 backdrop-blur text-white text-[10px] font-semibold rounded-full">
                <Clock size={9} />
                {dDays === 0 ? "Сьогодні" : dDays === 1 ? "Завтра" : `Через ${dDays} дн.`}
              </div>
            )}
          </div>
        ) : (
          <div className="h-2 bg-gradient-to-r from-blue-500 via-blue-400 to-indigo-500" />
        )}

        <div className="p-4 space-y-3 flex-1 flex flex-col">
          <div className="flex items-center gap-2 flex-wrap">
            <TypeBadge type={post.type} />
            <StatusBadge status={post.status} />
          </div>

          <h3 className="font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-blue-700 transition-colors">
            {post.title}
          </h3>

          <p className="text-sm text-gray-600 line-clamp-2 flex-1">{post.description}</p>

          {post.type === "ЗБІР" &&
            post.targetAmount !== undefined &&
            post.currentAmount !== undefined && (
              <div className="space-y-1.5">
                <ProgressBar
                  current={post.currentAmount}
                  target={post.targetAmount}
                  urgency={post.status === "urgent"}
                />
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1 text-amber-600 font-medium">
                    <Heart size={11} />
                    {formatCurrency(post.currentAmount)}
                  </span>
                  <span className="text-gray-400">
                    з {formatCurrency(post.targetAmount)}
                  </span>
                </div>
              </div>
            )}

          {post.type === "ПОДІЯ" && post.maxParticipants !== undefined && (
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <Users size={14} className="text-blue-500 shrink-0" />
              <span>
                <span className="font-semibold text-gray-900">{post.currentParticipants ?? 0}</span>
                <span className="text-gray-400"> / {post.maxParticipants} учасників</span>
              </span>
            </div>
          )}

          <div className="flex items-center gap-3 text-xs text-gray-500 pt-2 border-t border-gray-100">
            <span className="flex items-center gap-1" title={post.date}>
              <Calendar size={11} />
              {formatDate(post.date)}
            </span>
            <span className="flex items-center gap-1 truncate" title={post.location}>
              <MapPin size={11} />
              <span className="truncate">{post.location.split(",")[0]}</span>
            </span>
            <span className="flex items-center gap-1 ml-auto shrink-0">
              <MessageSquare size={11} />
              {post.comments.length}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
