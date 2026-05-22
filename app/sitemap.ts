import type { MetadataRoute } from "next";

const BASE = "https://diivolunteer.ua";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes = [
    "",
    "/about",
    "/faq",
    "/privacy",
    "/terms",
    "/safety",
    "/organize",
    "/auth",
    "/auth/register",
  ];
  return routes.map((r) => ({
    url: `${BASE}${r}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: r === "" ? 1 : 0.7,
  }));
}
