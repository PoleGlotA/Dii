import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Дій — Волонтерська платформа",
    short_name: "Дій",
    description:
      "Платформа для волонтерів України: події, збори, новини та спільнота тих, хто діє.",
    start_url: "/",
    display: "standalone",
    background_color: "#f9fafb",
    theme_color: "#2563eb",
    lang: "uk",
    orientation: "portrait",
    categories: ["social", "lifestyle"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
