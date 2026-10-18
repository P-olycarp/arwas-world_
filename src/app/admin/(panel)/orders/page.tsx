import { requireAdmin } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import { ORDER_STATUSES, OrderModel } from "@/models/Order";
import { formatMoney } from "@/lib/order";
import DeleteOrderButton from "@/components/admin/DeleteOrderButton";
import { deleteOrder, setOrderStatus } from "./actions";

export const metadata = { title: "Orders" };
export const dynamic = "force-dynamic";

const when = (d: Date) =>
  new Date(d).toLocaleString("en-KE", { timeZone: "Africa/Nairobi", dateStyle: "medium", timeStyle: "short" });

type Line = { name: string; size: string; colour: string; note: string; qty: number; unitPrice: number | null };

const lineText = (l: Line) =>
  [l.size && `Size ${l.size}`, l.colour, l.note && `"${l.note}"`].filter(Boolean).join(" \u00b7 ");

function Lines({ items, currency }: { items: Line[]; currency: string }) {
  return (
    <ul role="list" className="grid gap-2">
      {items.map((l, i) => (
        <li key={i} className="break-words">
          <span className="font-semibold">
            {l.qty} x {l.name}
          </span>
          {l.unitPrice !== null && <span className="text-muted"> ({formatMoney(l.unitPrice, currency)} each)</span>}
          {lineText(l) && <span className="block text-body text-muted">{lineText(l)}</span>}
        </li>
      ))}
    </ul>
  );
}

function StatusForm({ id, status }: { id: string; status: string }) {
  return (
    <form action={setOrderStatus.bind(null, id)} className="flex items-center gap-2">
      <label htmlFor={`status-${id}`} className="sr-only">Status</label>
      <select id={`status-${id}`} name="status" defaultValue={status} className="field min-w-0 flex-1 capitalize md:!w-auto md:flex-none">
        {ORDER_STATUSES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <button type="submit" className="btn btn-secondary !px-3">Save</button>
    </form>
  );
}

export default async function OrdersPage() {
  await requireAdmin();
  await connectDb();
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [total, week, fresh, rows] = await Promise.all([
    OrderModel.countDocuments(),
    OrderModel.countDocuments({ createdAt: { $gte: since } }),
    OrderModel.countDocuments({ status: "new" }),
    OrderModel.find().sort({ createdAt: -1 }).limit(100).lean(),
  ]);

  const orders = rows.map((o) => ({
    id: String(o._id),
    number: o.number,
    at: o.createdAt,
    currency: o.currency,
    total: o.total ?? null,
    note: o.note || "",
    site: o.lang === "ar" ? "Arabic site" : "English site",
    status: o.status,
    items: (o.items ?? []).map((l) => ({
      name: l.name ?? "",
      size: l.size ?? "",
      colour: l.colour ?? "",
      note: l.note ?? "",
      qty: l.qty ?? 1,
      unitPrice: l.unitPrice ?? null,
    })),
  }));

  const money = (o: { total: number | null; currency: string }) =>
    o.total !== null ? formatMoney(o.total, o.currency) : "To be confirmed";

  return (
    <>
      <h1 className="mb-6">Orders</h1>

      <div className="mb-6 grid grid-cols-3 gap-3 sm:gap-4">
        <div className="card rounded-card p-4 sm:p-5">
          <p className="text-body text-muted">New</p>
          <p className="text-title3 font-semibold">{fresh}</p>
        </div>
        <div className="card rounded-card p-4 sm:p-5">
          <p className="text-body text-muted">Last 7 days</p>
          <p className="text-title3 font-semibold">{week}</p>
        </div>
        <div className="card rounded-card p-4 sm:p-5">
          <p className="text-body text-muted">All orders</p>
          <p className="text-title3 font-semibold">{total}</p>
        </div>
      </div>

      <p className="mb-4 max-w-[46em] text-body-lg text-muted">
        Each order was saved when a customer pressed Send order on WhatsApp. Check your WhatsApp chats for the
        message with the same order number, confirm delivery and payment, and update the status here.
      </p>

      {orders.length === 0 ? (
        <div className="card rounded-card p-6 text-body-lg">No orders yet. Send a basket order from the site to test it.</div>
      ) : (
        <>
          <ul role="list" className="grid gap-3 md:hidden">
            {orders.map((o) => (
              <li key={o.id} className="card rounded-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p dir="ltr" className="text-subtitle font-bold">{o.number}</p>
                  <span className="rounded-full border border-line px-2.5 py-0.5 text-body">{o.site}</span>
                </div>
                <p className="mt-1 text-body text-muted">{when(o.at)}</p>
                <div className="mt-3 text-body-lg">
                  <Lines items={o.items} currency={o.currency} />
                </div>
                <p className="mt-3 text-body-lg font-semibold">Total: {money(o)}</p>
                {o.note && <p className="mt-2 break-words rounded-card bg-panel p-3 text-body">Notes: {o.note}</p>}
                <div className="mt-3 flex items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <StatusForm id={o.id} status={o.status} />
                  </div>
                  <DeleteOrderButton action={deleteOrder.bind(null, o.id)} label={o.number} />
                </div>
              </li>
            ))}
          </ul>

          <div className="card hidden overflow-x-auto rounded-card md:block">
            <table className="w-full min-w-[900px] text-left text-body-lg">
              <caption className="sr-only">Latest 100 orders</caption>
              <thead>
                <tr className="border-b border-line text-body text-muted">
                  <th scope="col" className="p-4 font-semibold">Order</th>
                  <th scope="col" className="p-4 font-semibold">When (Nairobi)</th>
                  <th scope="col" className="p-4 font-semibold">Items</th>
                  <th scope="col" className="p-4 font-semibold">Total</th>
                  <th scope="col" className="p-4 font-semibold">Status</th>
                  <th scope="col" className="p-4 font-semibold"><span className="sr-only">Delete</span></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-line align-top last:border-0">
                    <th scope="row" className="p-4 font-bold">
                      <span dir="ltr">{o.number}</span>
                      <span className="block text-body font-normal text-muted">{o.site}</span>
                    </th>
                    <td className="whitespace-nowrap p-4">{when(o.at)}</td>
                    <td className="max-w-[360px] p-4">
                      <Lines items={o.items} currency={o.currency} />
                      {o.note && <p className="mt-2 break-words text-body text-muted">Notes: {o.note}</p>}
                    </td>
                    <td className="whitespace-nowrap p-4 font-semibold">{money(o)}</td>
                    <td className="p-4"><StatusForm id={o.id} status={o.status} /></td>
                    <td className="p-4"><DeleteOrderButton action={deleteOrder.bind(null, o.id)} label={o.number} /></td>
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