"use client";

import { useState, type ChangeEvent } from "react";
import { upload } from "@vercel/blob/client";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";

export type MediaEntry = { kind: "image" | "video"; url: string };

function announce(busy: boolean) {
  window.dispatchEvent(new CustomEvent("arwas:upload", { detail: busy }));
}

async function shrink(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1800 / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/webp", 0.85));
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".webp", { type: "image/webp" });
  } catch {
    return file;
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error("The upload timed out. Check your internet connection and try again.")),
      ms,
    );
    promise.then(
      (v) => { clearTimeout(timer); resolve(v); },
      (e) => { clearTimeout(timer); reject(e); },
    );
  });
}

export default function MediaField({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue: MediaEntry[];
}) {
  const [items, setItems] = useState<MediaEntry[]>(defaultValue);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  async function onChange(e: ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const files = Array.from(input.files ?? []);
    if (files.length === 0) return;
    setError("");
    announce(true);
    const added: MediaEntry[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setBusy(`Uploading ${i + 1} of ${files.length}: ${file.name}. Do not press Save yet.`);
        const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 80);
        if (file.type.startsWith("video/")) {
          if (file.size > 100 * 1024 * 1024) {
            throw new Error(`${file.name} is larger than 100 MB. Compress it first.`);
          }
          const blob = await withTimeout(
            upload(`media/${safe}`, file, {
              access: "public",
              handleUploadUrl: "/api/admin/upload",
              contentType: file.type,
            }),
            10 * 60_000,
          );
          added.push({ kind: "video", url: blob.url });
        } else if (file.type.startsWith("image/")) {
          const small = await shrink(file);
          const body = new FormData();
          body.append("file", small);
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 60_000);
          let res: Response;
          try {
            res = await fetch("/api/admin/upload-image", { method: "POST", body, signal: controller.signal });
          } catch {
            throw new Error("The upload timed out or lost connection. Try again.");
          } finally {
            clearTimeout(timer);
          }
          const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
          if (!res.ok || !data.url) throw new Error(data.error ?? "The upload failed.");
          added.push({ kind: "image", url: data.url });
        } else {
          throw new Error(`${file.name} is not a photo or video.`);
        }
      }
    } catch (err) {
      console.error("Upload failed", err);
      setError(err instanceof Error ? err.message : "The upload failed.");
    } finally {
      if (added.length > 0) setItems((prev) => [...prev, ...added].slice(0, 12));
      setBusy("");
      announce(false);
      input.value = "";
    }
  }

  const move = (i: number, d: number) =>
    setItems((prev) => {
      const j = i + d;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  return (
    <fieldset className="grid gap-3 border-0 p-0">
      <legend className="mb-1 text-body-lg font-semibold">Photos and videos</legend>
      <input type="hidden" name={name} value={JSON.stringify(items)} />

      {items.length > 0 && (
        <ol role="list" className="grid gap-3">
          {items.map((m, i) => (
            <li key={m.url} className="card flex items-center gap-3 rounded-card p-2">
              <div className="h-16 w-16 flex-none overflow-hidden rounded-card bg-panel">
                {m.kind === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <video src={`${m.url}#t=0.1`} muted preload="metadata" className="h-full w-full object-cover" />
                )}
              </div>
              <p className="min-w-0 flex-1 text-body-lg">
                <span className="font-semibold">
                  {i + 1}. {m.kind === "image" ? "Photo" : "Video"}
                </span>
                {i === 0 && <span className="text-muted"> (shown first)</span>}
              </p>
              <button type="button" className="btn btn-subtle !px-0" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move item ${i + 1} earlier`}>
                <ArrowUp size={18} aria-hidden />
              </button>
              <button type="button" className="btn btn-subtle !px-0" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label={`Move item ${i + 1} later`}>
                <ArrowDown size={18} aria-hidden />
              </button>
              <button type="button" className="btn btn-subtle !px-0" onClick={() => setItems((p) => p.filter((_, k) => k !== i))} aria-label={`Remove item ${i + 1}`}>
                <Trash2 size={18} aria-hidden />
              </button>
            </li>
          ))}
        </ol>
      )}

      <input
        type="file"
        multiple
        accept="image/png,image/jpeg,image/webp,video/mp4,video/webm"
        onChange={onChange}
        disabled={busy !== "" || items.length >= 12}
        aria-label="Add photos or videos"
        aria-describedby="media-help"
        className="text-body-lg"
      />
      <p id="media-help" className="text-body text-muted">
        Up to 12 items. Photos: PNG, JPG or WebP. Videos: MP4 or WebM, best under 15 MB. You can
        select several files at once. Press Save product after the uploads finish.
      </p>
      <p role="status" className="text-body font-semibold">
        {busy || (items.length > 0 ? "" : "No photos or videos yet.")}
      </p>
      {error && <p role="alert" className="text-body font-semibold text-oman">{error}</p>}
    </fieldset>
  );
}
