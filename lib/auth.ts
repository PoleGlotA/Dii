export async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password + "dii_salt_2025");
  const buffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export interface AuthError {
  field?: string;
  message: string;
}

export function validateRegistration(data: {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  location: string;
}): AuthError | null {
  const trimmedName = data.name.trim();
  if (trimmedName.length < 2)
    return { field: "name", message: "Ім'я має містити щонайменше 2 символи" };
  if (!/^[A-Za-zА-Яа-яІіЇїЄєҐґʼ'\s-]+$/.test(trimmedName))
    return { field: "name", message: "Ім'я може містити лише літери, пробіли, дефіс та апостроф" };
  if (!isValidEmail(data.email))
    return { field: "email", message: "Введіть коректний email" };
  if (data.password.length < 8)
    return { field: "password", message: "Пароль має містити щонайменше 8 символів" };
  if (!/[A-Za-zА-Яа-яІіЇїЄєҐґ]/.test(data.password))
    return { field: "password", message: "Пароль має містити хоча б одну літеру" };
  if (!/[0-9]/.test(data.password))
    return { field: "password", message: "Пароль має містити хоча б одну цифру" };
  if (data.password !== data.passwordConfirm)
    return { field: "passwordConfirm", message: "Паролі не співпадають" };
  if (data.location.trim().length < 2)
    return { field: "location", message: "Вкажіть місто" };
  return null;
}

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  color: string;
}

export function passwordStrength(password: string): PasswordStrength {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-ZА-ЯІЇЄҐ]/.test(password) && /[a-zа-яіїєґ]/.test(password)) score++;
  if (/[0-9]/.test(password) && /[^A-Za-zА-Яа-яІіЇїЄєҐґ0-9]/.test(password)) score++;

  const map: Record<number, PasswordStrength> = {
    0: { score: 0, label: "Дуже слабкий", color: "bg-red-500" },
    1: { score: 1, label: "Слабкий", color: "bg-orange-500" },
    2: { score: 2, label: "Прийнятний", color: "bg-yellow-500" },
    3: { score: 3, label: "Надійний", color: "bg-green-500" },
    4: { score: 4, label: "Дуже надійний", color: "bg-green-600" },
  };
  return map[Math.min(score, 4)];
}
