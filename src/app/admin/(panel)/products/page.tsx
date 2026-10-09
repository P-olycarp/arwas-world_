import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import { ProductModel } from "@/models/Product";
import { seedProducts } from "./actions";

export const metadata = { title: "Products" };
export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  await requireAdmin();
  await connectDb();
  const products = await ProductModel.find().sort({ sortOrder: 1, createdAt: 1 }).lean();

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1>Products</h1>
        <Link href="/admin/products/new" className="btn btn-primary">Add product</Link>
      </div>

      {products.length === 0 ? (
        <div className="card rounded-card p-6">
          <p className="mb-4 text-body-lg">
            No products in the database yet. The site is showing the starter products from the code.
            Import them here to start editing them, or add your own.
          </p>
          <form action={seedProducts}>
            <button type="submit" className="btn btn-secondary">Import starter products</button>
          </form>
        </div>
      ) : (
        <div className="card overflow-x-auto rounded-card">
          <table className="w-full min-w-[560px] text-left text-body-lg">
            <caption className="sr-only">All products</caption>
            <thead>
              <tr className="border-b border-line text-body text-muted">
                <th scope="col" className="p-4 font-semibold">Name</th>
                <th scope="col" className="p-4 font-semibold">Type</th>
                <th scope="col" className="p-4 font-semibold">Price</th>
                <th scope="col" className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={String(p._id)} className="border-b border-line last:border-0">
                  <th scope="row" className="p-4 font-semibold">
                    <Link href={`/admin/products/${String(p._id)}/edit`} className="link">
                      {p.name}
                    </Link>
                  </th>
                  <td className="p-4 capitalize">{p.kind}</td>
                  <td className="p-4">{p.price || "Request a quote"}</td>
                  <td className="p-4">{p.published ? "Published" : "Hidden"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
