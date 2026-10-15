import type { Metadata } from "next";
import type { Product } from "@/data/products";
import type { Lang } from "@/lib/i18n";

export function siteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000")
  );
}

export function productMetadata(p: Product, lang: Lang): Metadata {
  const ar = lang === "ar";
  const path = `${ar ? "/ar" : ""}/p/${p.id}`;
  const title = `${p.name} | Arwas World`;
  const description = [p.tagline, p.price].filter(Boolean).join(" - ");
  const image = p.image ?? "/opengraph-image";
  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: path,
      languages: { en: `/p/${p.id}`, ar: `/ar/p/${p.id}` },
    },
    openGraph: {
      title,
      description,
      url: path,
      siteName: "Arwas World",
      type: "website",
      locale: ar ? "ar_OM" : "en_KE",
      images: [{ url: image, alt: p.name }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}