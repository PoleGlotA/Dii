"use client";

import Link from "next/link";
import Image from "next/image";
import { useApp } from "@/lib/store";
import { LogIn, LogOut, Menu, X, Plus, UserPlus, Shield } from "lucide-react";
import { useState } from "react";
import { NotificationBell } from "@/components/NotificationBell";

export function Header() {
  const { state, logout } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm select-none">
              Д
            </div>
            <span className="font-bold text-gray-900 text-lg tracking-tight">
              Дій<span className="text-blue-600">.</span>
            </span>
          </Link>

          <nav className="hidden sm:flex items-center gap-6 text-sm font-medium">
            <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
              Стрічка
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-gray-900 transition-colors">
              Про нас
            </Link>
            {state.currentUser && (
              <Link href="/profile" className="text-gray-600 hover:text-gray-900 transition-colors">
                Профіль
              </Link>
            )}
          </nav>

          <div className="hidden sm:flex items-center gap-3">
            {state.currentUser ? (
              <>
                {state.currentUser.isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1.5 text-gray-600 text-sm font-medium px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Адмін-панель"
                  >
                    <Shield size={15} />
                  </Link>
                )}
                <NotificationBell />
                <Link
                  href="/post/new"
                  className="flex items-center gap-1.5 bg-blue-600 text-white text-sm font-medium px-3.5 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={15} />
                  Створити
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  <Image
                    src={state.currentUser.avatar}
                    alt={state.currentUser.name}
                    width={28}
                    height={28}
                    className="rounded-full bg-gray-100"
                    unoptimized
                  />
                  <span className="hidden md:inline">{state.currentUser.name.split(" ")[0]}</span>
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label="Вийти"
                >
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth"
                  className="flex items-center gap-1.5 text-gray-700 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <LogIn size={15} />
                  Увійти
                </Link>
                <Link
                  href="/auth/register"
                  className="flex items-center gap-1.5 bg-blue-600 text-white text-sm font-medium px-3.5 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <UserPlus size={15} />
                  Реєстрація
                </Link>
              </>
            )}
          </div>

          <button
            className="sm:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Меню"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="sm:hidden border-t border-gray-200 bg-white px-4 py-3 space-y-1 animate-fade-in">
          <Link
            href="/"
            className="block py-2 text-sm font-medium text-gray-700"
            onClick={() => setMenuOpen(false)}
          >
            Стрічка
          </Link>
          <Link
            href="/about"
            className="block py-2 text-sm font-medium text-gray-700"
            onClick={() => setMenuOpen(false)}
          >
            Про нас
          </Link>
          {state.currentUser ? (
            <>
              <Link
                href="/post/new"
                className="block py-2 text-sm font-medium text-blue-600"
                onClick={() => setMenuOpen(false)}
              >
                + Створити публікацію
              </Link>
              <Link
                href="/profile"
                className="block py-2 text-sm font-medium text-gray-700"
                onClick={() => setMenuOpen(false)}
              >
                Профіль
              </Link>
              {state.currentUser?.isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-2 py-2 text-sm font-medium text-gray-700"
                  onClick={() => setMenuOpen(false)}
                >
                  <Shield size={15} className="text-blue-600" /> Адмін-панель
                </Link>
              )}
              <button
                onClick={() => {
                  logout();
                  setMenuOpen(false);
                }}
                className="flex items-center gap-2 py-2 text-sm text-red-600"
              >
                <LogOut size={15} /> Вийти
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth"
                className="block py-2 text-sm font-medium text-gray-700"
                onClick={() => setMenuOpen(false)}
              >
                Увійти
              </Link>
              <Link
                href="/auth/register"
                className="block py-2 text-sm font-medium text-blue-600"
                onClick={() => setMenuOpen(false)}
              >
                Створити акаунт
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
