"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, LogIn, Shield, ArrowRight } from "lucide-react";
import { useApp } from "@/lib/store";
import { useToast } from "@/lib/toast";
import { FormField } from "@/components/FormField";

export default function LoginPage() {
  const { state, loginWithCredentials } = useApp();
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (state.currentUser) router.push("/profile");
  }, [state.currentUser, router]);

  // Auto-fill from saved email
  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem("dii_remember_email");
      if (savedEmail) setEmail(savedEmail);
    } catch {}
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Заповніть email та пароль");
      return;
    }

    setLoading(true);
    const res = await loginWithCredentials(email, password);
    setLoading(false);

    if (!res.ok) {
      setError(res.error ?? "Помилка входу");
      return;
    }

    try {
      if (remember) localStorage.setItem("dii_remember_email", email);
      else localStorage.removeItem("dii_remember_email");
    } catch {}

    toast.push("Вітаємо! Ви успішно увійшли.", "success");
    router.push("/");
  }

  return (
    <div className="max-w-md mx-auto mt-6 sm:mt-10">
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-elev-1">
        <div className="text-center mb-7">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-3">
            Д
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Вхід до Дій</h1>
          <p className="text-gray-500 text-sm mt-1">Раді бачити знову</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <FormField
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            autoFocus
          />

          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <label htmlFor="login-pw" className="block text-sm font-medium text-gray-800">
                Пароль
              </label>
              <button
                type="button"
                onClick={() =>
                  toast.push(
                    "Зверніться до підтримки: hello@diivolunteer.ua",
                    "info"
                  )
                }
                className="text-xs text-blue-600 hover:underline"
              >
                Забули?
              </button>
            </div>
            <div className="relative">
              <input
                id="login-pw"
                type={showPassword ? "text" : "password"}
                placeholder="Ваш пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full pl-3.5 pr-10 py-2.5 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-700 transition-colors"
                aria-label={showPassword ? "Сховати пароль" : "Показати пароль"}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Запам'ятати email
          </label>

          {error && (
            <div
              className="text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-lg flex items-center gap-2"
              role="alert"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-2.5 rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <LogIn size={16} />
            {loading ? "Входимо..." : "Увійти"}
          </button>

          <div className="flex items-center gap-2 text-xs text-gray-400 pt-1">
            <Shield size={12} />
            <span>Шифрування паролів (SHA-256). Дані зберігаються локально у браузері.</span>
          </div>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-xs text-gray-400">або</span>
          </div>
        </div>

        <Link
          href="/auth/register"
          className="flex items-center justify-center gap-2 w-full border border-gray-200 text-gray-700 font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
        >
          Створити новий акаунт
          <ArrowRight size={15} />
        </Link>

        <p className="text-center text-[11px] text-gray-400 mt-5 leading-relaxed">
          Натискаючи «Увійти», ви погоджуєтесь з{" "}
          <Link href="/terms" className="text-blue-600 hover:underline">
            Умовами
          </Link>{" "}
          та{" "}
          <Link href="/privacy" className="text-blue-600 hover:underline">
            Політикою конфіденційності
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
