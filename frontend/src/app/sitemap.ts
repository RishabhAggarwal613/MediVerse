import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mediverse.local";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: now, priority: 1 },
    { url: `${BASE_URL}/login`, lastModified: now, priority: 0.6 },
    { url: `${BASE_URL}/signup`, lastModified: now, priority: 0.9 },
    { url: `${BASE_URL}/signup/patient`, lastModified: now, priority: 0.7 },
    { url: `${BASE_URL}/signup/doctor`, lastModified: now, priority: 0.7 },
  ];
  return routes;
}
