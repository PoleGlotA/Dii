"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, TrendingUp, Heart, Calendar, Users, Star } from "lucide-react";
import { useApp } from "@/lib/store";
import { PostCard } from "@/components/PostCard";
import { FilterBar, type FilterValue, type SortValue } from "@/components/FilterBar";
import { PostCardSkeleton } from "@/components/ui/Skeleton";
import { useGeolocation } from "@/lib/useGeolocation";
import { haversineDistance } from "@/lib/distance";
import { geocodeLocation } from "@/lib/geocoding";
import type { Post } from "@/types";
import { formatCurrency } from "@/lib/utils";

export default function HomePage() {
  const { state } = useApp();
  const { latitude, longitude, request: requestGeolocation } = useGeolocation();
  const [filter, setFilter] = useState<FilterValue>("ALL");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortValue>("newest");
  const [city, setCity] = useState("");
  const [mounted, setMounted] = useState(false);
  const [nearbyEnabled, setNearbyEnabled] = useState(false);
  const [nearbyRadius, setNearbyRadius] = useState(25);
  const [postsWithCoords, setPostsWithCoords] = useState<Map<string, { lat: number; lng: number }>>(new Map());

  useEffect(() => {
    setMounted(true);
  }, []);

  // Запросити геолокацію при монтуванні
  useEffect(() => {
    if (mounted) {
      requestGeolocation();
    }
  }, [mounted, requestGeolocation]);

  const cities = useMemo(() => {
    const set = new Set<string>();
    state.posts.forEach((p) => {
      const main = p.location.split(",")[0].trim();
      if (main) set.add(main);
    });
    return Array.from(set).sort();
  }, [state.posts]);

  // Геокодування постів без координат
  useEffect(() => {
    const geocodePostsAsync = async () => {
      const newCoords = new Map(postsWithCoords);
      let needsUpdate = false;

      for (const post of state.posts) {
        if (!newCoords.has(post.id)) {
          // Якщо пост вже має координати в БД, використаємо їх
          if (post.latitude !== undefined && post.longitude !== undefined) {
            newCoords.set(post.id, { lat: post.latitude, lng: post.longitude });
            needsUpdate = true;
          } else {
            // Спробуємо геокодувати його місцезнаходження
            const coords = await geocodeLocation(post.location);
            if (coords) {
              newCoords.set(post.id, coords);
              needsUpdate = true;
            }
          }
        }
      }

      if (needsUpdate) {
        setPostsWithCoords(newCoords);
      }
    };

    geocodePostsAsync();
  }, [state.posts, postsWithCoords]);

  const nearbyReference = useMemo(() => {
    if (!nearbyEnabled) return null;

    const normalizedCity = city.trim().toLowerCase();
    if (normalizedCity) {
      const cityPost = state.posts.find((p) => {
        const postCity = p.location.split(",")[0].trim().toLowerCase();
        return postCity === normalizedCity;
      });
      if (cityPost) {
        const coords = postsWithCoords.get(cityPost.id);
        if (coords) {
          return coords;
        }
      }
    }

    if (latitude !== null && longitude !== null) {
      return { lat: latitude, lng: longitude };
    }

    return null;
  }, [nearbyEnabled, city, latitude, longitude, postsWithCoords, state.posts]);

  const featured = useMemo(
    () => state.posts.filter((p) => p.featured && p.status !== "closed"),
    [state.posts]
  );

  const filtered = useMemo<Post[]>(() => {
    let posts = [...state.posts];

    if (filter === "URGENT") {
      posts = posts.filter((p) => p.status === "urgent");
    } else if (filter !== "ALL") {
      posts = posts.filter((p) => p.type === filter);
    }

    if (city) {
      posts = posts.filter((p) =>
        p.location.toLowerCase().includes(city.toLowerCase())
      );
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      posts = posts.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.authorName.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Фільтрування за відстанню (гаверсинус)
    if (nearbyReference) {
      posts = posts.filter((p) => {
        const coords = postsWithCoords.get(p.id);
        if (!coords) return false;
        const distance = haversineDistance(
          nearbyReference.lat,
          nearbyReference.lng,
          coords.lat,
          coords.lng
        );
        return distance <= nearbyRadius;
      });
    }

    if (sort === "newest") {
      posts.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (sort === "soonest") {
      posts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (sort === "popular") {
      posts.sort(
        (a, b) =>
          b.comments.length + b.bookings.length - (a.comments.length + a.bookings.length)
      );
    }

    return posts;
  }, [state.posts, filter, search, sort, city, nearbyEnabled, nearbyRadius, latitude, longitude, postsWithCoords]);

  const stats = useMemo(() => {
    // Загальна сума зборів = сума всіх currentAmount у постах ЗБІР
    // (це включає донати через сторонні джерела, які організатори зафіксували)
    const totalRaised = state.posts
      .filter((p) => p.type === "ЗБІР")
      .reduce((sum, p) => sum + (p.currentAmount ?? 0), 0);
    const activeEvents = state.posts.filter(
      (p) => p.type === "ПОДІЯ" && p.status !== "closed"
    ).length;
    const urgent = state.posts.filter((p) => p.status === "urgent").length;
    const volunteers = state.users.length;
    return { totalRaised, activeEvents, urgent, volunteers };
  }, [state.posts, state.users]);

  const counts = useMemo(() => ({
    ALL: state.posts.length,
    ПОДІЯ: state.posts.filter((p) => p.type === "ПОДІЯ").length,
    ЗБІР: state.posts.filter((p) => p.type === "ЗБІР").length,
    НОВИНА: state.posts.filter((p) => p.type === "НОВИНА").length,
    URGENT: state.posts.filter((p) => p.status === "urgent").length,
  }), [state.posts]);

  const isFiltering = filter !== "ALL" || search.trim() !== "" || city !== "";

  return (
    <div>
      <section className="mb-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 sm:p-10 text-white">
        <div className="max-w-2xl">
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-3">
            Допомагай Україні разом із сотнями волонтерів
          </h1>
          <p className="text-blue-100 text-base sm:text-lg mb-5">
            Знайди подію поряд, підтримай збір або поділись новиною. Усе в одному
            місці — без зайвої бюрократії.
          </p>
          <div className="flex flex-wrap gap-3">
            {state.currentUser ? (
              <Link
                href="/post/new"
                className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors"
              >
                <Plus size={18} />
                Створити публікацію
              </Link>
            ) : (
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors"
              >
                Долучитися безкоштовно
              </Link>
            )}
            <Link
              href="/about"
              className="inline-flex items-center gap-2 bg-blue-500/40 backdrop-blur text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-500/60 transition-colors border border-blue-300/30"
            >
              Як це працює
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
            <TrendingUp size={14} className="text-green-600" />
            <span>Зібрано загалом</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">
            {formatCurrency(stats.totalRaised)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
            <Calendar size={14} className="text-blue-600" />
            <span>Активних подій</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.activeEvents}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
            <Heart size={14} className="text-red-500" />
            <span>Термінових</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.urgent}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
            <Users size={14} className="text-purple-500" />
            <span>Волонтерів</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.volunteers}</p>
        </div>
      </section>

      {featured.length > 0 && !isFiltering && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Star size={16} className="text-amber-500" />
            <h2 className="text-base font-semibold text-gray-900">Закріплені публікації</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map((post, i) => (
              <PostCard key={post.id} post={post} priority={i < 3} />
            ))}
          </div>
          <div className="border-t border-gray-200 mt-6 mb-6" />
        </section>
      )}

      <FilterBar
        active={filter}
        onChange={setFilter}
        search={search}
        onSearchChange={setSearch}
        sort={sort}
        onSortChange={setSort}
        city={city}
        cities={cities}
        onCityChange={setCity}
        counts={counts}
        nearbyEnabled={nearbyEnabled}
        onNearbyToggle={setNearbyEnabled}
        nearbyRadius={nearbyRadius}
        onNearbyRadiusChange={setNearbyRadius}
        userLocation={latitude !== null && longitude !== null ? { lat: latitude, lng: longitude } : null}
      />

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          Знайдено: <span className="font-semibold text-gray-900">{filtered.length}</span>
        </p>
        {isFiltering && (
          <button
            onClick={() => { setSearch(""); setFilter("ALL"); setCity(""); }}
            className="text-xs text-blue-600 font-medium hover:underline"
          >
            Скинути фільтри
          </button>
        )}
      </div>

      {!mounted ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <PostCardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <p className="text-gray-600 font-medium">Нічого не знайдено</p>
          <p className="text-gray-400 text-sm mt-1">
            Спробуйте змінити фільтр або очистити пошук
          </p>
          <button
            onClick={() => { setSearch(""); setFilter("ALL"); setCity(""); }}
            className="mt-4 text-sm text-blue-600 font-medium hover:underline"
          >
            Скинути всі фільтри
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
