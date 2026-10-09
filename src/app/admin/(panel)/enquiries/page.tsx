import { requireAdmin } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import { ENQUIRY_STATUSES, EnquiryModel } from "@/models/Enquiry";
import { setEnquiryStatus } from "./actions";

export const metadata = { title: "Enquiries" };
export const dynamic = "force-dynamic";

const SOURCE_LABEL: Record<string, string> = {
  studio: "3D studio",
  shop: "Shop",
  general: "General button",
};

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

  return (
    <>
      <h1 className="mb-6">Enquiries</h1>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="card rounded-card p-5">
          <p className="text-body text-muted">Total clicks</p>
          <p className="text-title3 font-semibold">{total}</p>
        </div>
        <div className="card rounded-card p-5">
          <p className="text-body text-muted">Last 7 days</p>
          <p className="text-title3 font-semibold">{week}</p>
        </div>
        <div className="card rounded-card p-5">
          <p className="text-body text-muted">Most wanted</p>
          {top.length === 0 ? (
            <p className="text-body-lg">No data yet</p>
          ) : (
            <ol className="mt-1 list-decimal pl-5 text-body-lg">
              {top.map((t) => (
                <li key={t._id}>
                  {t._id} ({t.count})
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      <p className="mb-4 max-w-[46em] text-body-lg text-muted">
        Each row is a click on an order button. It means the visitor opened WhatsApp, not that
        they sent the message, so check your WhatsApp chats and update the status as you follow up.
      </p>

      {rows.length === 0 ? (
        <div className="card rounded-card p-6 text-body-lg">
          No enquiries yet. Click an Order button on the site to test it.
        </div>
      ) : (
        <div className="card overflow-x-auto rounded-card">
          <table className="w-full min-w-[820px] text-left text-body-lg">
            <caption className="sr-only">Latest 100 enquiries</caption>
            <thead>
              <tr className="border-b border-line text-body text-muted">
                <th scope="col" className="p-4 font-semibold">When (Nairobi)</th>
                <th scope="col" className="p-4 font-semibold">Product</th>
                <th scope="col" className="p-4 font-semibold">Colour</th>
                <th scope="col" className="p-4 font-semibold">Print text</th>
                <th scope="col" className="p-4 font-semibold">From</th>
                <th scope="col" className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => {
                const id = String(e._id);
                return (
                  <tr key={id} className="border-b border-line last:border-0">
                    <td className="p-4 whitespace-nowrap">
                      {new Date(e.createdAt).toLocaleString("en-KE", {
                        timeZone: "Africa/Nairobi",
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="p-4">{e.product || "General"}</td>
                    <td className="p-4">{e.colour || "-"}</td>
                    <td className="p-4">{e.printText || "-"}</td>
                    <td className="p-4">{SOURCE_LABEL[e.source] ?? e.source}</td>
                    <td className="p-4">
                      <form action={setEnquiryStatus.bind(null, id)} className="flex items-center gap-2">
                        <label htmlFor={`status-${id}`} className="sr-only">
                          Status
                        </label>
                        <select
                          id={`status-${id}`}
                          name="status"
                          defaultValue={e.status}
                          className="field !w-auto capitalize"
                        >
                          {ENQUIRY_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <button type="submit" className="btn btn-secondary !px-3">
                          Save
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
