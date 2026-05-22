"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  UserPlus,
  Check,
  X as XIcon,
  Heart,
  HandHeart,
  Shield,
  ArrowLeft,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { useToast } from "@/lib/toast";
import { FormField, FormTextarea } from "@/components/FormField";
import { validateRegistration, passwordStrength, isValidEmail } from "@/lib/auth";
import { cn } from "@/lib/utils";

type Step = 1 | 2;

export default function RegisterPage() {
  const { state, register } = useApp();
  const router = useRouter();
  const toast = useToast();

  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [location, setLocation] = useState("");
  const [role, setRole] = useState<"volunteer" | "organizer">("volunteer");
  const [bio, setBio] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  useEffect(() => {
    if (state.currentUser) router.push("/profile");
  }, [state.currentUser, router]);

  const strength = useMemo(() => passwordStrength(password), [password]);

  const checks = [
    { ok: password.length >= 8, label: "Мінімум 8 символів" },
    { ok: /[A-Za-zА-Яа-яІіЇїЄєҐґ]/.test(password), label: "Хоча б одна літера" },
    { ok: /[0-9]/.test(password), label: "Хоча б одна цифра" },
    { ok: !!password && password === passwordConfirm, label: "Паролі співпадають" },
  ];

  function nextStep() {
    setErrors({});
    setGeneralError(null);
    const localErrors: Record<string, string> = {};
    if (name.trim().length < 2) localErrors.name = "Ім'я має містити щонайменше 2 символи";
    if (!isValidEmail(email)) localErrors.email = "Введіть коректний email";

    if (Object.keys(localErrors).length > 0) {
      setErrors(localErrors);
      return;
    }
    setStep(2);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setGeneralError(null);

    if (!agreed) {
      setGeneralError("Прийміть умови, щоб продовжити");
      return;
    }

    const validationError = validateRegistration({
      name,
      email,
      password,
      passwordConfirm,
      location,
    });
    if (validationError) {
      setErrors({ [validationError.field ?? "_"]: validationError.message });
      return;
    }

    setLoading(true);
    const res = await register({ name, email, password, location, role, bio });
    setLoading(false);

    if (!res.ok) {
      setGeneralError(res.error ?? "Не вдалось створити акаунт");
      return;
    }
    toast.push(`Вітаємо в команді, ${res.user!.name}!`, "success");
    router.push("/");
  }

  return (
    <div className="max-w-md mx-auto mt-6 sm:mt-10">
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-elev-1">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-3">
            Д
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Створіть акаунт</h1>
          <p className="text-gray-500 text-sm mt-1">
            Долучайтеся до спільноти волонтерів
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="flex items-center gap-2 text-xs font-medium">
            <span
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center transition-colors",
                step >= 1 ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"
              )}
            >
              {step > 1 ? <Check size={14} /> : "1"}
            </span>
            <span className={step === 1 ? "text-gray-900" : "text-gray-400"}>
              Акаунт
            </span>
          </div>
          <div className="w-8 h-px bg-gray-200" />
          <div className="flex items-center gap-2 text-xs font-medium">
            <span
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center transition-colors",
                step >= 2 ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"
              )}
            >
              2
            </span>
            <span className={step === 2 ? "text-gray-900" : "text-gray-400"}>
              Профіль
            </span>
          </div>
        </div>

        {step === 1 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              nextStep();
            }}
            className="space-y-4"
            noValidate
          >
            <FormField
              label="Ім'я та прізвище"
              placeholder="Наприклад, Олена Шевченко"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              autoComplete="name"
              autoFocus
              required
            />

            <FormField
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              autoComplete="email"
              required
            />

            <div>
              <label htmlFor="reg-pw" className="block text-sm font-medium text-gray-800 mb-1.5">
                Пароль
              </label>
              <div className="relative">
                <input
                  id="reg-pw"
                  type={showPw ? "text" : "password"}
                  placeholder="Мінімум 8 символів"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  className={cn(
                    "w-full pl-3.5 pr-10 py-2.5 text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition",
                    errors.password ? "border-red-300" : "border-gray-200"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-700"
                  aria-label="Показати пароль"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {password.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          "flex-1 h-1 rounded-full transition-colors",
                          i < strength.score ? strength.color : "bg-gray-100"
                        )}
                      />
                    ))}
                  </div>
                  <p
                    className={cn(
                      "text-xs font-medium",
                      strength.score >= 3
                        ? "text-green-600"
                        : strength.score >= 2
                        ? "text-yellow-600"
                        : "text-orange-600"
                    )}
                  >
                    {strength.label}
                  </p>
                </div>
              )}

              {errors.password && (
                <span className="block text-xs text-red-600 mt-1">{errors.password}</span>
              )}
            </div>

            <FormField
              label="Повторіть пароль"
              type={showPw ? "text" : "password"}
              placeholder="Той самий пароль"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              error={errors.passwordConfirm}
              autoComplete="new-password"
              required
            />

            {password.length > 0 && (
              <ul className="space-y-1 text-xs">
                {checks.map((c) => (
                  <li
                    key={c.label}
                    className={cn(
                      "flex items-center gap-1.5",
                      c.ok ? "text-green-600" : "text-gray-400"
                    )}
                  >
                    {c.ok ? <Check size={12} /> : <XIcon size={12} />}
                    {c.label}
                  </li>
                ))}
              </ul>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-2.5 rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all"
            >
              Далі
              <UserPlus size={16} />
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <FormField
              label="Місто"
              placeholder="Київ, Львів, Одеса..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              error={errors.location}
              autoComplete="address-level2"
              autoFocus
            />

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1.5">
                Ваша роль
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole("volunteer")}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center",
                    role === "volunteer"
                      ? "border-blue-500 bg-blue-50 text-blue-900"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <HandHeart size={22} className={role === "volunteer" ? "text-blue-600" : "text-gray-500"} />
                  <span className="font-semibold text-sm">Волонтер</span>
                  <span className="text-xs text-gray-500 leading-tight">
                    Хочу долучатись до подій
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("organizer")}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center",
                    role === "organizer"
                      ? "border-blue-500 bg-blue-50 text-blue-900"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <Heart size={22} className={role === "organizer" ? "text-blue-600" : "text-gray-500"} />
                  <span className="font-semibold text-sm">Організатор</span>
                  <span className="text-xs text-gray-500 leading-tight">
                    Створюю події та збори
                  </span>
                </button>
              </div>
            </div>

            <FormTextarea
              label="Про себе (необов'язково)"
              placeholder="Кілька слів про вас, ваш досвід чи мотивацію"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              hint="Допомагає організаторам приймати рішення"
            />

            <label className="flex items-start gap-2 text-sm text-gray-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="leading-relaxed">
                Я приймаю{" "}
                <Link href="/terms" className="text-blue-600 hover:underline" target="_blank">
                  Умови
                </Link>{" "}
                та{" "}
                <Link href="/privacy" className="text-blue-600 hover:underline" target="_blank">
                  Політику конфіденційності
                </Link>
                . Розумію, що мої дані зберігаються локально у браузері.
              </span>
            </label>

            {generalError && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-lg" role="alert">
                {generalError}
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft size={15} /> Назад
              </button>
              <button
                type="submit"
                disabled={loading || !agreed}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-2.5 rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <UserPlus size={16} />
                {loading ? "Створюємо..." : "Створити акаунт"}
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-400 pt-1">
              <Shield size={12} />
              <span>Паролі хешуються SHA-256. Дані локальні, не передаються третім сторонам.</span>
            </div>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          Вже маєш акаунт?{" "}
          <Link href="/auth" className="text-blue-600 font-medium hover:underline">
            Увійти
          </Link>
        </p>
      </div>
    </div>
  );
}
