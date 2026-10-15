"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { BDICT } from "@/lib/basket-i18n";
import { DICT, type Lang } from "@/lib/i18n";
import { rememberLang } from "@/lib/lang";
import { useBasket } from "./BasketProvider";

export default function Nav({ lang, home = "", switchHref }: { lang: Lang; home?: string; switchHref?: string }) {
  const t = DICT[lang].nav;
  const b = BDICT[lang].basket;
  const s = BDICT[lang].search;
  const { count, openBasket } = useBasket();
  const links = [
    { href: `${home}#studio`, label: t.showcase },
    { href: `${home}#shop`, label: t.shop },
    { href: `${home}#custom`, label: t.custom },
    { href: `${home}#markets`, label: t.markets },
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

  const switchLink = (extra: string) => (
    <a
      href={switchHref ?? t.switchHref}
      hrefLang={t.switchLang}
      lang={t.switchLang}
      onClick={() => rememberLang(t.switchLang)}
      className={extra}
    >
      {t.switchLabel}
    </a>
  );

  return (
    <header className="material-acrylic sticky top-0 z-50 border-b border-line">
      <nav
        aria-label={t.primary}
        className="mx-auto flex h-14 max-w-[1200px] items-center justify-between gap-2 px-4 sm:px-6"
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
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("arwas:open-search"))}
            aria-label={s.open}
            className="btn btn-subtle !px-0"
          >
            <Search size={22} aria-hidden />
          </button>
          {switchLink("btn btn-subtle hidden !px-3 !text-[0.9375rem] !font-medium sm:inline-flex")}
          <button
            type="button"
            onClick={openBasket}
            aria-label={b.open(count)}
            className="btn btn-primary relative !px-0 sm:!px-4"
          >
            <ShoppingBag size={20} aria-hidden />
            <span className="hidden sm:inline">{b.title}</span>
            {count > 0 && (
              <span
                aria-hidden
                className="absolute -end-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-caption font-bold text-white"
              >
                {count}
              </span>
            )}
          </button>
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
                  className="flex min-h-12 items-center rounded-control px-3 text-body-lg font-medium hover:bg-panel"
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li className="border-t border-line sm:hidden">
              {switchLink("flex min-h-12 items-center rounded-control px-3 text-body-lg font-medium hover:bg-panel")}
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}