"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Shield,
  Users,
  FileText,
  BarChart3,
  Ban,
  CheckCircle2,
  Trash2,
  Star,
  StarOff,
  ChevronDown,
  Search,
  AlertTriangle,
  TrendingUp,
  Heart,
  Calendar,
  Newspaper,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { useToast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

type Tab = "stats" | "users" | "posts";

function StatCard({
  icon,
  label,
  value,
  sub,
  color = "blue",
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color?: "blue" | "green" | "amber" | "red";
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
  };
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", colors[color])}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm font-medium text-gray-700 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function AdminPage() {
  const {
    state,
    adminBanUser,
    adminVerifyUser,
    adminDeletePost,
    adminFeaturePost,
    adminChangeRole,
  } = useApp();
  const router = useRouter();
  const toast = useToast();

  const [tab, setTab] = useState<Tab>("stats");
  const [userSearch, setUserSearch] = useState("");
  const [postSearch, setPostSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  useEffect(() => {
    if (state.currentUser === null) return;
    if (!state.currentUser.isAdmin) {
      router.push("/");
    }
  }, [state.currentUser, router]);

  if (!state.currentUser?.isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <AlertTriangle size={48} className="text-amber-400 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Немає доступу</h1>
        <p className="text-gray-500 mb-6">Ця сторінка доступна лише адміністраторам.</p>
        <Link href="/" className="text-blue-600 font-medium hover:underline">
          Повернутися на головну
        </Link>
      </div>
    );
  }

  const totalDonations = state.donations.reduce((s, d) => s + d.amount, 0);
  const activeEvents = state.posts.filter((p) => p.type === "ПОДІЯ" && p.status !== "closed").length;
  const activeCollections = state.posts.filter((p) => p.type === "ЗБІР" && p.status !== "closed").length;
  const bannedUsers = state.users.filter((u) => u.banned).length;
  const verifiedUsers = state.users.filter((u) => u.verified).length;
  const featuredPosts = state.posts.filter((p) => p.featured).length;
  const totalBookings = state.bookings.length;
  const totalComments = state.posts.reduce((s, p) => s + p.comments.length, 0);

  const filteredUsers = state.users.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.location.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredPosts = state.posts.filter(
    (p) =>
      p.title.toLowerCase().includes(postSearch.toLowerCase()) ||
      p.authorName.toLowerCase().includes(postSearch.toLowerCase()) ||
      p.location.toLowerCase().includes(postSearch.toLowerCase())
  );

  function handleBan(userId: string, banned: boolean) {
    adminBanUser(userId, banned);
    toast.push(banned ? "Користувача заблоковано" : "Блокування знято", banned ? "error" : "success");
  }

  function handleVerify(userId: string) {
    adminVerifyUser(userId);
    toast.push("Акаунт верифіковано", "success");
  }

  function handleDeletePost(postId: string) {
    adminDeletePost(postId);
    setConfirmDelete(null);
    toast.push("Публікацію видалено", "info");
  }

  function handleFeature(postId: string, featured: boolean) {
    adminFeaturePost(postId, featured);
    toast.push(featured ? "Публікацію закріплено" : "Закріплення знято", "success");
  }

  function handleRoleChange(userId: string, role: "volunteer" | "organizer") {
    adminChangeRole(userId, role);
    toast.push("Роль оновлено", "success");
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "stats", label: "Статистика", icon: <BarChart3 size={16} /> },
    { key: "users", label: `Користувачі (${state.users.length})`, icon: <Users size={16} /> },
    { key: "posts", label: `Публікації (${state.posts.length})`, icon: <FileText size={16} /> },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
          <Shield size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Адміністрування</h1>
          <p className="text-sm text-gray-500">Управління платформою Дій</p>
        </div>
        <Badge tone="warning" className="ml-auto">Admin</Badge>
      </div>

      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-6 overflow-x-auto">
        {tabs.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              "flex-1 min-w-max flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              tab === key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>

      {tab === "stats" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              icon={<Users size={20} />}
              label="Користувачів"
              value={state.users.length}
              sub={`${verifiedUsers} верифіковано`}
              color="blue"
            />
            <StatCard
              icon={<TrendingUp size={20} />}
              label="Публікацій"
              value={state.posts.length}
              sub={`${featuredPosts} закріплено`}
              color="green"
            />
            <StatCard
              icon={<Heart size={20} />}
              label="Зібрано донатів"
              value={`${totalDonations.toLocaleString("uk-UA")} грн`}
              sub={`${state.donations.length} транзакцій`}
              color="amber"
            />
            <StatCard
              icon={<Ban size={20} />}
              label="Заблокованих"
              value={bannedUsers}
              sub={`з ${state.users.length} юзерів`}
              color="red"
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <StatCard
              icon={<Calendar size={20} />}
              label="Активні події"
              value={activeEvents}
              color="blue"
            />
            <StatCard
              icon={<TrendingUp size={20} />}
              label="Активні збори"
              value={activeCollections}
              color="green"
            />
            <StatCard
              icon={<Newspaper size={20} />}
              label="Новин"
              value={state.posts.filter((p) => p.type === "НОВИНА").length}
              color="amber"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Активність</h3>
              <div className="space-y-3">
                {[
                  { label: "Бронювань всього", value: totalBookings },
                  { label: "Коментарів всього", value: totalComments },
                  { label: "Збережених постів", value: state.savedPostIds.length },
                  { label: "Сповіщень", value: state.notifications.length },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
                    <span className="text-sm text-gray-600">{label}</span>
                    <span className="text-sm font-semibold text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Топ-5 організаторів</h3>
              <div className="space-y-3">
                {state.users
                  .filter((u) => u.role === "organizer")
                  .sort((a, b) => b.karma - a.karma)
                  .slice(0, 5)
                  .map((user) => (
                    <div key={user.id} className="flex items-center gap-3">
                      <Image
                        src={user.avatar}
                        alt={user.name}
                        width={32}
                        height={32}
                        className="rounded-full bg-gray-100 shrink-0"
                        unoptimized
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.location}</p>
                      </div>
                      <span className="text-sm font-bold text-blue-600">{user.karma}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "users" && (
        <div className="space-y-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Пошук за ім'ям, email або містом..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            />
          </div>

          <div className="space-y-3">
            {filteredUsers.map((user) => {
              const isExpanded = expandedUser === user.id;
              const userPosts = state.posts.filter((p) => p.authorId === user.id);

              return (
                <div
                  key={user.id}
                  className={cn(
                    "bg-white border rounded-2xl overflow-hidden transition-all",
                    user.banned ? "border-red-200 bg-red-50/30" : "border-gray-200"
                  )}
                >
                  <div className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <Image
                          src={user.avatar}
                          alt={user.name}
                          width={44}
                          height={44}
                          className="rounded-full bg-gray-100"
                          unoptimized
                        />
                        {user.verified && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center">
                            <CheckCircle2 size={9} className="text-white" />
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-gray-900 text-sm">{user.name}</span>
                          {user.isAdmin && <Badge tone="brand" size="sm">Адмін</Badge>}
                          {user.banned && <Badge tone="danger" size="sm">Заблокований</Badge>}
                          <Badge tone={user.role === "organizer" ? "success" : "neutral"} size="sm">
                            {user.role === "organizer" ? "Організатор" : "Волонтер"}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{user.email}</p>
                        <p className="text-xs text-gray-400">{user.location} · Карма: {user.karma} · {userPosts.length} публ.</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Link
                          href={`/user/${user.id}`}
                          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                          title="Переглянути профіль"
                        >
                          <Users size={15} className="text-gray-500" />
                        </Link>
                        <button
                          onClick={() => setExpandedUser(isExpanded ? null : user.id)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                          aria-label="Розгорнути"
                        >
                          <ChevronDown
                            size={15}
                            className={cn("text-gray-500 transition-transform", isExpanded && "rotate-180")}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-gray-100 px-4 py-3 bg-gray-50 space-y-3 animate-fade-in">
                      {user.bio && (
                        <p className="text-xs text-gray-600 italic">{user.bio}</p>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {!user.verified && (
                          <button
                            onClick={() => handleVerify(user.id)}
                            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                          >
                            <CheckCircle2 size={13} /> Верифікувати
                          </button>
                        )}

                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value as "volunteer" | "organizer")}
                          className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                          disabled={user.isAdmin}
                        >
                          <option value="volunteer">Волонтер</option>
                          <option value="organizer">Організатор</option>
                        </select>

                        {!user.isAdmin && (
                          <button
                            onClick={() => handleBan(user.id, !user.banned)}
                            className={cn(
                              "flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors",
                              user.banned
                                ? "bg-green-600 text-white hover:bg-green-700"
                                : "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                            )}
                          >
                            <Ban size={13} />
                            {user.banned ? "Розблокувати" : "Заблокувати"}
                          </button>
                        )}
                      </div>

                      {userPosts.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1.5 font-medium">Публікації ({userPosts.length}):</p>
                          <div className="space-y-1.5">
                            {userPosts.slice(0, 3).map((p) => (
                              <div key={p.id} className="flex items-center gap-2 text-xs">
                                <Link
                                  href={`/post/${p.id}`}
                                  className="flex-1 text-blue-600 hover:underline truncate"
                                >
                                  {p.title}
                                </Link>
                                <span className="text-gray-400 shrink-0">{p.status}</span>
                              </div>
                            ))}
                            {userPosts.length > 3 && (
                              <p className="text-xs text-gray-400">+{userPosts.length - 3} ще...</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {filteredUsers.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Users size={32} className="mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Нікого не знайдено</p>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "posts" && (
        <div className="space-y-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Пошук за заголовком, автором або містом..."
              value={postSearch}
              onChange={(e) => setPostSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            />
          </div>

          <div className="space-y-3">
            {filteredPosts.map((post) => {
              const typeColors: Record<string, string> = {
                ПОДІЯ: "bg-blue-50 text-blue-700",
                ЗБІР: "bg-amber-50 text-amber-700",
                НОВИНА: "bg-gray-100 text-gray-700",
              };

              return (
                <div
                  key={post.id}
                  className={cn(
                    "bg-white border border-gray-200 rounded-2xl p-4",
                    post.featured && "border-amber-300 bg-amber-50/20"
                  )}
                >
                  <div className="flex items-start gap-3">
                    {post.image && (
                      <div className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={post.image}
                          alt={post.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", typeColors[post.type])}>
                          {post.type}
                        </span>
                        <span className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded-full",
                          post.status === "active" ? "bg-green-50 text-green-700" :
                          post.status === "urgent" ? "bg-red-50 text-red-700" :
                          "bg-gray-100 text-gray-600"
                        )}>
                          {post.status === "active" ? "Активний" : post.status === "urgent" ? "Терміново" : "Закрито"}
                        </span>
                        {post.featured && (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 flex items-center gap-1">
                            <Star size={10} /> Закріплено
                          </span>
                        )}
                      </div>

                      <Link
                        href={`/post/${post.id}`}
                        className="font-semibold text-gray-900 hover:text-blue-700 text-sm leading-snug line-clamp-1 transition-colors"
                      >
                        {post.title}
                      </Link>

                      <p className="text-xs text-gray-500 mt-1">
                        {post.authorName} · {post.location} · {post.comments.length} коментарів
                        {post.type === "ЗБІР" && post.targetAmount && (
                          <> · {(post.currentAmount ?? 0).toLocaleString("uk-UA")}/{post.targetAmount.toLocaleString("uk-UA")} грн</>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleFeature(post.id, !post.featured)}
                        title={post.featured ? "Зняти закріплення" : "Закріпити"}
                        className={cn(
                          "p-1.5 rounded-lg transition-colors",
                          post.featured
                            ? "bg-amber-100 text-amber-600 hover:bg-amber-200"
                            : "hover:bg-gray-100 text-gray-400 hover:text-amber-500"
                        )}
                      >
                        {post.featured ? <StarOff size={15} /> : <Star size={15} />}
                      </button>

                      {confirmDelete === post.id ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                          >
                            Підтвердити
                          </button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="text-xs px-2.5 py-1 rounded-lg border border-gray-200 hover:bg-gray-50"
                          >
                            Скасувати
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDelete(post.id)}
                          title="Видалити публікацію"
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredPosts.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <FileText size={32} className="mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Публікацій не знайдено</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
