import Link from "next/link";
import { ArrowLeft, type LucideIcon } from "lucide-react";

interface ContentPageProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  updated?: string;
  children: React.ReactNode;
}

export function ContentPage({
  icon: Icon,
  title,
  subtitle,
  updated,
  children,
}: ContentPageProps) {
  return (
    <article className="max-w-3xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft size={15} /> На головну
      </Link>

      <header className="mb-8">
        <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center mb-4">
          <Icon size={22} className="text-brand-600" />
        </div>
        <h1 className="text-h1 text-gray-900 mb-2">{title}</h1>
        {subtitle && <p className="text-body-lg text-gray-500">{subtitle}</p>}
        {updated && (
          <p className="text-caption text-gray-400 mt-3">Оновлено: {updated}</p>
        )}
      </header>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 prose-uk">
        {children}
      </div>
    </article>
  );
}
