"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Bell,
  Check,
  HandHeart,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Coins,
  Inbox,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { timeAgo } from "@/lib/utils";
import type { Notification } from "@/types";

function iconFor(kind: Notification["kind"]) {
  switch (kind) {
    case "booking_received": return <HandHeart size={14} className="text-brand-600" />;
    case "booking_accepted": return <CheckCircle2 size={14} className="text-success-600" />;
    case "booking_rejected": return <XCircle size={14} className="text-danger-600" />;
    case "comment_received": return <MessageSquare size={14} className="text-gray-500" />;
    case "donation_received": return <Coins size={14} className="text-warning-600" />;
    case "chat_message": return <MessageSquare size={14} className="text-brand-600" />;
    default: return <Bell size={14} className="text-gray-500" />;
  }
}

export function NotificationBell() {
  const { state, unreadNotifications, markNotificationRead, markAllNotificationsRead } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  if (!state.currentUser) return null;

  const mine = state.notifications
    .filter((n) => n.userId === state.currentUser!.id)
    .slice(0, 15);
  const unread = unreadNotifications();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-600 transition-colors duration-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        aria-label="Сповіщення"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-danger-600 text-white text-[10px] font-bold flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-gray-200 rounded-2xl shadow-elev-3 z-50 animate-slide-up overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Сповіщення</h3>
            {unread > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="text-xs text-brand-600 font-medium hover:text-brand-800 inline-flex items-center gap-1"
              >
                <Check size={12} /> Все прочитано
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {mine.length === 0 ? (
              <div className="py-10 px-4 text-center">
                <Inbox size={28} className="text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Поки що тихо. Сповіщення з'являться тут.</p>
              </div>
            ) : (
              mine.map((n) => (
                <Link
                  key={n.id}
                  href={n.postId ? `/post/${n.postId}` : "/"}
                  onClick={() => { markNotificationRead(n.id); setOpen(false); }}
                  className={`block px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors ${
                    !n.read ? "bg-brand-50/30" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                      {iconFor(n.kind)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-snug ${!n.read ? "font-medium text-gray-900" : "text-gray-700"}`}>
                        {n.title}
                      </p>
                      {n.body && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>
                      )}
                      <p className="text-[11px] text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-brand-600 mt-1.5 shrink-0" />
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>

          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="block px-4 py-3 text-center text-sm font-medium text-brand-600 hover:bg-gray-50 border-t border-gray-100"
          >
            Усі сповіщення
          </Link>
        </div>
      )}
    </div>
  );
}
