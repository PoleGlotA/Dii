import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/store";
import { ToastProvider } from "@/lib/toast";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileNav } from "@/components/MobileNav";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

const SITE_URL = "https://diivolunteer.ua";
const SITE_NAME = "Дій — Волонтерська платформа";
const DESCRIPTION =
  "Платформа для волонтерів України: події, збори, новини та спільнота тих, хто діє. Знаходь, де потрібна допомога, поряд із собою.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: "%s — Дій" },
  description: DESCRIPTION,
  keywords: ["волонтери", "збори", "допомога", "Україна", "ЗСУ", "ВПО", "благодійність"],
  authors: [{ name: "Dii Volunteer" }],
  openGraph: {
    title: SITE_NAME,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "Дій",
    locale: "uk_UA",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: SITE_NAME, description: DESCRIPTION },
  robots: { index: true, follow: true },
  alternates: { canonical: SITE_URL },
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk" className={inter.variable}>
      <body className="min-h-screen bg-gray-50 flex flex-col">
        <AppProvider>
          <ToastProvider>
            <Header />
            <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-6 sm:px-6 lg:px-8 pb-24 sm:pb-6">
              {children}
            </main>
            <Footer />
            <MobileNav />
          </ToastProvider>
        </AppProvider>
      </body>
    </html>
  );
}
