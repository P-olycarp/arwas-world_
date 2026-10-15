import { NextResponse } from "next/server";
import sharp from "sharp";
import { getProducts } from "@/lib/catalog";

export const runtime = "nodejs";

const BLOB_HOST = ".public.blob.vercel-storage.com";

/** Share-preview image for a product: the product photo converted to a standard JPEG, whatever format it was uploaded in. */
export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const fallback = () => NextResponse.redirect(new URL("/opengraph-image", request.url), 302);

  try {
    const product = (await getProducts("en")).find((p) => p.id === slug);
    const url = product?.image;
    if (!url) return fallback();

    const u = new URL(url);
    if (u.protocol !== "https:" || !u.hostname.endsWith(BLOB_HOST)) return fallback();

    const res = await fetch(url);
    if (!res.ok) return fallback();

    const input = Buffer.from(await res.arrayBuffer());
    const out = await sharp(input)
      .rotate()
      .resize(1200, 630, { fit: "contain", background: "#f5f5f5" })
      .jpeg({ quality: 85 })
      .toBuffer();

    return new NextResponse(new Uint8Array(out), {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error) {
    console.error("og image failed", error);
    return fallback();
  }
}