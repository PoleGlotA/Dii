import Link from "next/link";
import { Heart, Mail, Github, Send, Globe } from "lucide-react";

const SECTIONS = [
  {
    title: "Платформа",
    links: [
      { href: "/about", label: "Про нас" },
      { href: "/organize", label: "Як організувати" },
      { href: "/faq", label: "Питання" },
      { href: "/safety", label: "Безпека" },
    ],
  },
  {
    title: "Спільнота",
    links: [
      { href: "/", label: "Стрічка" },
      { href: "/auth/register", label: "Долучитися" },
      { href: "/tag/медицина", label: "Медицина" },
      { href: "/tag/Київ", label: "Київ" },
    ],
  },
  {
    title: "Правова інформація",
    links: [
      { href: "/terms", label: "Умови" },
      { href: "/privacy", label: "Конфіденційність" },
      { href: "/safety", label: "Правила спільноти" },
    ],
  },
];

const SOCIAL = [
  { href: "mailto:hello@diivolunteer.ua", label: "Email", icon: Mail },
  { href: "https://t.me/diivolunteer", label: "Telegram", icon: Send },
  { href: "https://github.com/dii-volunteer", label: "GitHub", icon: Github },
];

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-gray-200 bg-white mt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-base select-none">
                Д
              </div>
              <span className="font-bold text-gray-900 text-lg tracking-tight">
                Дій<span className="text-blue-600">.</span>
              </span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed">
              Платформа волонтерів України. Події, збори, новини й спільнота —
              в одному місці, без бюрократії.
            </p>
            <div className="flex items-center gap-2">
              {SOCIAL.map(({ href, label, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 flex items-center justify-center text-gray-500 transition-colors"
                  aria-label={label}
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-500 hover:text-blue-700 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Зроблено з</span>
            <Heart size={14} className="text-red-500 fill-red-500" />
            <span>для України, {year}</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Globe size={11} />
              Українська
            </span>
            <span>v1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
