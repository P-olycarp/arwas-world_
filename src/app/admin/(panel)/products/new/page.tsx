import { requireAdmin } from "@/lib/auth";
import { EMPTY_PRODUCT } from "@/lib/form-state";
import ProductForm from "@/components/admin/ProductForm";

export const metadata = { title: "New product" };

export default async function NewProductPage() {
  await requireAdmin();
  return (
    <>
      <h1 className="mb-6">New product</h1>
      <ProductForm id={null} values={EMPTY_PRODUCT} />
    </>
  );
}
