"use client";

import { useRef, useState } from "react";
import { Upload, X, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value?: string;
  onChange: (value: string | undefined) => void;
  label?: string;
  hint?: string;
  maxSizeMB?: number;
}

export function ImageUpload({
  value,
  onChange,
  label = "Зображення",
  hint = "JPG, PNG або WebP. До 2 МБ.",
  maxSizeMB = 2,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFile(file?: File) {
    setError(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Можна завантажити лише зображення");
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Файл занадто великий. Максимум ${maxSizeMB} МБ.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") onChange(reader.result);
    };
    reader.onerror = () => setError("Не вдалось прочитати файл");
    reader.readAsDataURL(file);
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-800 mb-1.5">{label}</label>

      {value ? (
        <div className="relative rounded-xl overflow-hidden border border-gray-200 group">
          {}
          <img
            src={value}
            alt="Прев'ю"
            className="w-full h-48 object-cover"
          />
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-black/60 backdrop-blur text-white hover:bg-black/80 flex items-center justify-center transition-colors"
            aria-label="Прибрати"
          >
            <X size={15} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFile(e.dataTransfer.files[0]);
          }}
          className={cn(
            "w-full h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all",
            dragOver
              ? "border-brand-500 bg-brand-50"
              : "border-gray-300 bg-gray-50 hover:border-brand-400 hover:bg-brand-50/30"
          )}
        >
          <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
            <Upload size={18} className="text-gray-500" />
          </div>
          <p className="text-sm font-medium text-gray-700">
            Перетягніть або натисніть, щоб обрати
          </p>
          <p className="text-xs text-gray-500">{hint}</p>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {error && (
        <p className="text-xs text-danger-600 mt-1 flex items-center gap-1">
          <ImageIcon size={12} /> {error}
        </p>
      )}
    </div>
  );
}
