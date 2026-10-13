"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { waLinkTo, type Product } from "@/data/products";
import { APPAREL_KINDS, BDICT } from "@/lib/basket-i18n";
import { DICT, type Lang } from "@/lib/i18n";
import { useBasket } from "./BasketProvider";

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f\u064b-\u065f\u0640]/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

const KIND_ALIASES: Record<string, string> = {
  hoodie: "hoodie hoodies hooded sweatshirt jumper هودي هوديات",
  tee: "tee tees t-shirt t-shirts tshirt tshirts shirt shirts تيشيرت تيشيرتات قميص",
  polo: "polo polos collar collared بولو",
  jersey: "jersey jerseys kit kits football soccer sports team قميص رياضي قمصان رياضية",
  tumbler: "tumbler tumblers cup straw travel تامبلر",
  bottle: "bottle bottles water flask زجاجة زجاجات",
  mug: "mug mugs coffee tea cup أكواب كوب",
};
const CAT_ALIASES = {
  apparel: "apparel clothes clothing wear garments ملابس لبس",
  drinkware: "drinkware drinks drinking cups tableware أدوات الشرب مشروبات",
};

type Field = { text: string; w: number };

function score(fields: Field[], tokens: string[]) {
  let total = 0;
  for (const tk of tokens) {
    let best = 0;
    for (const f of fields) if (f.w > best && f.text.includes(tk)) best = f.w;
    if (!best) return 0;
    total += best;
  }
  return total;
}

type PageEntry = {
  id: string;
  title: string;
  text: string;
  keywords: string;
  action: "anchor" | "basket" | "external";
  target?: string;
};

export default function SearchDialog({
  products,
  whatsapp,
  lang,
}: {
  products: Product[];
  whatsapp: string;
  lang: Lang;
}) {
  const d = DICT[lang];
  const t = BDICT[lang].search;
  const { openBasket } = useBasket();
  const ref = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const open = () => {
      const dlg = ref.current;
      if (!dlg || dlg.open) return;
      setQuery("");
      dlg.showModal();
      input.current?.focus();
    };
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing = el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable);
      if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        open();
      }
    };
    window.addEventListener("arwas:open-search", open);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("arwas:open-search", open);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const productIndex = useMemo(
    () =>
      products.map((p) => {
        const cat = APPAREL_KINDS.includes(p.kind) ? "apparel" : "drinkware";
        const fields: Field[] = [
          { text: norm(`${p.name} ${p.orderName ?? ""}`), w: 6 },
          { text: norm(KIND_ALIASES[p.kind] ?? p.kind), w: 5 },
          { text: norm(CAT_ALIASES[cat]), w: 2 },
          { text: norm(p.tagline), w: 2 },
          { text: norm(`${p.description} ${p.specs.map((s) => s.value).join(" ")}`), w: 1 },
        ];
        return { p, cat, fields };
      }),
    [products],
  );

  const pages = useMemo<PageEntry[]>(() => {
    const list: PageEntry[] = [
      { id: "showcase", title: d.nav.showcase, text: d.hero.intro, keywords: "products gallery photos videos المعرض صور فيديو", action: "anchor", target: "#studio" },
      { id: "shop", title: d.nav.shop, text: d.shop.intro, keywords: "buy order catalogue catalog range المتجر شراء", action: "anchor", target: "#shop" },
    ];
    d.craft.points.forEach((p, i) =>
      list.push({ id: `craft${i}`, title: p.title, text: p.body, keywords: "custom customise customize personalise print design logo name team تخصيص طباعة تصميم شعار", action: "anchor", target: "#custom" }),
    );
    d.process.steps.forEach((s, i) =>
      list.push({ id: `step${i}`, title: s.title, text: s.body, keywords: "order process steps how it works طلب خطوات كيف", action: "anchor", target: "#how" }),
    );
    const marketKw = [
      "kenya nairobi delivery shipping كينيا توصيل شحن",
      "oman muscat delivery shipping عمان عُمان توصيل شحن",
      "worldwide international global delivery shipping abroad العالم دولي توصيل شحن",
    ];
    d.markets.items.forEach((m, i) =>
      list.push({ id: `market${i}`, title: m.title, text: m.body, keywords: marketKw[i] ?? "", action: "anchor", target: "#markets" }),
    );
    const b = BDICT[lang].basket;
    list.push({ id: "mpesa", title: b.mpesa, text: b.mpesaNote, keywords: "mpesa m-pesa pay payment checkout lipa mobile money إم-بيسا دفع", action: "basket" });
    list.push({ id: "basket", title: b.title, text: b.emptyHint, keywords: "cart basket bag checkout سلة", action: "basket" });
    list.push({ id: "whatsapp", title: d.footer.wa, text: d.footer.blurb, keywords: "whatsapp contact chat message phone call contact us تواصل واتساب", action: "external" });
    return list;
  }, [d, lang]);

  const tokens = norm(query).split(" ").filter((x) => x.length >= 2);

  const productHits = tokens.length
    ? productIndex
        .map((e) => ({ ...e, s: score(e.fields, tokens) }))
        .filter((e) => e.s > 0)
        .sort((a, b) => b.s - a.s)
        .slice(0, 20)
    : [];
  const pageHits = tokens.length
    ? pages
        .map((e) => ({
          e,
          s: score(
            [
              { text: norm(e.title), w: 5 },
              { text: norm(e.keywords), w: 4 },
              { text: norm(e.text), w: 1 },
            ],
            tokens,
          ),
        }))
        .filter((x) => x.s > 0)
        .sort((a, b) => b.s - a.s)
        .slice(0, 6)
        .map((x) => x.e)
    : [];

  const close = () => ref.current?.close();

  const pickProduct = (p: Product) => {
    close();
    window.dispatchEvent(new CustomEvent("arwas:select", { detail: p.id }));
    setTimeout(() => document.getElementById("studio")?.scrollIntoView({ behavior: "smooth" }), 0);
  };
  const pickPage = (e: PageEntry) => {
    close();
    if (e.action === "basket") setTimeout(openBasket, 0);
    else if (e.action === "external") window.open(waLinkTo(whatsapp, "Hi Arwas World, I have a question."), "_blank", "noopener");
    else if (e.target) setTimeout(() => document.querySelector(e.target!)?.scrollIntoView({ behavior: "smooth" }), 0);
  };

  const total = productHits.length + pageHits.length;
  const groups = (["apparel", "drinkware"] as const)
    .map((cat) => ({ cat, list: productHits.filter((h) => h.cat === cat) }))
    .filter((g) => g.list.length > 0);

  return (
    <dialog
      ref={ref}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
      aria-label={t.title}
      className="mx-auto mb-auto mt-[8vh] w-[min(640px,92vw)] overflow-hidden rounded-panel border border-line bg-surface p-0 text-foreground shadow-e16 backdrop:bg-black/50"
    >
      <div className="flex max-h-[84dvh] flex-col">
        <div className="flex items-center gap-2 border-b border-line p-3">
          <Search size={20} aria-hidden className="ms-2 flex-none text-muted" />
          <input
            ref={input}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (productHits[0]) pickProduct(productHits[0].p);
                else if (pageHits[0]) pickPage(pageHits[0]);
              }
            }}
            placeholder={t.placeholder}
            aria-label={t.placeholder}
            autoComplete="off"
            className="min-h-11 min-w-0 flex-1 bg-transparent text-body-lg outline-none"
          />
          <button type="button" onClick={close} aria-label={t.close} className="btn btn-subtle !px-0">
            <X size={22} aria-hidden />
          </button>
        </div>

        <p className="sr-only" role="status">
          {tokens.length ? (total ? t.results(total) : t.none(query)) : ""}
        </p>

        <div className="overflow-y-auto p-3">
          {tokens.length === 0 && (
            <div className="grid gap-3 p-2">
              <p className="text-body-lg text-muted">{t.hint}</p>
              <div className="flex flex-wrap gap-2">
                {t.suggestions.map((s) => (
                  <button key={s} type="button" className="toggle" onClick={() => { setQuery(s); input.current?.focus(); }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {tokens.length > 0 && total === 0 && (
            <p className="p-3 text-body-lg">{t.none(query)}</p>
          )}

          {groups.map((g) => (
            <section key={g.cat} aria-label={g.cat === "apparel" ? t.apparel : t.drinkware} className="mb-3">
              <h3 className="px-2 pb-1 pt-2 text-body font-semibold text-muted">
                {t.products}: {g.cat === "apparel" ? t.apparel : t.drinkware}
              </h3>
              <ul role="list">
                {g.list.map(({ p }) => (
                  <li key={p.id}>
                    <button type="button" onClick={() => pickProduct(p)} className="flex min-h-14 w-full items-center gap-3 rounded-card p-2 text-start hover:bg-panel">
                      <span className="h-12 w-12 flex-none overflow-hidden rounded-card bg-panel">
                        {p.image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.image} alt="" className="h-full w-full object-cover" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold">{p.name}</span>
                        <span className="block truncate text-body text-muted">{p.tagline}</span>
                      </span>
                      {p.price && <span className="flex-none text-body font-semibold">{p.price}</span>}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          {pageHits.length > 0 && (
            <section aria-label={t.pages}>
              <h3 className="px-2 pb-1 pt-2 text-body font-semibold text-muted">{t.pages}</h3>
              <ul role="list">
                {pageHits.map((e) => (
                  <li key={e.id}>
                    <button type="button" onClick={() => pickPage(e)} className="block min-h-14 w-full rounded-card p-2 text-start hover:bg-panel">
                      <span className="block font-semibold">{e.title}</span>
                      <span className="line-clamp-2 block text-body text-muted">{e.text}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </dialog>
  );
}