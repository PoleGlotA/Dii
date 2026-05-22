"use client";

import { CheckCircle, Clock, XCircle } from "lucide-react";
import Image from "next/image";
import { useApp } from "@/lib/store";
import { useToast } from "@/lib/toast";
import type { Booking } from "@/types";

interface ParticipantsListProps {
  bookings: Booking[];
  isOrganizer: boolean;
}

const statusIcon = {
  pending: <Clock size={14} className="text-amber-500" />,
  accepted: <CheckCircle size={14} className="text-green-500" />,
  rejected: <XCircle size={14} className="text-red-500" />,
};

const statusLabel = {
  pending: "Очікує",
  accepted: "Прийнято",
  rejected: "Відхилено",
};

export function ParticipantsList({ bookings, isOrganizer }: ParticipantsListProps) {
  const { state, updateBookingStatus, getUserById } = useApp();
  const toast = useToast();

  if (bookings.length === 0) {
    return (
      <p className="text-sm text-gray-500 py-3">
        Ще ніхто не записався на цю подію.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {bookings.map((b) => {
        const user = getUserById(b.userId);
        void state;
        return (
          <li
            key={b.id}
            className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100"
          >
            {user && (
              <Image
                src={user.avatar}
                alt={user.name}
                width={32}
                height={32}
                className="rounded-full bg-gray-200 shrink-0"
                unoptimized
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name ?? "Невідомий"}
              </p>
              <p className="text-xs text-gray-500">{user?.location}</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              {statusIcon[b.status]}
              <span>{statusLabel[b.status]}</span>
            </div>
            {isOrganizer && b.status === "pending" && (
              <div className="flex gap-1.5">
                <button
                  onClick={() => {
                    updateBookingStatus(b.id, "accepted");
                    toast.push(`Заявку від ${user?.name ?? "учасника"} прийнято`, "success");
                  }}
                  className="px-2.5 py-1 text-xs rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-colors"
                  aria-label="Прийняти"
                >
                  ✓
                </button>
                <button
                  onClick={() => {
                    updateBookingStatus(b.id, "rejected");
                    toast.push(`Заявку від ${user?.name ?? "учасника"} відхилено`, "info");
                  }}
                  className="px-2.5 py-1 text-xs rounded-lg bg-red-100 text-red-700 font-medium hover:bg-red-200 transition-colors"
                  aria-label="Відхилити"
                >
                  ✕
                </button>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
