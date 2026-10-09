"use client";

import { useId, useState, type ChangeEvent } from "react";
import { upload } from "@vercel/blob/client";

type Props = {
  name: string;
  label: string;
  accept: string;
  folder: string;
  defaultValue: string;
  help?: string;
};

function announce(busy: boolean) {
  window.dispatchEvent(new CustomEvent("arwas:upload", { detail: busy }));
}

async function shrink(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
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

export default function FileField({ name, label, accept, folder, defaultValue, help }: Props) {
  const id = useId();
  const [url, setUrl] = useState(defaultValue);
  const [status, setStatus] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState("");
  const isImage = accept.startsWith("image");

  async function onChange(e: ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const file = input.files?.[0];
    if (!file) return;
    setStatus("busy");
    setError("");
    announce(true);
    try {
      let newUrl: string;
      if (isImage) {
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
        newUrl = data.url;
      } else {
        const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
        const blob = await withTimeout(
          upload(`${folder}/${safe}`, file, {
            access: "public",
            handleUploadUrl: "/api/admin/upload",
            contentType: safe.toLowerCase().endsWith(".glb") ? "model/gltf-binary" : file.type,
          }),
          5 * 60_000,
        );
        newUrl = blob.url;
      }
      setUrl(newUrl);
      setStatus("done");
    } catch (err) {
      console.error("Upload failed", err);
      setStatus("idle");
      setError(err instanceof Error ? err.message : "The upload failed.");
    } finally {
      announce(false);
      input.value = "";
    }
  }

  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-body-lg font-semibold">{label}</label>
      <input type="hidden" name={name} value={url} />
      {url && isImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-32 w-auto max-w-full rounded-card border border-line object-cover" />
      )}
      {url && !isImage && <p className="break-all text-body text-muted">{url.split("/").pop()}</p>}
      <div className="flex flex-wrap items-center gap-3">
        <input
          id={id}
          type="file"
          accept={accept}
          onChange={onChange}
          disabled={status === "busy"}
          aria-describedby={help ? `${id}-help` : undefined}
          className="text-body-lg"
        />
        {url && (
          <button type="button" className="btn btn-subtle !px-3" onClick={() => { setUrl(""); setStatus("idle"); }}>
            Remove
          </button>
        )}
      </div>
      {help && <p id={`${id}-help`} className="text-body text-muted">{help}</p>}
      <p role="status" className="text-body font-semibold">
        {status === "busy" && "Uploading, please wait. Do not press Save yet."}
        {status === "done" && "Uploaded. Press Save product to keep it."}
      </p>
      {error && <p role="alert" className="text-body font-semibold text-oman">{error}</p>}
    </div>
  );
}
