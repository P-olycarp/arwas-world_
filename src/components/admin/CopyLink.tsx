"use client";

import { useState } from "react";

export default function CopyLink({ slug }: { slug: string }) {
  const [msg, setMsg] = useState("");

  async function copy(path: string, label: string) {
    const u = `${window.location.origin}${path}`;
    try {
      await navigator.clipboard.writeText(u);
      setMsg(`${label} copied.`);
    } catch {
      window.prompt("Copy this link:", u);
    }
    setTimeout(() => setMsg(""), 3000);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={() => copy(`/p/${slug}`, "Link")} className="btn btn-secondary !min-h-11 !px-3">
        Copy link
      </button>
      <button type="button" onClick={() => copy(`/ar/p/${slug}`, "Arabic link")} className="btn btn-secondary !min-h-11 !px-3">
        Copy Arabic link
      </button>
      <a href={`/p/${slug}`} target="_blank" rel="noopener noreferrer" className="link inline-flex min-h-11 items-center">
        Open
      </a>
      <span role="status" className="text-body font-semibold">{msg}</span>
    </div>
  );
}