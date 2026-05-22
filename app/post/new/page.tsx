"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { useApp } from "@/lib/store";
import { useToast } from "@/lib/toast";
import { FormField, FormSelect, FormTextarea } from "@/components/FormField";
import { ImageUpload } from "@/components/ImageUpload";
import { geocodeLocation } from "@/lib/geocoding";
import type { PostType } from "@/types";

export default function NewPostPage() {
  const { state, createPost } = useApp();
  const router = useRouter();
  const toast = useToast();

  const [type, setType] = useState<PostType>("ПОДІЯ");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [location, setLocation] = useState(state.currentUser?.location ?? "");
  const [image, setImage] = useState<string | undefined>();
  const [tagsRaw, setTagsRaw] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [fundingLink, setFundingLink] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!state.currentUser) router.push("/auth");
  }, [state.currentUser, router]);

  if (!state.currentUser) return null;

  function validate() {
    const e: Record<string, string> = {};
    if (title.trim().length < 5) e.title = "Заголовок має містити мін. 5 символів";
    if (description.trim().length < 10) e.description = "Короткий опис — мін. 10 символів";
    if (content.trim().length < 20) e.content = "Повний опис — мін. 20 символів";
    if (location.trim().length < 2) e.location = "Вкажіть локацію";
    if (type === "ПОДІЯ" && maxParticipants && Number(maxParticipants) < 1)
      e.maxParticipants = "Має бути додатнє число";
    if (type === "ЗБІР") {
      if (!targetAmount || Number(targetAmount) < 100)
        e.targetAmount = "Сума має бути не меншою 100 грн";
      if (fundingLink && !/^https?:\/\//.test(fundingLink))
        e.fundingLink = "Посилання має починатись з http(s)://";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const tags = tagsRaw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      // Спробуємо геокодувати локацію
      let latitude: number | undefined;
      let longitude: number | undefined;
      const coords = await geocodeLocation(location);
      if (coords) {
        latitude = coords.lat;
        longitude = coords.lng;
      }

      const post = createPost({
        type,
        title,
        description,
        content,
        date,
        location,
        latitude,
        longitude,
        image: image,
        tags,
        maxParticipants: type === "ПОДІЯ" && maxParticipants ? Number(maxParticipants) : undefined,
        targetAmount: type === "ЗБІР" && targetAmount ? Number(targetAmount) : undefined,
        fundingLink: type === "ЗБІР" ? fundingLink || undefined : undefined,
      });
      if (post) {
        toast.push("Публікація створена", "success");
        router.push(`/post/${post.id}`);
      }
    } catch (error) {
      console.error("Error creating post:", error);
      toast.push("Помилка при створенні публікації", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors"
      >
        <ArrowLeft size={15} /> Назад
      </Link>

      <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-7">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Нова публікація</h1>
        <p className="text-sm text-gray-500 mb-6">
          Створіть подію, збір або новину. Усі поля з зірочкою — обов'язкові.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <FormSelect
            label="Тип публікації *"
            value={type}
            onChange={(e) => setType(e.target.value as PostType)}
            options={[
              { value: "ПОДІЯ", label: "Подія — потрібні люди" },
              { value: "ЗБІР", label: "Збір — потрібні кошти" },
              { value: "НОВИНА", label: "Новина — інформаційний пост" },
            ]}
          />

          <FormField
            label="Заголовок *"
            placeholder="Коротко й по суті"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={errors.title}
            maxLength={120}
          />

          <FormTextarea
            label="Короткий опис *"
            placeholder="1–2 речення для картки у стрічці"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            error={errors.description}
            maxLength={240}
          />

          <FormTextarea
            label="Повний опис *"
            placeholder="Деталі. Підтримується Markdown: ## заголовки, **жирне**, - списки"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            error={errors.content}
            hint="Чим конкретніше — тим більше довіри"
          />

          <div className="grid sm:grid-cols-2 gap-4">
            <FormField
              label="Дата *"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <FormField
              label="Локація *"
              placeholder="Місто або напрямок"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              error={errors.location}
            />
          </div>

          <ImageUpload
            value={image}
            onChange={setImage}
            label="Зображення"
            hint="JPG, PNG або WebP. До 5 МБ. Необов'язково."
            maxSizeMB={5}
          />

          <FormField
            label="Теги"
            placeholder="через кому: Київ, медицина, термінове"
            value={tagsRaw}
            onChange={(e) => setTagsRaw(e.target.value)}
            hint="Допомагають у пошуку"
          />

          {type === "ПОДІЯ" && (
            <FormField
              label="Максимум учасників"
              type="number"
              min={1}
              placeholder="Наприклад, 20"
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(e.target.value)}
              error={errors.maxParticipants}
            />
          )}

          {type === "ЗБІР" && (
            <>
              <FormField
                label="Цільова сума (грн) *"
                type="number"
                min={100}
                placeholder="Наприклад, 50000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                error={errors.targetAmount}
              />
              <FormField
                label="Посилання на банку"
                type="url"
                placeholder="https://send.monobank.ua/jar/..."
                value={fundingLink}
                onChange={(e) => setFundingLink(e.target.value)}
                error={errors.fundingLink}
              />
            </>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={16} />
              {isSubmitting ? "Обробка..." : "Опублікувати"}
            </button>
            <Link
              href="/"
              className="flex items-center justify-center px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Скасувати
            </Link>
          </div>

          {isSubmitting && (
            <div className="text-sm text-gray-500 text-center">
              Визначення координат з локації...
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
