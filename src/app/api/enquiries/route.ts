import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDb } from "@/lib/db";
import { EnquiryModel } from "@/models/Enquiry";

const clean = (max: number) => z.string().trim().max(max).default("");

const schema = z.object({
  source: z.enum(["studio", "shop", "general"]).default("general"),
  product: clean(80),
  colour: clean(40),
  printText: clean(40),
});

// Best-effort limit per server instance: 20 clicks per minute per visitor.
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
  return h.n > 20;
}

export async function POST(request: Request) {
  const ip = (request.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  if (limited(ip)) return new NextResponse(null, { status: 429 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return new NextResponse(null, { status: 400 });

  try {
    await connectDb();
    await EnquiryModel.create(parsed.data);
  } catch (error) {
    console.error("enquiry save failed", error);
    return new NextResponse(null, { status: 500 });
  }
  return new NextResponse(null, { status: 204 });
}
