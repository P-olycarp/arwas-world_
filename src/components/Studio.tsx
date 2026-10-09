"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { COLORS, waLink, type Product } from "@/data/products";

const ProductStage = dynamic(() => import("./ProductStage"), {
  ssr: false,
  loading: () => <div className="h-full w-full" aria-hidden />,
});

export default function Studio({ products: PRODUCTS }: { products: Product[] }) {
  const [productId, setProductId] = useState<Product["id"]>(PRODUCTS[0].id);
  const [color, setColor] = useState<(typeof COLORS)[number]>(COLORS[0]);
  const [text, setText] = useState("Arwas");
  const tabRefs = useRef<Partial<Record<Product["id"], HTMLButtonElement | null>>>({});

  useEffect(() => {
    const onSelect = (e: Event) => {
      const id = (e as CustomEvent<Product["id"]>).detail;
      if (PRODUCTS.some((p) => p.id === id)) setProductId(id);
    };
    window.addEventListener("arwas:select", onSelect);
    return () => window.removeEventListener("arwas:select", onSelect);
  }, []);

  const product = PRODUCTS.find((p) => p.id === productId) ?? PRODUCTS[0];
  const printText = text.trim() || "Arwas";
  const orderLink = waLink(
    `Hi Arwas World, I would like to order: ${product.name} in ${color.name}, printed with "${printText}".`,
  );

  const onTabKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = PRODUCTS.findIndex((p) => p.id === productId);
    let n = i;
    if (e.key === "ArrowRight") n = (i + 1) % PRODUCTS.length;
    else if (e.key === "ArrowLeft") n = (i - 1 + PRODUCTS.length) % PRODUCTS.length;
    else if (e.key === "Home") n = 0;
    else if (e.key === "End") n = PRODUCTS.length - 1;
    else return;
    e.preventDefault();
    const next = PRODUCTS[n].id;
    setProductId(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <section
      id="studio"
      aria-label="3D product studio"
      className="px-3 sm:px-6"
    >
      <div className="card mx-auto grid max-w-[1200px] overflow-hidden rounded-panel lg:grid-cols-[1.15fr_1fr]">
        <div
          role="tablist"
          aria-label="Products"
          onKeyDown={onTabKey}
          className="col-span-full flex overflow-x-auto border-b border-line px-2 [scrollbar-width:none]"
        >
          {PRODUCTS.map((p) => {
            const active = p.id === productId;
            return (
              <button
                key={p.id}
                ref={(el) => {
                  tabRefs.current[p.id] = el;
                }}
                id={`tab-${p.id}`}
                role="tab"
                type="button"
                aria-selected={active}
                aria-controls="studio-panel"
                tabIndex={active ? 0 : -1}
                onClick={() => setProductId(p.id)}
                className={`relative flex min-h-12 flex-none items-center px-4 text-[0.9375rem] transition-colors ${
                  active ? "font-semibold text-foreground" : "font-medium text-muted hover:text-foreground"
                }`}
              >
                {p.name}
                {active && (
                  <motion.span
                    layoutId="tab-underline"
                    className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-brand"
                    transition={{ type: "spring", stiffness: 420, damping: 36 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        <div
          id="studio-panel"
          role="tabpanel"
          aria-labelledby={`tab-${productId}`}
          className="contents"
        >
          <div
            className="relative h-[420px] lg:h-[580px]"
            style={{
              background: `radial-gradient(60% 65% at 50% 42%, color-mix(in srgb, ${color.hex} 18%, var(--panel)), var(--panel))`,
            }}
          >
            <ProductStage product={product} color={color.hex} text={text} />
          </div>

          <div className="flex flex-col justify-center gap-6 bg-surface p-6 sm:p-10 lg:p-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22 }}
                className="flex flex-col gap-4"
              >
                <h2 className="text-title1 font-semibold tracking-tight">
                  {product.name}
                </h2>
                <p className="text-subtitle font-semibold">{product.tagline}</p>
                <p className="max-w-[34em] text-body-lg text-muted">
                  {product.description}
                </p>
                <dl>
                  {product.specs.map((s) => (
                    <div
                      key={s.label}
                      className="flex justify-between gap-4 border-t border-line py-3 text-body-lg"
                    >
                      <dt className="text-muted">{s.label}</dt>
                      <dd className="text-right font-medium">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </motion.div>
            </AnimatePresence>

            <div className="flex flex-col gap-5">
              <fieldset className="m-0 border-0 p-0">
                <legend className="mb-1 text-body-lg text-muted">
                  Colour:{" "}
                  <span className="font-semibold text-foreground">{color.name}</span>
                </legend>
                <div className="-ml-1.5 flex flex-wrap">
                  {COLORS.map((c) => (
                    <label
                      key={c.hex}
                      className="relative grid h-11 w-11 cursor-pointer place-items-center"
                    >
                      <input
                        type="radio"
                        name="colour"
                        value={c.hex}
                        checked={c.hex === color.hex}
                        onChange={() => setColor(c)}
                        className="peer sr-only"
                      />
                      <span
                        aria-hidden
                        style={{ background: c.hex }}
                        className="swatch h-7 w-7 rounded-full ring-1 ring-control transition-transform peer-checked:scale-110 peer-checked:ring-2 peer-checked:ring-brand peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-foreground"
                      />
                      <span className="sr-only">{c.name}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="print-text" className="text-body-lg font-semibold">
                  Print text
                </label>
                <input
                  id="print-text"
                  className="field"
                  value={text}
                  maxLength={18}
                  autoComplete="off"
                  aria-describedby="print-help"
                  onChange={(e) => setText(e.target.value)}
                />
                <p id="print-help" className="text-body text-muted">
                  Enter a name, team or brand. Up to 18 characters.
                </p>
              </div>

              <a
                href={orderLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary self-start"
              >
                Order on WhatsApp
                <ArrowUpRight size={18} aria-hidden />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </div>
          </div>
        </div>
      </div>
      <p className="sr-only" role="status">
        Previewing {product.name} in {color.name}.
      </p>
    </section>
  );
}
