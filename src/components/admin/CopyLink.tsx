"use client";

import { useState } from "react";
import { productLink } from "@/lib/share-link";

export default function CopyLink({ slug, image }: { slug: string; image?: string }) {
  const [msg, setMsg] = useState("");

  async function copy(lang: "en" | "ar", label: string) {
    const u = productLink(window.location.origin, lang, slug, image);
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
      <button type="button" onClick={() => copy("en", "Link")} className="btn btn-secondary !min-h-11 !px-3">
        Copy link
      </button>
      <button type="button" onClick={() => copy("ar", "Arabic link")} className="btn btn-secondary !min-h-11 !px-3">
        Copy Arabic link
      </button>
      <a href={`/story/${slug}?download=1`} download className="btn btn-secondary !min-h-11 !px-3">
        Story image
      </a>
      <a href={`/p/${slug}`} target="_blank" rel="noopener noreferrer" className="link inline-flex min-h-11 items-center">
        Open
      </a>
      <span role="status" className="text-body font-semibold">{msg}</span>
    </div>
  );
}