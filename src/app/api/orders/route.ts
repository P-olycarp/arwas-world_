import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDb } from "@/lib/db";
import { getProducts } from "@/lib/catalog";
import { OrderModel, nextOrderSeq } from "@/models/Order";
import { buildOrderMessage, round3, type OrderLine } from "@/lib/order";

export const runtime = "nodejs";

const schema = z.object({
  lang: z.enum(["en", "ar"]).default("en"),
  note: z.string().trim().max(200).default(""),
  items: z
    .array(
      z.object({
        productId: z.string().trim().min(1).max(80),
        size: z.string().trim().max(20).default(""),
        colour: z.string().trim().max(40).default(""),
        note: z.string().trim().max(80).default(""),
        qty: z.number().int().min(1).max(50),
      }),
    )
    .min(1)
    .max(20),
});

// Best-effort limit per server instance: 10 orders per minute per visitor.
const hits = new Map<string, { n: number; t: number }>();
function limited(ip: string) {
  const now = Date.now();
  if (hits.size > 5000) hits.clear();
  const h = hits.get(ip);
  if (!h || now - h.t > 60_000) {
    hits.set(ip, { n: 1, t: now });
    return false;
  }
  h.n += 1;
  return h.n > 10;
}

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

export async function POST(request: Request) {
  const ip = (request.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  if (limited(ip)) return fail("Too many orders in a short time. Wait a minute and try again.", 429);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("Invalid request.", 400);
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return fail("Check your basket and try again.", 400);
  const { lang, note, items } = parsed.data;

  const currency = lang === "ar" ? "OMR" : "KES";
  const products = await getProducts(lang);
  const byId = new Map(products.map((p) => [p.id, p]));

  const lines: (OrderLine & { productId: string })[] = [];
  for (const it of items) {
    const p = byId.get(it.productId);
    if (!p) return fail("Some items are no longer available. Remove them from your basket and try again.", 400);
    lines.push({
      productId: p.id,
      name: p.orderName ?? p.name,
      size: it.size,
      colour: it.colour,
      note: it.note,
      qty: it.qty,
      unitPrice: typeof p.amount === "number" ? p.amount : null,
    });
  }
  const priced = lines.every((l) => l.unitPrice !== null);
  const total = priced ? round3(lines.reduce((n, l) => n + (l.unitPrice as number) * l.qty, 0)) : null;

  try {
    await connectDb();
    const seq = await nextOrderSeq();
    const number = `ORD-${1000 + seq}`;
    await OrderModel.create({ number, seq, lang, currency, total, note, items: lines, status: "new" });
    const message = buildOrderMessage(lines, note, lang, { number, total, currency });
    return NextResponse.json({ number, total, currency, message }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("order save failed", error);
    return fail("The order could not be saved.", 500);
  }
}