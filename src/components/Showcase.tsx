"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type KeyboardEvent, type TouchEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import type { Product } from "@/data/products";
import { DICT, type Lang } from "@/lib/i18n";
import ProductOptions from "./ProductOptions";

function VideoPlayer({ src, label, playLabel }: { src: string; label: string; playLabel: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [ended, setEnded] = useState(false);

  const play = () => {
    const v = ref.current;
    if (!v) return;
    if (ended) v.currentTime = 0;
    void v.play();
  };

  return (
    <div className="relative h-full w-full">
      <video
        ref={ref}
        src={`${src}#t=0.1`}
        playsInline
        preload="metadata"
        controls={started}
        aria-label={label}
        onPlay={() => {
          setStarted(true);
          setEnded(false);
        }}
        onEnded={() => setEnded(true)}
        className="h-full w-full object-cover"
      />
      {(!started || ended) && (
        <button
          type="button"
          onClick={play}
          aria-label={playLabel}
          className="absolute inset-0 grid place-items-center bg-black/20 transition hover:bg-black/30"
        >
          <span className="grid h-16 w-16 place-items-center rounded-full bg-white/90 text-black shadow-e16">
            <Play size={28} aria-hidden />
          </span>
        </button>
      )}
    </div>
  );
}

export default function Showcase({
  products,
  lang,
}: {
  products: Product[];
  whatsapp?: string;
  lang: Lang;
}) {
  const t = DICT[lang].showcase;
  const rtl = lang === "ar";
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [index, setIndex] = useState(0);
  const touchX = useRef<number | null>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const onSelect = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      if (products.some((p) => p.id === id)) {
        setProductId(id);
        setIndex(0);
      }
    };
    window.addEventListener("arwas:select", onSelect);
    return () => window.removeEventListener("arwas:select", onSelect);
  }, [products]);

  const product = products.find((p) => p.id === productId) ?? products[0];
  if (!product) return null;

  const media = product.media ?? [];
  const n = media.length;
  const cur = Math.min(index, Math.max(n - 1, 0));
  const item = n > 0 ? media[cur] : undefined;
  const go = (d: number) => setIndex((i) => (n === 0 ? 0 : (i + d + n) % n));
  const choose = (id: string) => {
    setProductId(id);
    setIndex(0);
  };

  const onTabKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = products.findIndex((p) => p.id === productId);
    const step = e.key === "ArrowRight" ? (rtl ? -1 : 1) : e.key === "ArrowLeft" ? (rtl ? 1 : -1) : 0;
    let k = i;
    if (step !== 0) k = (i + step + products.length) % products.length;
    else if (e.key === "Home") k = 0;
    else if (e.key === "End") k = products.length - 1;
    else return;
    e.preventDefault();
    choose(products[k].id);
    tabRefs.current[products[k].id]?.focus();
  };

  const onViewerKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(rtl ? 1 : -1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      go(rtl ? -1 : 1);
    }
  };

  const onTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    touchX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    const start = touchX.current;
    touchX.current = null;
    if (start === null) return;
    const dx = e.changedTouches[0].clientX - start;
    if (Math.abs(dx) < 40) return;
    go((dx < 0 ? 1 : -1) * (rtl ? -1 : 1));
  };

  return (
    <section id="studio" aria-label={t.label} className="px-3 sm:px-6">
      <div className="card mx-auto grid max-w-[1200px] grid-cols-[minmax(0,1fr)] overflow-clip rounded-panel lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div
          role="tablist"
          aria-label={t.tabs}
          onKeyDown={onTabKey}
          className="col-span-full flex min-w-0 overflow-x-auto border-b border-line px-2 [scrollbar-width:none]"
        >
          {products.map((p) => {
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
                aria-controls="showcase-panel"
                tabIndex={active ? 0 : -1}
                onClick={() => choose(p.id)}
                className={`relative flex min-h-12 flex-none items-center px-4 text-[0.9375rem] transition-colors ${
                  active ? "font-semibold text-foreground" : "font-medium text-muted hover:text-foreground"
                }`}
              >
                {p.name}
                {active && (
                  <motion.span
                    layoutId="showcase-underline"
                    className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-brand"
                    transition={{ type: "spring", stiffness: 420, damping: 36 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        <div id="showcase-panel" role="tabpanel" aria-labelledby={`tab-${product.id}`} className="contents">
          <div className="min-w-0 bg-[#0b0b0c] text-white lg:sticky lg:top-16 lg:m-6 lg:self-start lg:overflow-clip lg:rounded-panel">
            <div
              tabIndex={n > 1 ? 0 : -1}
              role="group"
              aria-roledescription="carousel"
              aria-label={t.carousel(product.name)}
              onKeyDown={onViewerKey}
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
              className="relative aspect-[4/5] w-full touch-pan-y overflow-hidden sm:aspect-[4/3] lg:aspect-auto lg:h-[600px]"
            >
              {item ? (
                <AnimatePresence initial={false}>
                  <motion.div
                    key={item.url}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.45 }}
                    className="absolute inset-0"
                  >
                    {item.kind === "image" ? (
                      <Image
                        src={item.url}
                        alt={t.photoAlt(product.name, cur + 1, n)}
                        fill
                        unoptimized
                        sizes="(min-width:1024px) 55vw, 100vw"
                        className="kenburns object-cover"
                      />
                    ) : (
                      <VideoPlayer
                        src={item.url}
                        label={t.videoLabel(product.name, cur + 1, n)}
                        playLabel={t.play}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              ) : (
                <div className="grid h-full place-items-center p-8 text-center">
                  <div>
                    <p className="font-display text-[clamp(2.5rem,7vw,4.5rem)] uppercase leading-none text-white/90">
                      {product.name}
                    </p>
                    <p className="mt-3 text-body-lg text-white/70">{t.soon}</p>
                  </div>
                </div>
              )}

              {item?.kind !== "video" && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent"
                />
              )}

              {n > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => go(-1)}
                    aria-label={t.prev}
                    className="btn absolute start-3 top-1/2 -translate-y-1/2 !rounded-full !bg-black/50 !px-0 text-white hover:!bg-black/70"
                  >
                    <ChevronLeft size={22} aria-hidden className="rtl:rotate-180" />
                  </button>
                  <button
                    type="button"
                    onClick={() => go(1)}
                    aria-label={t.next}
                    className="btn absolute end-3 top-1/2 -translate-y-1/2 !rounded-full !bg-black/50 !px-0 text-white hover:!bg-black/70"
                  >
                    <ChevronRight size={22} aria-hidden className="rtl:rotate-180" />
                  </button>
                </>
              )}

              {n > 0 && (
                <span
                  dir="ltr"
                  className="pointer-events-none absolute start-3 top-3 rounded-full bg-black/50 px-3 py-1 text-caption font-semibold"
                >
                  {cur + 1} / {n}
                </span>
              )}
            </div>

            {n > 1 && (
              <ul role="list" className="flex gap-2 overflow-x-auto p-3 [scrollbar-width:none]">
                {media.map((m, i) => (
                  <li key={m.url} className="flex-none">
                    <button
                      type="button"
                      onClick={() => setIndex(i)}
                      aria-label={m.kind === "image" ? t.showPhoto(i + 1, n) : t.showVideo(i + 1, n)}
                      aria-current={i === cur}
                      className={`relative block h-16 w-14 overflow-hidden rounded-card ring-2 transition ${
                        i === cur ? "ring-white" : "opacity-70 ring-transparent hover:opacity-100"
                      }`}
                    >
                      {m.kind === "image" ? (
                        <Image src={m.url} alt="" fill unoptimized sizes="56px" className="object-cover" />
                      ) : (
                        <>
                          <video
                            src={`${m.url}#t=0.1`}
                            muted
                            playsInline
                            preload="metadata"
                            className="h-full w-full object-cover"
                          />
                          <span aria-hidden className="absolute inset-0 grid place-items-center bg-black/30">
                            <Play size={16} />
                          </span>
                        </>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex min-w-0 flex-col justify-center gap-6 break-words bg-surface p-6 text-start sm:p-10 lg:p-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22 }}
                className="flex flex-col gap-4"
              >
                <h2 className="text-title1 font-semibold tracking-tight">{product.name}</h2>
                <p className="text-subtitle font-semibold">{product.tagline}</p>
                <p className="max-w-[34em] text-body-lg text-muted">{product.description}</p>
                <dl>
                  {product.specs.map((s) => (
                    <div
                      key={s.label}
                      className="flex flex-col gap-0.5 border-t border-line py-3 text-body-lg sm:flex-row sm:justify-between sm:gap-4"
                    >
                      <dt className="text-muted">{s.label}</dt>
                      <dd className="font-medium sm:text-end">{s.value}</dd>
                    </div>
                  ))}
                </dl>
                <p className="text-subtitle font-semibold">{product.price ?? t.quote}</p>
              </motion.div>
            </AnimatePresence>

            <ProductOptions key={product.id} product={product} lang={lang} />
          </div>
        </div>
      </div>
    </section>
  );
}