"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Send, MessageSquare, ArrowDownUp } from "lucide-react";
import { useApp } from "@/lib/store";
import { timeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Comment } from "@/types";

interface CommentSectionProps {
  postId: string;
  comments: Comment[];
}

type SortOrder = "newest" | "oldest";

const MAX_LEN = 500;

export function CommentSection({ postId, comments }: CommentSectionProps) {
  const { state, addComment, getPostById } = useApp();
  const [text, setText] = useState("");
  const [order, setOrder] = useState<SortOrder>("newest");

  const post = getPostById(postId);
  const authorId = post?.authorId;

  const sorted = useMemo(() => {
    const arr = [...comments];
    arr.sort((a, b) =>
      order === "newest"
        ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    return arr;
  }, [comments, order]);

  const remaining = MAX_LEN - text.length;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || text.length > MAX_LEN) return;
    addComment(postId, text.trim());
    setText("");
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <MessageSquare size={18} className="text-blue-600" />
          Обговорення
          <span className="text-sm font-normal text-gray-400">({comments.length})</span>
        </h2>

        {comments.length > 1 && (
          <button
            onClick={() => setOrder((o) => (o === "newest" ? "oldest" : "newest"))}
            className="text-xs font-medium text-gray-500 hover:text-gray-900 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowDownUp size={11} />
            {order === "newest" ? "Спочатку нові" : "Спочатку старі"}
          </button>
        )}
      </div>

      <div className="space-y-4">
        {sorted.length === 0 && (
          <div className="text-center py-8 px-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <MessageSquare size={24} className="text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              Коментарів ще немає. Будьте першим!
            </p>
          </div>
        )}
        {sorted.map((c) => {
          const isAuthor = c.userId === authorId;
          return (
            <div key={c.id} className="flex gap-3 animate-fade-in">
              <Link href={`/user/${c.userId}`} className="shrink-0">
                <Image
                  src={c.userAvatar}
                  alt={c.userName}
                  width={36}
                  height={36}
                  className="rounded-full bg-gray-100 hover:opacity-80 transition-opacity"
                  unoptimized
                />
              </Link>
              <div
                className={cn(
                  "flex-1 rounded-xl px-4 py-3 border",
                  isAuthor
                    ? "bg-blue-50/50 border-blue-200"
                    : "bg-gray-50 border-transparent"
                )}
              >
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Link
                    href={`/user/${c.userId}`}
                    className="text-sm font-medium text-gray-900 hover:text-blue-700 transition-colors"
                  >
                    {c.userName}
                  </Link>
                  {isAuthor && (
                    <span className="text-[10px] font-semibold px-1.5 py-px rounded-full bg-blue-100 text-blue-700">
                      Автор
                    </span>
                  )}
                  <span className="text-xs text-gray-400">{timeAgo(c.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                  {c.content}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {state.currentUser ? (
        <form onSubmit={handleSubmit} className="flex gap-3 items-start pt-2">
          <Image
            src={state.currentUser.avatar}
            alt={state.currentUser.name}
            width={36}
            height={36}
            className="rounded-full bg-gray-100 shrink-0 mt-0.5"
            unoptimized
          />
          <div className="flex-1">
            <div className="relative">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, MAX_LEN))}
                placeholder="Напишіть коментар..."
                rows={2}
                className="w-full text-sm px-4 py-2.5 pr-12 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e as unknown as React.FormEvent);
                  }
                }}
              />
              <button
                type="submit"
                disabled={!text.trim()}
                className="absolute right-3 bottom-3 p-1.5 rounded-lg bg-blue-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                aria-label="Надіслати коментар"
              >
                <Send size={14} />
              </button>
            </div>
            <div className="flex items-center justify-between mt-1.5 text-xs">
              <span className="text-gray-400">
                Enter — надіслати · Shift+Enter — новий рядок
              </span>
              <span
                className={cn(
                  "tabular-nums",
                  remaining < 50 ? "text-orange-500" : "text-gray-400"
                )}
              >
                {remaining}
              </span>
            </div>
          </div>
        </form>
      ) : (
        <div className="text-center py-4 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-600">
            <Link href="/auth" className="text-blue-600 font-medium hover:underline">
              Увійдіть
            </Link>{" "}
            щоб залишити коментар
          </p>
        </div>
      )}
    </section>
  );
}
