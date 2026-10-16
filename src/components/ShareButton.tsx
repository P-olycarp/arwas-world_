"use client";

import { useEffect, useState } from "react";
import { Link2, Share2 } from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { productLink } from "@/lib/share-link";

export default function ShareButton({
  productId,
  image,
  lang,
}: {
  productId: string;
  name?: string;
  image?: string;
  lang: Lang;
}) {
  const ar = lang === "ar";
  const [canShare, setCanShare] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  const link = () => productLink(window.location.origin, lang, productId, image);

  async function copy() {
    const u = link();
    try {
      await navigator.clipboard.writeText(u);
      setMsg(ar ? "تم نسخ الرابط." : "Link copied.");
    } catch {
      window.prompt(ar ? "انسخ الرابط:" : "Copy this link:", u);
    }
    setTimeout(() => setMsg(""), 3000);
  }

  async function share() {
    try {
      await navigator.share({ url: link() });
    } catch {
      /* cancelled */
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {canShare && (
        <button type="button" onClick={share} className="btn btn-secondary !px-4">
          <Share2 size={18} aria-hidden />
          {ar ? "مشاركة" : "Share"}
        </button>
      )}
      <button type="button" onClick={copy} className="btn btn-secondary !px-4">
        <Link2 size={18} aria-hidden />
        {ar ? "نسخ الرابط" : "Copy link"}
      </button>
      <p role="status" className="text-body-lg font-semibold">{msg}</p>
    </div>
  );
}