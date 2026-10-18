import { requireAdmin } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import { ENQUIRY_STATUSES, EnquiryModel } from "@/models/Enquiry";
import { setEnquiryStatus } from "./actions";

export const metadata = { title: "Enquiries" };
export const dynamic = "force-dynamic";

const SOURCE_LABEL: Record<string, string> = {
  studio: "3D studio",
  showcase: "Showcase",
  floating: "Floating button",
  basket: "Basket",
  shop: "Shop",
  general: "General button",
};

const when = (d: Date) =>
  new Date(d).toLocaleString("en-KE", { timeZone: "Africa/Nairobi", dateStyle: "medium", timeStyle: "short" });

function StatusForm({ id, status }: { id: string; status: string }) {
  return (
    <form action={setEnquiryStatus.bind(null, id)} className="flex items-center gap-2">
      <label htmlFor={`status-${id}`} className="sr-only">Status</label>
      <select id={`status-${id}`} name="status" defaultValue={status} className="field min-w-0 flex-1 capitalize md:!w-auto md:flex-none">
        {ENQUIRY_STATUSES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <button type="submit" className="btn btn-secondary !px-3">Save</button>
    </form>
  );
}

export default async function EnquiriesPage() {
  await requireAdmin();
  await connectDb();
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [total, week, top, rows] = await Promise.all([
    EnquiryModel.countDocuments(),
    EnquiryModel.countDocuments({ createdAt: { $gte: since } }),
    EnquiryModel.aggregate<{ _id: string; count: number }>([
      { $match: { product: { $ne: "" } } },
      { $group: { _id: "$product", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]),
    EnquiryModel.find().sort({ createdAt: -1 }).limit(100).lean(),
  ]);

  const items = rows.map((e) => ({
    id: String(e._id),
    at: e.createdAt,
    product: e.product || "General",
    colour: e.colour || "",
    printText: e.printText || "",
    source: SOURCE_LABEL[e.source] ?? e.source,
    status: e.status,
    details: e.details || "",
  }));

  return (
    <>
      <h1 className="mb-6">Enquiries</h1>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
        <div className="card rounded-card p-4 sm:p-5">
          <p className="text-body text-muted">Total clicks</p>
          <p className="text-title3 font-semibold">{total}</p>
        </div>
        <div className="card rounded-card p-4 sm:p-5">
          <p className="text-body text-muted">Last 7 days</p>
          <p className="text-title3 font-semibold">{week}</p>
        </div>
        <div className="card col-span-2 rounded-card p-4 sm:p-5 md:col-span-1">
          <p className="text-body text-muted">Most wanted</p>
          {top.length === 0 ? (
            <p className="text-body-lg">No data yet</p>
          ) : (
            <ol className="mt-1 list-decimal pl-5 text-body-lg">
              {top.map((t) => (
                <li key={t._id} className="break-words">{t._id} ({t.count})</li>
              ))}
            </ol>
          )}
        </div>
      </div>

      <p className="mb-4 max-w-[46em] text-body-lg text-muted">
        Each row is a click on an order button. It means the visitor opened WhatsApp, not that they
        sent the message, so check your WhatsApp chats and update the status as you follow up.
      </p>

      {items.length === 0 ? (
        <div className="card rounded-card p-6 text-body-lg">
          No enquiries yet. Click an Order button on the site to test it.
        </div>
      ) : (
        <>
          <ul role="list" className="grid gap-3 md:hidden">
            {items.map((e) => (
              <li key={e.id} className="card rounded-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="min-w-0 break-words font-semibold">{e.product}</p>
                  <span className="rounded-full border border-line px-2.5 py-0.5 text-body">{e.source}</span>
                </div>
                <p className="mt-1 text-body text-muted">{when(e.at)}</p>
                {(e.colour || e.printText) && (
                  <p className="mt-2 break-words text-body-lg">
                    {[e.colour, e.printText && `"${e.printText}"`].filter(Boolean).join(" \u00b7 ")}
                  </p>
                )}
                {e.details && (
                  <details className="mt-2">
                    <summary className="flex min-h-11 cursor-pointer items-center font-semibold text-brand">
                      Order details
                    </summary>
                    <p className="whitespace-pre-wrap break-words rounded-card bg-panel p-3 text-body">{e.details}</p>
                  </details>
                )}
                <div className="mt-3">
                  <StatusForm id={e.id} status={e.status} />
                </div>
              </li>
            ))}
          </ul>

          <div className="card hidden overflow-x-auto rounded-card md:block">
            <table className="w-full min-w-[880px] text-left text-body-lg">
              <caption className="sr-only">Latest 100 enquiries</caption>
              <thead>
                <tr className="border-b border-line text-body text-muted">
                  <th scope="col" className="p-4 font-semibold">When (Nairobi)</th>
                  <th scope="col" className="p-4 font-semibold">Product</th>
                  <th scope="col" className="p-4 font-semibold">Colour</th>
                  <th scope="col" className="p-4 font-semibold">Print text</th>
                  <th scope="col" className="p-4 font-semibold">Order details</th>
                  <th scope="col" className="p-4 font-semibold">From</th>
                  <th scope="col" className="p-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((e) => (
                  <tr key={e.id} className="border-b border-line align-top last:border-0">
                    <td className="whitespace-nowrap p-4">{when(e.at)}</td>
                    <td className="p-4">{e.product}</td>
                    <td className="p-4">{e.colour || "-"}</td>
                    <td className="p-4">{e.printText || "-"}</td>
                    <td className="max-w-[340px] p-4 text-body">
                      <span className="whitespace-pre-wrap break-words">{e.details || "-"}</span>
                    </td>
                    <td className="p-4">{e.source}</td>
                    <td className="p-4"><StatusForm id={e.id} status={e.status} /></td>
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