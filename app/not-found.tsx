import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center">
      <div className="text-6xl">🫙</div>
      <h1 className="text-3xl font-bold text-gray-900">Сторінку не знайдено</h1>
      <p className="text-gray-500">
        Можливо, посилання застаріле або сторінку видалено
      </p>
      <Link
        href="/"
        className="bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
      >
        На головну
      </Link>
    </div>
  );
}
