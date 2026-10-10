import { connectDb } from "@/lib/db";
import { ProductModel } from "@/models/Product";
import { PRODUCTS, type MediaItem, type Product } from "@/data/products";
import { STARTER_AR, type Lang } from "@/lib/i18n";

type Spec = { label: string; value: string };

function parseSpecs(text: string): Spec[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .flatMap((l) => {
      const i = l.indexOf(":");
      return i > 0 ? [{ label: l.slice(0, i).trim(), value: l.slice(i + 1).trim() }] : [];
    });
}

function localizeStarter(p: Product, lang: Lang): Product {
  if (lang === "en") return p;
  const a = STARTER_AR[p.id];
  if (!a) return p;
  return { ...p, orderName: p.name, name: a.name, tagline: a.tagline, description: a.description, specs: a.specs };
}

/** Products for the public site, in English or Arabic. Falls back to the starter products until the database has products. */
export async function getProducts(lang: Lang = "en"): Promise<Product[]> {
  try {
    await connectDb();
    const total = await ProductModel.estimatedDocumentCount();
    if (total === 0) return PRODUCTS.map((p) => localizeStarter(p, lang));
    const docs = await ProductModel.find({ published: true })
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean();
    return docs.map((d) => {
      let media: MediaItem[] = (d.media ?? []).map((m) => ({
        kind: m.kind as "image" | "video",
        url: m.url,
      }));
      if (media.length === 0 && d.image) media = [{ kind: "image", url: d.image }];
      const cover = media.find((m) => m.kind === "image")?.url;

      const ar = lang === "ar";
      const starter = ar ? STARTER_AR[d.slug] : undefined;
      const arSpecs = ar ? parseSpecs(d.specsAr ?? "") : [];
      const enSpecs = (d.specs ?? []).map((s) => ({ label: s.label ?? "", value: s.value ?? "" }));

      return {
        id: d.slug,
        kind: d.kind as Product["kind"],
        orderName: d.name,
        name: ar ? d.nameAr || starter?.name || d.name : d.name,
        tagline: ar ? d.taglineAr || starter?.tagline || d.tagline : d.tagline,
        description: ar ? d.descriptionAr || starter?.description || d.description : d.description,
        specs: ar ? (arSpecs.length ? arSpecs : starter ? starter.specs : enSpecs) : enSpecs,
        price: d.price || undefined,
        image: cover,
        media,
        scale: 1,
        offsetY: 0,
      };
    });
  } catch (error) {
    console.error("getProducts failed, using starter products", error);
    return PRODUCTS.map((p) => localizeStarter(p, lang));
  }
}