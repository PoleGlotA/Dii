"use client";

import { cn } from "@/lib/utils";
import type { PostType } from "@/types";
import type { LucideIcon } from "lucide-react";
import {
  Search,
  Layers,
  Calendar,
  Heart,
  Newspaper,
  Zap,
  MapPin,
  SortDesc,
  X,
} from "lucide-react";

export type FilterValue = PostType | "ALL" | "URGENT";
export type SortValue = "newest" | "soonest" | "popular";

interface FilterBarProps {
  active: FilterValue;
  onChange: (f: FilterValue) => void;
  search: string;
  onSearchChange: (s: string) => void;
  sort: SortValue;
  onSortChange: (s: SortValue) => void;
  city: string;
  cities: string[];
  onCityChange: (c: string) => void;
  counts?: Partial<Record<FilterValue, number>>;
  nearbyEnabled?: boolean;
  onNearbyToggle?: (enabled: boolean) => void;
  nearbyRadius?: number;
  onNearbyRadiusChange?: (radius: number) => void;
  userLocation?: { lat: number; lng: number } | null;
}

const FILTERS: { value: FilterValue; label: string; icon: LucideIcon; tone: string }[] = [
  { value: "ALL", label: "Всі", icon: Layers, tone: "blue" },
  { value: "ПОДІЯ", label: "Події", icon: Calendar, tone: "blue" },
  { value: "ЗБІР", label: "Збори", icon: Heart, tone: "amber" },
  { value: "НОВИНА", label: "Новини", icon: Newspaper, tone: "gray" },
  { value: "URGENT", label: "Термінові", icon: Zap, tone: "red" },
];

const SORTS: { value: SortValue; label: string }[] = [
  { value: "newest", label: "Спочатку нові" },
  { value: "soonest", label: "Найближчі за датою" },
  { value: "popular", label: "Найактивніші" },
];

export function FilterBar({
  active,
  onChange,
  search,
  onSearchChange,
  sort,
  onSortChange,
  city,
  cities,
  onCityChange,
  counts,
  nearbyEnabled,
  onNearbyToggle,
  nearbyRadius,
  onNearbyRadiusChange,
  userLocation,
}: FilterBarProps) {
  const canShowNearby = userLocation && onNearbyToggle && onNearbyRadiusChange;

  return (
    <div className="space-y-3 mb-6">
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          type="search"
          placeholder="Пошук за назвою, описом або тегом..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-9 py-2.5 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400 transition"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-700 transition-colors"
            aria-label="Очистити пошук"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(({ value, label, icon: Icon }) => {
          const isActive = active === value;
          const count = counts?.[value];
          return (
            <button
              key={value}
              onClick={() => onChange(value)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-base",
                isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-700"
              )}
              aria-pressed={isActive}
            >
              <Icon size={13} />
              <span>{label}</span>
              {count !== undefined && (
                <span
                  className={cn(
                    "text-[10px] font-bold px-1.5 py-px rounded-full min-w-4 text-center",
                    isActive
                      ? "bg-white/25 text-white"
                      : "bg-gray-100 text-gray-600"
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2 items-center text-sm">
        <div className="relative">
          <MapPin size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <select
            value={city}
            onChange={(e) => onCityChange(e.target.value)}
            className="pl-8 pr-7 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
            aria-label="Місто"
          >
            <option value="">Усі міста</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <SortDesc size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortValue)}
            className="pl-8 pr-7 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
            aria-label="Сортування"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {canShowNearby && (
          <button
            type="button"
            onClick={() => onNearbyToggle(!nearbyEnabled)}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
              nearbyEnabled
                ? "bg-green-600 text-white shadow-sm"
                : "bg-white text-gray-600 border border-gray-200 hover:border-green-300 hover:text-green-700"
            )}
            title="Показати близькі до мене за формулою гаверсинусів"
          >
            <MapPin size={14} />
            <span>Близко до мене</span>
          </button>
        )}
      </div>

      {canShowNearby && nearbyEnabled && nearbyRadius !== undefined && (
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 space-y-2">
          <div className="flex items-center justify-between text-sm font-medium text-gray-900">
            <span>Радіус пошуку: {nearbyRadius} км</span>
            <button
              type="button"
              onClick={() => onNearbyToggle(false)}
              className="text-gray-400 hover:text-gray-700 transition-colors"
              aria-label="Закрити"
            >
              <X size={14} />
            </button>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={nearbyRadius}
            onChange={(e) => onNearbyRadiusChange(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
            aria-label="Вибір радіуса пошуку"
          />

          <div className="flex justify-between text-xs text-gray-500 px-1 pointer-events-none">
            <span>0 км</span>
            <span>25 км</span>
            <span>50 км</span>
            <span>100 км</span>
          </div>

          <p className="text-xs text-gray-600">
            Показуються подій у межах {nearbyRadius} км від {city || "вашої локації"}
          </p>
        </div>
      )}
    </div>
  );
}
