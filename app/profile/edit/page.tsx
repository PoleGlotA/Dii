"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Save, RefreshCw } from "lucide-react";
import { useApp } from "@/lib/store";
import { useToast } from "@/lib/toast";
import { FormField, FormSelect, FormTextarea } from "@/components/FormField";

export default function EditProfilePage() {
  const { state, updateProfile } = useApp();
  const router = useRouter();
  const toast = useToast();

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [role, setRole] = useState<"volunteer" | "organizer">("volunteer");
  const [avatarSeed, setAvatarSeed] = useState("");

  useEffect(() => {
    if (!state.currentUser) {
      router.push("/auth");
      return;
    }
    setName(state.currentUser.name);
    setLocation(state.currentUser.location);
    setBio(state.currentUser.bio);
    setRole(state.currentUser.role);
    setAvatarSeed(state.currentUser.name);
  }, [state.currentUser, router]);

  if (!state.currentUser) return null;

  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(avatarSeed || "user")}`;

  function randomizeAvatar() {
    setAvatarSeed(Math.random().toString(36).slice(2, 10));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateProfile({
      name: name.trim(),
      location: location.trim(),
      bio: bio.trim(),
      role,
      avatar: avatarUrl,
    });
    toast.push("Профіль оновлено", "success");
    router.push("/profile");
  }

  return (
    <div className="max-w-xl mx-auto">
      <Link
        href="/profile"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors"
      >
        <ArrowLeft size={15} /> Назад до профілю
      </Link>

      <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-7">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Редагування профілю</h1>

        <div className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-gray-50 border border-gray-100">
          <Image
            src={avatarUrl}
            alt="Аватар"
            width={64}
            height={64}
            className="rounded-full bg-white"
            unoptimized
          />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Аватар</p>
            <p className="text-xs text-gray-500 mb-2">Генерується автоматично</p>
            <button
              type="button"
              onClick={randomizeAvatar}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800"
            >
              <RefreshCw size={12} /> Згенерувати інший
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Ім'я"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <FormField
            label="Місто"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
          <FormSelect
            label="Роль"
            value={role}
            onChange={(e) => setRole(e.target.value as "volunteer" | "organizer")}
            options={[
              { value: "volunteer", label: "Волонтер" },
              { value: "organizer", label: "Організатор" },
            ]}
          />
          <FormTextarea
            label="Про себе"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            hint="До 300 символів"
            maxLength={300}
          />

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Save size={16} />
              Зберегти
            </button>
            <Link
              href="/profile"
              className="flex items-center justify-center px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50"
            >
              Скасувати
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
