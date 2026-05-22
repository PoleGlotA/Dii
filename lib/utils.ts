import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";
import { uk } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  try {
    return format(new Date(dateStr), "d MMMM yyyy", { locale: uk });
  } catch {
    return dateStr;
  }
}

export function timeAgo(dateStr: string): string {
  try {
    return formatDistanceToNow(new Date(dateStr), {
      addSuffix: true,
      locale: uk,
    });
  } catch {
    return "";
  }
}

export function formatCurrency(amount: number): string {
  const formatted = new Intl.NumberFormat("uk-UA", {
    maximumFractionDigits: 0,
  }).format(amount);
  return `${formatted} грн`;
}

export function progressPercent(current: number, target: number): number {
  return Math.min(Math.round((current / target) * 100), 100);
}

const AVATAR_PALETTE = [
  "#2563eb", "#7c3aed", "#db2777", "#dc2626",
  "#ea580c", "#ca8a04", "#16a34a", "#0891b2",
  "#0d9488", "#4f46e5",
];

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function generateAvatar(name: string): string {
  const trimmed = (name ?? "").trim();
  const initials = trimmed
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "Д";
  const color = AVATAR_PALETTE[hashStr(trimmed) % AVATAR_PALETTE.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="50" fill="${color}"/><text x="50" y="58" font-family="Inter,system-ui,sans-serif" font-size="42" font-weight="700" text-anchor="middle" fill="white">${initials}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function initials(name: string): string {
  return (name ?? "")
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";
}
