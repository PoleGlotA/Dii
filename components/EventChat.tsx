"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Lock } from "lucide-react";
import { useApp } from "@/lib/store";
import { Avatar } from "@/components/ui/Avatar";
import { timeAgo } from "@/lib/utils";
import type { Post } from "@/types";

interface EventChatProps {
  post: Post;
}

export function EventChat({ post }: EventChatProps) {
  const { state, sendMessage } = useApp();
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const isAccepted = state.bookings.some(
    (b) => b.postId === post.id && b.userId === state.currentUser?.id && b.status === "accepted"
  );
  const isAuthor = state.currentUser?.id === post.authorId;
  const canChat = isAccepted || isAuthor;

  const messages = state.chatMessages
    .filter((m) => m.postId === post.id)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (!canChat) {
    return (
      <div className="flex flex-col items-center text-center py-10 px-4 bg-gray-50 rounded-xl border border-gray-100">
        <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center mb-3">
          <Lock size={16} className="text-gray-500" />
        </div>
        <p className="text-sm font-medium text-gray-900 mb-1">Чат лише для учасників</p>
        <p className="text-sm text-gray-500 max-w-xs">
          Після того, як організатор підтвердить заявку, ви побачите чат події.
        </p>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage(post.id, text.trim());
    setText("");
  }

  return (
    <div className="flex flex-col h-[420px] bg-gray-50 rounded-xl border border-gray-100">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-8">
            Привітайтесь першим — це закритий чат для {post.bookings.filter(b => b.status === "accepted").length + 1} учасників.
          </p>
        ) : (
          messages.map((m) => {
            const own = m.userId === state.currentUser?.id;
            return (
              <div
                key={m.id}
                className={`flex gap-2 ${own ? "flex-row-reverse" : ""}`}
              >
                <Avatar src={m.userAvatar} name={m.userName} size="sm" />
                <div className={`flex flex-col max-w-[75%] ${own ? "items-end" : "items-start"}`}>
                  <div
                    className={`px-3.5 py-2 rounded-2xl text-sm ${
                      own
                        ? "bg-brand-600 text-white rounded-br-md"
                        : "bg-white border border-gray-200 text-gray-800 rounded-bl-md"
                    }`}
                  >
                    {!own && (
                      <p className="text-[11px] font-semibold text-gray-500 mb-0.5">{m.userName}</p>
                    )}
                    <p className="whitespace-pre-wrap break-words leading-snug">{m.content}</p>
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 px-1">{timeAgo(m.createdAt)}</span>
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t border-gray-100 bg-white p-2 rounded-b-xl">
        <div className="flex items-center gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Напишіть повідомлення..."
            className="flex-1 px-3.5 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="w-9 h-9 rounded-lg bg-brand-600 text-white disabled:opacity-40 hover:bg-brand-700 transition-colors flex items-center justify-center"
            aria-label="Надіслати"
          >
            <Send size={15} />
          </button>
        </div>
      </form>
    </div>
  );
}
