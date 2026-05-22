"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Check,
  HandHeart,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Coins,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { timeAgo } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { Notification } from "@/types";

function iconFor(kind: Notification["kind"]) {
  switch (kind) {
    case "booking_received": return <HandHeart size={16} className="text-brand-600" />;
    case "booking_accepted": return <CheckCircle2 size={16} className="text-success-600" />;
    case "booking_rejected": return <XCircle size={16} className="text-danger-600" />;
    case "comment_received": return <MessageSquare size={16} className="text-gray-500" />;
    case "donation_received": return <Coins size={16} className="text-warning-600" />;
    case "chat_message": return <MessageSquare size={16} className="text-brand-600" />;
    default: return <Bell size={16} className="text-gray-500" />;
  }
}

export default function NotificationsPage() {
  const { state, markNotificationRead, markAllNotificationsRead } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!state.currentUser) router.push("/auth");
  }, [state.currentUser, router]);

  if (!state.currentUser) return null;

  const mine = state.notifications.filter(
    (n) => n.userId === state.currentUser!.id
  );
  const unread = mine.filter((n) => !n.read);
  const read = mine.filter((n) => n.read);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-h1 text-gray-900">Сповіщення</h1>
          <p className="text-body text-gray-500 mt-1">
            {unread.length > 0
              ? `${unread.length} непрочитан${unread.length === 1 ? "е" : "их"}`
              : "Усі сповіщення прочитані"}
          </p>
        </div>
        {unread.length > 0 && (
          <Button variant="outline" size="sm" icon={<Check size={14} />} onClick={markAllNotificationsRead}>
            Все прочитано
          </Button>
        )}
      </div>

      {mine.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Поки що тихо"
          description="Сповіщення про заявки, коментарі та донати з'являться тут."
        />
      ) : (
        <div className="space-y-2">
          {[...unread, ...read].map((n) => (
            <Link
              key={n.id}
              href={n.postId ? `/post/${n.postId}` : "/"}
              onClick={() => markNotificationRead(n.id)}
              className={`block transition-colors ${!n.read ? "" : "opacity-80"}`}
            >
              <Card padding="sm" hover className={!n.read ? "border-brand-200 bg-brand-50/30" : ""}>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                    {iconFor(n.kind)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${!n.read ? "font-semibold text-gray-900" : "text-gray-700"}`}>
                      {n.title}
                    </p>
                    {n.body && (
                      <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1.5">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-brand-600 mt-1.5 shrink-0" aria-label="Непрочитане" />
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
