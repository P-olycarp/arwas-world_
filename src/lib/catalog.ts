import { connectDb } from "@/lib/db";
import { ProductModel } from "@/models/Product";
import { PRODUCTS, type MediaItem, type Product } from "@/data/products";

/** Products for the public site. Falls back to the starter products until the database has products. */
export async function getProducts(): Promise<Product[]> {
  try {
    await connectDb();
    const total = await ProductModel.estimatedDocumentCount();
    if (total === 0) return PRODUCTS;
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
      return {
        id: d.slug,
        kind: d.kind as Product["kind"],
        name: d.name,
        tagline: d.tagline,
        description: d.description,
        specs: (d.specs ?? []).map((s) => ({ label: s.label ?? "", value: s.value ?? "" })),
        price: d.price || undefined,
        image: cover,
        media,
        scale: 1,
        offsetY: 0,
      };
    });
  } catch (error) {
    console.error("getProducts failed, using starter products", error);
    return PRODUCTS;
  }
}
