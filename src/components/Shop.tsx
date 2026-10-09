"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowUpRight, Box } from "lucide-react";
import { waLinkTo, type Product } from "@/data/products";
import { Reveal } from "./Reveal";

type Filter = "all" | "apparel" | "drinkware";

const APPAREL: Product["kind"][] = ["hoodie", "tee", "polo", "jersey"];

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "apparel", label: "Apparel" },
  { id: "drinkware", label: "Drinkware" },
];

const TINTS = ["var(--kenya)", "var(--gold)", "var(--oman)", "var(--sky)"];

function Silhouette({ id }: { id: Product["kind"] }) {
  const common = {
    fill: "currentColor",
    stroke: "var(--foreground)",
    strokeOpacity: 0.25,
    strokeWidth: 1.5,
    strokeLinejoin: "round" as const,
  };
  const detail = {
    fill: "none",
    stroke: "var(--foreground)",
    strokeOpacity: 0.4,
    strokeWidth: 1.5,
    strokeLinejoin: "round" as const,
  };
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
      {id === "tee" && (
        <path
          {...common}
          d="M35 12 Q50 24 65 12 L90 24 L82 42 L72 37 V88 H28 V37 L18 42 L10 24 Z"
        />
      )}
      {id === "polo" && (
        <>
          <path
            {...common}
            d="M35 12 Q50 24 65 12 L90 24 L82 42 L72 37 V88 H28 V37 L18 42 L10 24 Z"
          />
          <path {...detail} d="M35 12 L44 26 L50 20 L56 26 L65 12 M50 20 V40" />
        </>
      )}
      {id === "jersey" && (
        <>
          <path
            {...common}
            d="M33 12 L50 34 L67 12 L90 24 L82 42 L72 37 V88 H28 V37 L18 42 L10 24 Z"
          />
          <path {...detail} d="M28 62 H72 M28 70 H72" />
        </>
      )}
      {id === "hoodie" && (
        <>
          <path
            {...common}
            d="M36 14 Q50 26 64 14 L74 12 Q80 20 78 30 L92 78 L80 82 L72 52 V90 H28 V52 L20 82 L8 78 L22 30 Q20 20 26 12 Z"
          />
          <path {...detail} d="M36 66 H64 V82 H36 Z M44 28 V42 M56 28 V42" />
        </>
      )}
      {id === "tumbler" && (
        <>
          <path {...common} d="M30 24 H70 L64 90 H36 Z" />
          <rect x="28" y="18" width="44" height="8" rx="3" {...common} />
          <path {...detail} strokeWidth={2.5} strokeLinecap="round" d="M54 18 L60 4" />
        </>
      )}
      {id === "bottle" && (
        <path {...common} d="M42 6 H58 V18 L67 30 V92 H33 V30 L42 18 Z" />
      )}
      {id === "mug" && (
        <>
          <path {...common} d="M20 28 H68 V76 Q68 88 56 88 H32 Q20 88 20 76 Z" />
          <path
            {...detail}
            strokeWidth={5}
            strokeLinecap="round"
            d="M68 38 H76 Q86 38 86 50 Q86 62 76 62 H68"
          />
        </>
      )}
    </svg>
  );
}

function selectInStudio(id: Product["id"]) {
  window.dispatchEvent(new CustomEvent("arwas:select", { detail: id }));
  document.getElementById("studio")?.scrollIntoView({ behavior: "smooth" });
}

export default function Shop({
  products: PRODUCTS,
  whatsapp,
}: {
  products: Product[];
  whatsapp: string;
}) {
  const waLink = (m: string) => waLinkTo(whatsapp, m);
  const [filter, setFilter] = useState<Filter>("all");

  const items = PRODUCTS.filter((p) => {
    if (filter === "all") return true;
    const isApparel = APPAREL.includes(p.kind);
    return filter === "apparel" ? isApparel : !isApparel;
  });

  return (
    <section
      id="shop"
      aria-labelledby="shop-title"
      className="mx-auto max-w-[1200px] px-4 pt-24 sm:px-6 sm:pt-32"
    >
      <Reveal>
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-[40rem]">
            <p className="mb-2 text-body font-semibold uppercase tracking-wider text-brand">
              Shop
            </p>
            <h2 id="shop-title" className="text-title1 font-semibold tracking-tight">
              Shop the range
            </h2>
            <p className="mt-3 text-body-lg text-muted">
              Every piece can carry your name, team or brand. Open one in 3D to
              try colours and print, or message us to order.
            </p>
          </div>
          <div role="group" aria-label="Filter products" className="flex gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                className="toggle"
                aria-pressed={filter === f.id}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </Reveal>

      <p className="sr-only" role="status">
        Showing {items.length} products.
      </p>

      <ul role="list" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((p) => {
          const tint = TINTS[PRODUCTS.indexOf(p) % TINTS.length];
          return (
            <li key={p.id}>
              <article className="card flex h-full flex-col overflow-hidden rounded-card">
                <div
                  className="relative aspect-[4/3] p-8"
                  style={{
                    background: `radial-gradient(70% 70% at 50% 45%, color-mix(in srgb, ${tint} 22%, var(--panel)), var(--panel))`,
                    color: `color-mix(in srgb, ${tint} 50%, var(--panel))`,
                  }}
                >
                  {p.image ? (
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw"
                      className="object-cover"
                    />
                  ) : (
                    <Silhouette id={p.kind} />
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-1 p-5">
                  <h3 className="text-subtitle font-semibold tracking-tight">
                    {p.name}
                  </h3>
                  <p className="text-body-lg text-muted">{p.tagline}</p>
                  <p className="mt-2 text-body text-muted">
                    {p.specs[1]?.label}: {p.specs[1]?.value}
                  </p>
                  <p className="mt-3 text-body-lg font-semibold">
                    {p.price ?? "Request a quote"}
                  </p>
                  <div className="mt-auto flex flex-wrap gap-2 pt-5">
                    <button
                      type="button"
                      onClick={() => selectInStudio(p.id)}
                      className="btn btn-secondary !px-4"
                    >
                      <Box size={18} aria-hidden />
                      View gallery
                    </button>
                    <a
                      href={waLink(`Hi Arwas World, I would like to order ${p.name}.`)}
                      data-source="shop"
                      data-product={p.name}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-subtle !px-3"
                    >
                      Order
                      <ArrowUpRight size={18} aria-hidden />
                      <span className="sr-only"> {p.name} on WhatsApp (opens in a new tab)</span>
                    </a>
                  </div>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
