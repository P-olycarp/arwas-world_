import { connectDb } from "@/lib/db";
import { ProductModel } from "@/models/Product";
import { PRODUCTS, type Product } from "@/data/products";

/** Products for the public site. Falls back to the starter data until the database has products. */
export async function getProducts(): Promise<Product[]> {
  try {
    await connectDb();
    const total = await ProductModel.estimatedDocumentCount();
    if (total === 0) return PRODUCTS;
    const docs = await ProductModel.find({ published: true })
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean();
    return docs.map((d) => ({
      id: d.slug,
      kind: d.kind as Product["kind"],
      name: d.name,
      tagline: d.tagline,
      description: d.description,
      specs: (d.specs ?? []).map((s) => ({ label: s.label ?? "", value: s.value ?? "" })),
      price: d.price || undefined,
      image: d.image || undefined,
      model: d.model || undefined,
      scale: d.scale ?? 1,
      offsetY: d.offsetY ?? 0,
    }));
  } catch (error) {
    console.error("getProducts failed, using starter products", error);
    return PRODUCTS;
  }
}
