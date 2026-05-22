"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, Bell, User, Bookmark } from "lucide-react";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: Home, label: "Стрічка" },
  { href: "/saved", icon: Bookmark, label: "Збережені" },
  { href: "/post/new", icon: PlusCircle, label: "Створити", accent: true },
  { href: "/notifications", icon: Bell, label: "Сповіщення" },
  { href: "/profile", icon: User, label: "Профіль" },
];

export function MobileNav() {
  const pathname = usePathname();
  const { state, unreadNotifications } = useApp();

  if (!state.currentUser) return null;

  const unread = unreadNotifications();

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-gray-200 safe-area-inset-bottom">
      <div className="flex items-stretch">
        {navItems.map(({ href, icon: Icon, label, accent }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          const isBell = href === "/notifications";

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[56px] relative transition-colors",
                accent
                  ? "text-blue-600"
                  : active
                  ? "text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              )}
              aria-label={label}
            >
              <div className="relative">
                <Icon
                  size={accent ? 26 : 22}
                  strokeWidth={active || accent ? 2.2 : 1.8}
                  className={cn(
                    "transition-transform",
                    active && !accent && "scale-110"
                  )}
                />
                {isBell && unread > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium leading-none",
                  accent && "text-blue-600"
                )}
              >
                {label}
              </span>
              {active && !accent && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-blue-600 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
