"use server";

import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import { KINDS } from "@/lib/kinds";
import { PRODUCTS } from "@/data/products";
import { ProductModel } from "@/models/Product";
import type { FormState } from "@/lib/form-state";

const text = (max: number) => z.string().trim().max(max);

const blobUrl = z.string().trim().refine((u) => {
  try {
    const x = new URL(u);
    return x.protocol === "https:" && x.hostname.endsWith(".public.blob.vercel-storage.com");
  } catch {
    return false;
  }
}, "Use the upload button to add photos and videos.");

const mediaList = z
  .array(z.object({ kind: z.enum(["image", "video"]), url: blobUrl }))
  .max(12, "Add up to 12 photos and videos.");

const schema = z.object({
  name: text(80).min(2, "Enter a product name."),
  slug: text(60).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "The slug can only use lowercase letters, numbers and hyphens."),
  kind: z.enum(KINDS, "Select a product type."),
  tagline: text(120).min(2, "Enter a tagline."),
  description: text(600).min(10, "Enter a description of at least 10 characters."),
  price: text(40),
  nameAr: text(80),
  taglineAr: text(120),
  descriptionAr: text(600),
  specsAr: text(400),
  sortOrder: z.coerce.number().int("Sort order must be a whole number.").min(0).max(9999),
});

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
}

export async function saveProduct(id: string | null, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const get = (k: string) => String(formData.get(k) ?? "");
  const name = get("name");

  const parsed = schema.safeParse({
    name,
    slug: get("slug").trim() || slugify(name),
    kind: get("kind"),
    tagline: get("tagline"),
    description: get("description"),
    price: get("price"),
    nameAr: get("nameAr"),
    taglineAr: get("taglineAr"),
    descriptionAr: get("descriptionAr"),
    specsAr: get("specsAr"),
    sortOrder: get("sortOrder"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }

  let rawMedia: unknown = [];
  try {
    rawMedia = JSON.parse(get("media") || "[]");
  } catch {
    return { error: "The media list is invalid. Reload the page and try again." };
  }
  const media = mediaList.safeParse(rawMedia);
  if (!media.success) {
    return { error: media.error.issues[0]?.message ?? "The media list is invalid." };
  }

  const specs = [0, 1, 2, 3]
    .map((i) => ({
      label: get(`specLabel${i}`).trim().slice(0, 40),
      value: get(`specValue${i}`).trim().slice(0, 80),
    }))
    .filter((s) => s.label && s.value);

  const data = {
    ...parsed.data,
    specs,
    media: media.data,
    image: media.data.find((m) => m.kind === "image")?.url ?? "",
    published: formData.get("published") === "on",
  };

  try {
    await connectDb();
    if (id) {
      if (!mongoose.isValidObjectId(id)) return { error: "Product not found." };
      await ProductModel.updateOne({ _id: id }, { $set: data });
    } else {
      await ProductModel.create(data);
    }
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      return { error: "That slug is already used by another product." };
    }
    console.error("saveProduct failed", error);
    return { error: "The product could not be saved. Try again." };
  }

  revalidatePath("/");
  revalidatePath("/ar");
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function deleteProduct(id: string): Promise<void> {
  await requireAdmin();
  if (mongoose.isValidObjectId(id)) {
    await connectDb();
    await ProductModel.deleteOne({ _id: id });
  }
  revalidatePath("/");
  revalidatePath("/ar");
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function seedProducts(): Promise<void> {
  await requireAdmin();
  await connectDb();
  if ((await ProductModel.estimatedDocumentCount()) === 0) {
    await ProductModel.insertMany(
      PRODUCTS.map((p, i) => ({
        slug: p.id,
        kind: p.kind,
        name: p.name,
        tagline: p.tagline,
        description: p.description,
        specs: p.specs,
        price: p.price ?? "",
        image: p.image ?? "",
        media: p.image ? [{ kind: "image", url: p.image }] : [],
        published: true,
        sortOrder: i,
      })),
    );
  }
  revalidatePath("/");
  revalidatePath("/ar");
  revalidatePath("/admin/products");
  redirect("/admin/products");
}
