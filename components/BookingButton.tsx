"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle, Clock, XCircle, HandHeart } from "lucide-react";
import { useApp } from "@/lib/store";
import { useToast } from "@/lib/toast";
import type { Post } from "@/types";

interface BookingButtonProps {
  post: Post;
}

export function BookingButton({ post }: BookingButtonProps) {
  const { state, addBooking, getUserBookingForPost } = useApp();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const booking = getUserBookingForPost(post.id);

  if (!state.currentUser) {
    return (
      <Link
        href="/auth"
        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors"
      >
        <HandHeart size={18} />
        Хочу допомогти
      </Link>
    );
  }

  if (booking) {
    if (booking.status === "pending") {
      return (
        <div className="w-full flex items-center justify-center gap-2 bg-amber-50 text-amber-700 border border-amber-200 font-semibold py-3 px-6 rounded-xl">
          <Clock size={18} />
          Очікує підтвердження
        </div>
      );
    }
    if (booking.status === "accepted") {
      return (
        <div className="w-full flex items-center justify-center gap-2 bg-green-50 text-green-700 border border-green-200 font-semibold py-3 px-6 rounded-xl">
          <CheckCircle size={18} />
          Заявку прийнято!
        </div>
      );
    }
    if (booking.status === "rejected") {
      return (
        <div className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-700 border border-red-200 font-semibold py-3 px-6 rounded-xl">
          <XCircle size={18} />
          Заявку відхилено
        </div>
      );
    }
  }

  const isFull =
    post.maxParticipants !== undefined &&
    (post.currentParticipants ?? 0) >= post.maxParticipants;

  return (
    <button
      disabled={isFull || loading}
      onClick={async () => {
        setLoading(true);
        const b = addBooking(post.id);
        await new Promise((r) => setTimeout(r, 400));
        setLoading(false);
        if (b) toast.push("Заявку надіслано організатору", "success");
      }}
      className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
    >
      <HandHeart size={18} />
      {loading ? "Надсилаємо..." : isFull ? "Місць немає" : "Хочу допомогти"}
    </button>
  );
}
