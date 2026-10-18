import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import { ProductModel } from "@/models/Product";
import CopyLink from "@/components/admin/CopyLink";
import { seedProducts } from "./actions";

export const metadata = { title: "Products" };
export const dynamic = "force-dynamic";

function Status({ published }: { published: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-0.5 text-body">
      <span aria-hidden className={`h-2 w-2 rounded-full ${published ? "bg-kenya" : "bg-control"}`} />
      {published ? "Published" : "Hidden"}
    </span>
  );
}

export default async function ProductsPage() {
  await requireAdmin();
  await connectDb();
  const products = await ProductModel.find().sort({ sortOrder: 1, createdAt: 1 }).lean();
  const rows = products.map((p) => ({
    id: String(p._id),
    slug: p.slug,
    name: p.name,
    kind: p.kind,
    price: p.price || "Request a quote",
    published: p.published,
    image: p.image || "",
    cover: p.media?.find((m) => m.kind === "image")?.url ?? (p.image || ""),
  }));

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1>Products</h1>
        <Link href="/admin/products/new" className="btn btn-primary">Add product</Link>
      </div>

      {rows.length === 0 ? (
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
        <>
          <ul role="list" className="grid gap-3 md:hidden">
            {rows.map((p) => (
              <li key={p.id} className="card rounded-card p-3">
                <div className="flex gap-3">
                  <div className="h-20 w-16 flex-none overflow-hidden rounded-card bg-panel">
                    {p.cover && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.cover} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="break-words font-semibold">{p.name}</p>
                    <p className="text-body capitalize text-muted">
                      {p.kind} &middot; {p.price}
                    </p>
                    <div className="mt-2">
                      <Status published={p.published} />
                    </div>
                  </div>
                </div>
                <Link href={`/admin/products/${p.id}/edit`} className="btn btn-primary mt-3 w-full">
                  Edit {p.name}
                </Link>
                <div className="mt-3">
                  <CopyLink slug={p.slug} image={p.image || undefined} />
                </div>
              </li>
            ))}
          </ul>

          <div className="card hidden overflow-x-auto rounded-card md:block">
            <table className="w-full min-w-[860px] text-left text-body-lg">
              <caption className="sr-only">All products</caption>
              <thead>
                <tr className="border-b border-line text-body text-muted">
                  <th scope="col" className="p-4 font-semibold">Name</th>
                  <th scope="col" className="p-4 font-semibold">Type</th>
                  <th scope="col" className="p-4 font-semibold">Price</th>
                  <th scope="col" className="p-4 font-semibold">Status</th>
                  <th scope="col" className="p-4 font-semibold">Share</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id} className="border-b border-line last:border-0">
                    <th scope="row" className="p-4 font-semibold">
                      <Link href={`/admin/products/${p.id}/edit`} className="link">{p.name}</Link>
                    </th>
                    <td className="p-4 capitalize">{p.kind}</td>
                    <td className="p-4">{p.price}</td>
                    <td className="p-4"><Status published={p.published} /></td>
                    <td className="p-4"><CopyLink slug={p.slug} image={p.image || undefined} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}