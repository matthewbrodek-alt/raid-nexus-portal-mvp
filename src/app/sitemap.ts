import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";
  const now = new Date();

  const staticRoutes = ["", "/donate", "/topup", "/useful", "/marketplace", "/heroes", "/chat", "/dashboard", "/privacy", "/terms", "/consent", "/cookies"].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8
  }));

  return staticRoutes;
}
