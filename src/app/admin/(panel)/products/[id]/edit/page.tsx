import mongoose from "mongoose";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import { ProductModel } from "@/models/Product";
import type { ProductFormValues } from "@/lib/form-state";
import ProductForm from "@/components/admin/ProductForm";
import DeleteButton from "@/components/admin/DeleteButton";
import { deleteProduct } from "../../actions";

export const metadata = { title: "Edit product" };
export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) notFound();
  await connectDb();
  const doc = await ProductModel.findById(id).lean();
  if (!doc) notFound();

  const values: ProductFormValues = {
    name: doc.name,
    slug: doc.slug,
    kind: doc.kind,
    tagline: doc.tagline,
    description: doc.description,
    price: doc.price ?? "",
    image: doc.image ?? "",
    model: doc.model ?? "",
    scale: doc.scale ?? 1,
    offsetY: doc.offsetY ?? 0,
    sortOrder: doc.sortOrder ?? 0,
    published: doc.published ?? true,
    specs: (doc.specs ?? []).map((s) => ({ label: s.label ?? "", value: s.value ?? "" })),
  };

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1>Edit {doc.name}</h1>
        <DeleteButton action={deleteProduct.bind(null, id)} label={doc.name} />
      </div>
      <ProductForm id={id} values={values} />
    </>
  );
}
