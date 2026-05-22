"use client";

import { Coins } from "lucide-react";
import Image from "next/image";
import { useApp } from "@/lib/store";
import { formatCurrency, timeAgo } from "@/lib/utils";

interface DonationsListProps {
  postId: string;
  limit?: number;
}

export function DonationsList({ postId, limit = 10 }: DonationsListProps) {
  const { state } = useApp();
  const donations = state.donations
    .filter((d) => d.postId === postId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);

  if (donations.length === 0) {
    return (
      <p className="text-sm text-gray-500 text-center py-4">
        Будьте першим, хто підтримає цей збір.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {donations.map((d) => (
        <li
          key={d.id}
          className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100"
        >
          {d.anonymous || !d.userAvatar ? (
            <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 shrink-0">
              <Coins size={15} />
            </div>
          ) : (
            <Image
              src={d.userAvatar}
              alt={d.userName}
              width={36}
              height={36}
              className="rounded-full bg-gray-100 shrink-0"
              unoptimized
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-gray-900 truncate">{d.userName}</p>
              <span className="text-sm font-bold text-success-700 shrink-0">
                +{formatCurrency(d.amount)}
              </span>
            </div>
            {d.message && (
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">«{d.message}»</p>
            )}
            <p className="text-[11px] text-gray-400 mt-0.5">{timeAgo(d.createdAt)}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
