"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { waLinkTo } from "@/data/products";
import { DICT, type Lang } from "@/lib/i18n";

export default function Nav({ whatsapp, lang }: { whatsapp: string; lang: Lang }) {
  const t = DICT[lang].nav;
  const links = [
    { href: "#studio", label: t.showcase },
    { href: "#shop", label: t.shop },
    { href: "#custom", label: t.custom },
    { href: "#markets", label: t.markets },
  ];
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="material-acrylic sticky top-0 z-50 border-b border-line">
      <nav
        aria-label={t.primary}
        className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-4 sm:px-6"
      >
        <a href="#main" className="inline-flex min-h-11 items-center text-body-lg font-semibold">
          {t.brand}
        </a>

        <ul role="list" className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="btn btn-subtle !min-h-11 !px-3 !text-[0.9375rem] !font-medium">
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1">
          <a
            href={t.switchHref}
            hrefLang={t.switchLang}
            lang={t.switchLang}
            className="btn btn-subtle !px-3 !text-[0.9375rem] !font-medium"
          >
            {t.switchLabel}
          </a>
          <a
            href={waLinkTo(whatsapp, "Hi Arwas World, I would like to place a custom order.")}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary !px-4"
          >
            {t.order}
            <span className="sr-only">{t.newTab}</span>
          </a>
          <button
            ref={menuButton}
            type="button"
            className="btn btn-subtle !px-0 md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? t.closeMenu : t.openMenu}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
          </button>
        </div>
      </nav>

      {open && (
        <div id="mobile-menu" className="border-t border-line bg-surface shadow-e8 md:hidden">
          <ul role="list" className="mx-auto max-w-[1200px] px-2 py-2">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 items-center rounded-control px-3 text-body-lg font-medium hover:bg-panel"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
