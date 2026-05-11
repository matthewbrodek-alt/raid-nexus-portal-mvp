import type { MetadataRoute } from "next";
import { featuredHeroes } from "@/lib/data/mock";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";
  const now = new Date();

  const staticRoutes = ["", "/donate", "/topup", "/useful", "/marketplace", "/heroes", "/chat", "/dashboard"].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8
  }));

  const heroRoutes = featuredHeroes.map((hero) => ({
    url: `${siteUrl}/heroes/${hero.slug ?? hero.id}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7
  }));

  return [...staticRoutes, ...heroRoutes];
}
