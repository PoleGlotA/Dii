"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, CheckCircle2 } from "lucide-react";
import { useApp } from "@/lib/store";
import { useToast } from "@/lib/toast";
import { FormField, FormSelect, FormTextarea } from "@/components/FormField";
import { ImageUpload } from "@/components/ImageUpload";
import { Button } from "@/components/ui/Button";
import { geocodeLocation } from "@/lib/geocoding";
import type { PostType, PostStatus } from "@/types";

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const { state, getPostById, updatePost, closePost } = useApp();
  const post = getPostById(id);

  const [type, setType] = useState<PostType>("ПОДІЯ");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState<string | undefined>();
  const [tagsRaw, setTagsRaw] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [fundingLink, setFundingLink] = useState("");
  const [status, setStatus] = useState<PostStatus>("active");
  const [reportText, setReportText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!post) return;
    if (state.currentUser && post.authorId !== state.currentUser.id) {
      router.push(`/post/${post.id}`);
    }
  }, [post, state.currentUser, router]);

  useEffect(() => {
    if (!post) return;
    setType(post.type);
    setTitle(post.title);
    setDescription(post.description);
    setContent(post.content);
    setDate(post.date);
    setLocation(post.location);
    setImage(post.image);
    setTagsRaw(post.tags.join(", "));
    setMaxParticipants(post.maxParticipants?.toString() ?? "");
    setTargetAmount(post.targetAmount?.toString() ?? "");
    setFundingLink(post.fundingLink ?? "");
    setStatus(post.status);
    setReportText(post.reportText ?? "");
  }, [post]);

  if (!post) return notFound();
  if (!state.currentUser || state.currentUser.id !== post.authorId) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!post) return;
    setIsSubmitting(true);
    try {
      const tags = tagsRaw.split(",").map((t) => t.trim()).filter(Boolean);

      // Спробуємо геокодувати локацію, якщо вона змінилась
      let latitude = post.latitude;
      let longitude = post.longitude;
      if (location !== post.location) {
        const coords = await geocodeLocation(location);
        if (coords) {
          latitude = coords.lat;
          longitude = coords.lng;
        }
      }

      const updated = updatePost({
        id: post!.id,
        type,
        title,
        description,
        content,
        date,
        location,
        latitude,
        longitude,
        image,
        tags,
        maxParticipants:
          type === "ПОДІЯ" && maxParticipants ? Number(maxParticipants) : undefined,
        targetAmount:
          type === "ЗБІР" && targetAmount ? Number(targetAmount) : undefined,
        fundingLink: type === "ЗБІР" ? fundingLink || undefined : undefined,
        status,
      });
      if (updated) {
        toast.push("Зміни збережено", "success");
        router.push(`/post/${post!.id}`);
      }
    } catch (error) {
      console.error("Error updating post:", error);
      toast.push("Помилка при оновленні публікації", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClose() {
    if (!confirm("Закрити цей пост? Він залишиться видимим, але з позначкою «Закрито».")) return;
    closePost(post!.id, reportText);
    toast.push("Пост закрито", "info");
    router.push(`/post/${post!.id}`);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href={`/post/${post.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors"
      >
        <ArrowLeft size={15} /> До публікації
      </Link>

      <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-7">
        <h1 className="text-h1 text-gray-900 mb-1">Редагувати публікацію</h1>
        <p className="text-sm text-gray-500 mb-6">
          Зміни видно всім після збереження.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <FormSelect
            label="Тип"
            value={type}
            onChange={(e) => setType(e.target.value as PostType)}
            options={[
              { value: "ПОДІЯ", label: "Подія" },
              { value: "ЗБІР", label: "Збір" },
              { value: "НОВИНА", label: "Новина" },
            ]}
          />
          <FormField
            label="Заголовок"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <FormTextarea
            label="Короткий опис"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            maxLength={240}
          />
          <FormTextarea
            label="Повний опис"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            hint="Markdown: ## заголовки, **жирне**, - списки"
          />
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField
              label="Дата"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <FormField
              label="Локація"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <ImageUpload value={image} onChange={setImage} />

          <FormField
            label="Теги"
            value={tagsRaw}
            onChange={(e) => setTagsRaw(e.target.value)}
            hint="Через кому"
          />

          {type === "ПОДІЯ" && (
            <FormField
              label="Максимум учасників"
              type="number"
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(e.target.value)}
            />
          )}

          {type === "ЗБІР" && (
            <>
              <FormField
                label="Цільова сума (грн)"
                type="number"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
              />
              <FormField
                label="Посилання на банку"
                type="url"
                value={fundingLink}
                onChange={(e) => setFundingLink(e.target.value)}
              />
            </>
          )}

          <FormSelect
            label="Статус"
            value={status}
            onChange={(e) => setStatus(e.target.value as PostStatus)}
            options={[
              { value: "active", label: "Активний" },
              { value: "urgent", label: "Терміновий" },
              { value: "closed", label: "Закритий" },
            ]}
          />

          {status === "closed" && (
            <FormTextarea
              label="Фінальний звіт"
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              rows={3}
              hint="Підсумок: що зроблено, як використані ресурси"
            />
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            <Button type="submit" icon={<Save size={16} />} disabled={isSubmitting}>
              {isSubmitting ? "Обробка..." : "Зберегти"}
            </Button>
            {post.status !== "closed" && (
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                icon={<CheckCircle2 size={16} />}
              >
                Закрити пост
              </Button>
            )}
            <Link
              href={`/post/${post.id}`}
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50"
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
