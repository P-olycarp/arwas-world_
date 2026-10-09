"use client";

import { useEffect } from "react";

/** Records a click on any WhatsApp order link. Never blocks or delays the link. */
export default function EnquiryTracker() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as Element | null;
      const a = target?.closest?.("a[href^='https://wa.me/']") as HTMLAnchorElement | null;
      if (!a) return;
      const payload = {
        source: a.dataset.source ?? "general",
        product: a.dataset.product ?? "",
        colour: a.dataset.colour ?? "",
        printText: a.dataset.print ?? "",
      };
      try {
        fetch("/api/enquiries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          keepalive: true,
        }).catch(() => {});
      } catch {
        /* tracking must never break ordering */
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}
