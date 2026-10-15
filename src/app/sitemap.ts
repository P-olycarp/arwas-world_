import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/catalog";
import { siteUrl } from "@/lib/product-meta";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const products = await getProducts("en");
  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/ar`, changeFrequency: "weekly", priority: 0.9 },
    ...products.flatMap((p) => [
      { url: `${base}/p/${p.id}`, changeFrequency: "weekly" as const, priority: 0.8 },
      { url: `${base}/ar/p/${p.id}`, changeFrequency: "weekly" as const, priority: 0.7 },
    ]),
  ];
}