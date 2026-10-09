import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { readSession } from "@/lib/session";

export const runtime = "nodejs";

const ALLOWED = ["image/webp", "image/jpeg", "image/png"];
const MAX_BYTES = 4 * 1024 * 1024;

export async function POST(request: Request) {
  if (!(await readSession())) {
    return NextResponse.json({ error: "Sign in again to upload." }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file was received." }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: "Use a PNG, JPG or WebP image." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "The image is larger than 4 MB." }, { status: 400 });
  }

  const name = (file.name || "photo").replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 80);
  try {
    const blob = await put(`products/${name}`, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type,
    });
    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("upload-image failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed." },
      { status: 500 },
    );
  }
}
