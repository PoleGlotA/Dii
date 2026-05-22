import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/auth", "/settings", "/profile/edit"] },
    ],
    sitemap: "https://diivolunteer.ua/sitemap.xml",
  };
}
