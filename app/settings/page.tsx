"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  Lock,
  Trash2,
  Eye,
  EyeOff,
  Save,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { useToast } from "@/lib/toast";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/FormField";

const PREF_LABELS: Record<keyof import("@/types").NotificationPrefs, { title: string; desc: string }> = {
  bookings: { title: "Заявки на події", desc: "Сповіщати про нові заявки та зміну статусу" },
  comments: { title: "Коментарі", desc: "Хтось відповів під вашими публікаціями" },
  donations: { title: "Донати", desc: "Новий донат на ваш збір" },
  chat: { title: "Чат подій", desc: "Нові повідомлення в чатах подій" },
  digest: { title: "Тижневий дайджест", desc: "Підбірка найкращих публікацій щонеділі" },
};

export default function SettingsPage() {
  const { state, updatePrefs, changePassword, deleteAccount, logout } = useApp();
  const router = useRouter();
  const toast = useToast();

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);

  const [deleteConfirm, setDeleteConfirm] = useState("");

  useEffect(() => {
    if (!state.currentUser) router.push("/auth");
  }, [state.currentUser, router]);

  if (!state.currentUser) return null;

  async function handlePwChange(e: React.FormEvent) {
    e.preventDefault();
    setPwError(null);
    if (next !== confirm) {
      setPwError("Нові паролі не співпадають");
      return;
    }
    setPwLoading(true);
    const res = await changePassword(current, next);
    setPwLoading(false);
    if (!res.ok) {
      setPwError(res.error ?? "Помилка");
      return;
    }
    toast.push("Пароль успішно змінено", "success");
    setCurrent("");
    setNext("");
    setConfirm("");
  }

  function handleDelete() {
    if (deleteConfirm !== "ВИДАЛИТИ") {
      toast.push("Введіть «ВИДАЛИТИ» для підтвердження", "error");
      return;
    }
    deleteAccount();
    toast.push("Акаунт видалено", "info");
    router.push("/");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href="/profile"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft size={15} /> Профіль
      </Link>

      <div>
        <h1 className="text-h1 text-gray-900">Налаштування</h1>
        <p className="text-body text-gray-500 mt-1">Керуйте сповіщеннями, безпекою та акаунтом</p>
      </div>

      <Card>
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center">
            <Bell size={16} className="text-brand-600" />
          </div>
          <div>
            <h2 className="text-h3 text-gray-900">Сповіщення</h2>
            <p className="text-sm text-gray-500">Оберіть, що показувати у дзвіночку</p>
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {(Object.keys(PREF_LABELS) as (keyof typeof PREF_LABELS)[]).map((key) => (
            <div key={key} className="flex items-center justify-between py-3">
              <div className="flex-1 pr-4">
                <p className="text-sm font-medium text-gray-900">{PREF_LABELS[key].title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{PREF_LABELS[key].desc}</p>
              </div>
              <Toggle
                checked={state.prefs[key]}
                onChange={(v) => {
                  updatePrefs({ [key]: v });
                  toast.push("Налаштування збережено", "success");
                }}
              />
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-success-50 flex items-center justify-center">
            <Lock size={16} className="text-success-600" />
          </div>
          <div>
            <h2 className="text-h3 text-gray-900">Змінити пароль</h2>
            <p className="text-sm text-gray-500">Мінімум 6 символів. Час від часу освіжайте пароль.</p>
          </div>
        </div>
        <form onSubmit={handlePwChange} className="space-y-3">
          <FormField
            label="Поточний пароль"
            type={showPw ? "text" : "password"}
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            required
          />
          <FormField
            label="Новий пароль"
            type={showPw ? "text" : "password"}
            value={next}
            onChange={(e) => setNext(e.target.value)}
            required
          />
          <FormField
            label="Повторіть новий"
            type={showPw ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
            <input
              type="checkbox"
              checked={showPw}
              onChange={(e) => setShowPw(e.target.checked)}
              className="rounded text-brand-600 focus:ring-brand-500"
            />
            {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
            Показати паролі
          </label>
          {pwError && (
            <div className="text-sm text-danger-700 bg-danger-50 border border-danger-100 px-3 py-2 rounded-lg">
              {pwError}
            </div>
          )}
          <Button type="submit" loading={pwLoading} icon={<Save size={15} />}>
            Зберегти пароль
          </Button>
        </form>
      </Card>

      <Card>
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center">
            <ShieldCheck size={16} className="text-brand-600" />
          </div>
          <div>
            <h2 className="text-h3 text-gray-900">Сесія</h2>
            <p className="text-sm text-gray-500">Вийти з акаунту на цьому пристрої</p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            logout();
            toast.push("Ви вийшли з акаунту", "info");
            router.push("/");
          }}
        >
          Вийти
        </Button>
      </Card>

      <Card className="border-danger-200">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-9 h-9 rounded-lg bg-danger-50 flex items-center justify-center">
            <AlertTriangle size={16} className="text-danger-600" />
          </div>
          <div>
            <h2 className="text-h3 text-danger-700">Небезпечна зона</h2>
            <p className="text-sm text-gray-500">
              Видалення акаунту видалить усі ваші публікації, заявки та донати. Це необоротно.
            </p>
          </div>
        </div>
        <FormField
          label='Введіть «ВИДАЛИТИ» для підтвердження'
          value={deleteConfirm}
          onChange={(e) => setDeleteConfirm(e.target.value.toUpperCase())}
          placeholder="ВИДАЛИТИ"
        />
        <div className="mt-3">
          <Button variant="danger" onClick={handleDelete} icon={<Trash2 size={15} />}>
            Видалити акаунт
          </Button>
        </div>
      </Card>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-base ${
        checked ? "bg-brand-600" : "bg-gray-300"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-elev-1 transition-transform duration-base ${
          checked ? "translate-x-5" : ""
        }`}
      />
    </button>
  );
}
