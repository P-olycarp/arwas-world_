import { ImageResponse } from "next/og";
import sharp from "sharp";
import { getProducts } from "@/lib/catalog";

export const runtime = "nodejs";

const BLOB_HOST = ".public.blob.vercel-storage.com";

async function photoData(url: string | undefined) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.protocol !== "https:" || !u.hostname.endsWith(BLOB_HOST)) return null;
    const res = await fetch(url);
    if (!res.ok) return null;
    const buf = await sharp(Buffer.from(await res.arrayBuffer()))
      .rotate()
      .resize(960, 880, { fit: "cover" })
      .jpeg({ quality: 85 })
      .toBuffer();
    return `data:image/jpeg;base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

const clip = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + "\u2026" : s);

/** A 1080x1920 Instagram Story image for a product. Top and bottom are left clear for Instagram's buttons and the Link sticker. */
export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = (await getProducts("en")).find((p) => p.id === slug);
  if (!product) return new Response("Not found", { status: 404 });

  const photo = await photoData(product.image);
  const download = new URL(request.url).searchParams.has("download");
  const headers: Record<string, string> = { "Cache-Control": "public, max-age=300, s-maxage=3600" };
  if (download) headers["Content-Disposition"] = `attachment; filename="${slug}-story.png"`;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: "#0b0b0c",
          color: "#ffffff",
          padding: "200px 60px 300px",
        }}
      >
        <div style={{ display: "flex", fontSize: 34, letterSpacing: 6, color: "#ff8a4d", fontWeight: 700 }}>
          ARWAS WORLD
        </div>
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} width={960} height={880} alt="" style={{ marginTop: 36, borderRadius: 36 }} />
        ) : (
          <div style={{ display: "flex", marginTop: 36, width: 960, height: 880, borderRadius: 36, background: "#2a2a2e" }} />
        )}
        <div style={{ display: "flex", marginTop: 44, fontSize: 64, fontWeight: 800, lineHeight: 1.08 }}>
          {clip(product.name, 60)}
        </div>
        <div style={{ display: "flex", marginTop: 16, fontSize: 36, color: "#c9c9ce" }}>
          {clip(product.tagline, 70)}
        </div>
        {product.price ? (
          <div style={{ display: "flex", marginTop: 22, fontSize: 54, fontWeight: 800, color: "#ff8a4d" }}>
            {product.price}
          </div>
        ) : null}
      </div>
    ),
    { width: 1080, height: 1920, headers },
  );
}