"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { rememberLang } from "@/lib/lang";

/** Suggests the Arabic site to visitors whose browser is set to Arabic. Shown once, never forced. */
export default function LanguageBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const remembered = document.cookie.split("; ").some((c) => c.startsWith("arwas_lang="));
      const langs = navigator.languages?.length ? navigator.languages : [navigator.language];
      const arabic = langs.some((l) => l.toLowerCase().startsWith("ar"));
      setShow(arabic && !remembered);
    } catch {
      /* ignore */
    }
  }, []);

  if (!show) return null;

  return (
    <section aria-label="Language" className="border-b border-line bg-panel">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3 px-4 py-2 sm:px-6">
        <p className="text-body-lg">
          <span lang="ar" dir="rtl" className="font-semibold">هذا الموقع متوفر بالعربية.</span>{" "}
          <span className="text-muted">This site is available in Arabic.</span>
        </p>
        <div className="flex items-center gap-1">
          <a
            href="/ar"
            hrefLang="ar"
            lang="ar"
            onClick={() => rememberLang("ar")}
            className="btn btn-primary !px-4"
          >
            عرض بالعربية
          </a>
          <button
            type="button"
            className="btn btn-subtle !px-0"
            aria-label="Dismiss language suggestion"
            onClick={() => {
              rememberLang("en");
              setShow(false);
            }}
          >
            <X size={20} aria-hidden />
          </button>
        </div>
      </div>
    </section>
  );
}