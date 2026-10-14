"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type KeyboardEvent, type TouchEvent } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import type { Product } from "@/data/products";
import { DICT, type Lang } from "@/lib/i18n";
import ProductOptions from "./ProductOptions";

const POP = { type: "spring", stiffness: 260, damping: 26 } as const;

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
  const [ready, setReady] = useState(false);
  const [index, setIndex] = useState(0);
  const [slide, setSlide] = useState(1);
  const touchX = useRef<number | null>(null);
  const tabRow = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Open on a random product each visit (prefer ones that have photos or videos).
  useEffect(() => {
    const withMedia = products.filter((p) => (p.media?.length ?? 0) > 0);
    const pool = withMedia.length ? withMedia : products;
    if (pool.length) setProductId(pool[Math.floor(Math.random() * pool.length)].id);
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onSelect = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      if (products.some((p) => p.id === id)) {
        setSlide(1);
        setProductId(id);
        setIndex(0);
      }
    };
    window.addEventListener("arwas:select", onSelect);
    return () => window.removeEventListener("arwas:select", onSelect);
  }, [products]);

  // Keep the chosen tab in view inside the tab row (never moves the page).
  useEffect(() => {
    const row = tabRow.current;
    const el = tabRefs.current[productId];
    if (!row || !el) return;
    const rr = row.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    row.scrollBy({ left: er.left + er.width / 2 - (rr.left + rr.width / 2), behavior: "smooth" });
  }, [productId]);

  const product = products.find((p) => p.id === productId) ?? products[0];
  if (!product) return null;

  const media = product.media ?? [];
  const n = media.length;
  const cur = Math.min(index, Math.max(n - 1, 0));
  const item = n > 0 ? media[cur] : undefined;
  const go = (d: number) => setIndex((i) => (n === 0 ? 0 : (i + d + n) % n));

  const choose = (id: string) => {
    const from = products.findIndex((p) => p.id === productId);
    const to = products.findIndex((p) => p.id === id);
    setSlide(to >= from ? 1 : -1);
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

  const dir = slide * (rtl ? -1 : 1);
  const listV: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } } };
  const rowV: Variants = {
    hidden: { opacity: 0, y: 16, x: dir * 18 },
    show: { opacity: 1, y: 0, x: 0, transition: POP },
  };

  return (
    <section id="studio" aria-label={t.label} className="px-3 sm:px-6">
      <div
        className={`card mx-auto grid max-w-[1200px] grid-cols-[minmax(0,1fr)] overflow-clip rounded-panel transition-opacity duration-500 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] ${
          ready ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          ref={tabRow}
          role="tablist"
          aria-label={t.tabs}
          onKeyDown={onTabKey}
          className="relative col-span-full flex min-w-0 gap-1 overflow-x-auto border-b border-line px-2 py-2 [scrollbar-width:none]"
        >
          {products.map((p, i) => {
            const active = p.id === productId;
            return (
              <motion.button
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
                initial={{ opacity: 0, y: 10 }}
                animate={ready ? { opacity: 1, y: 0 } : undefined}
                transition={{ duration: 0.4, delay: Math.min(i, 8) * 0.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative flex min-h-11 flex-none items-center rounded-full px-4 text-[0.9375rem]"
              >
                {active && (
                  <motion.span
                    layoutId="tab-pill"
                    aria-hidden
                    className="absolute inset-0 rounded-full bg-foreground"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span
                  className={`relative transition-colors duration-200 ${
                    active ? "font-semibold text-background" : "font-medium text-muted hover:text-foreground"
                  }`}
                >
                  {p.name}
                </span>
              </motion.button>
            );
          })}
        </div>

        <div id="showcase-panel" role="tabpanel" aria-labelledby={`tab-${product.id}`} className="contents">
          <div className="min-w-0 bg-[#0b0b0c] text-white lg:sticky lg:top-16 lg:m-6 lg:self-start lg:overflow-clip lg:rounded-panel">
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.96, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={POP}
            >
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
                      initial={{ opacity: 0, scale: 1.04 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
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
            </motion.div>
          </div>

          <div className="flex min-w-0 flex-col justify-center break-words bg-surface p-6 text-start sm:p-10 lg:p-12">
            <motion.div
              key={product.id}
              variants={listV}
              initial="hidden"
              animate="show"
              className="flex flex-col gap-6"
            >
              <div className="flex flex-col gap-4">
                <motion.h2 variants={rowV} className="text-title1 font-semibold tracking-tight">
                  {product.name}
                </motion.h2>
                <motion.p variants={rowV} className="text-subtitle font-semibold">
                  {product.tagline}
                </motion.p>
                <motion.p variants={rowV} className="max-w-[34em] text-body-lg text-muted">
                  {product.description}
                </motion.p>
                <motion.dl variants={rowV}>
                  {product.specs.map((s) => (
                    <div
                      key={s.label}
                      className="flex flex-col gap-0.5 border-t border-line py-3 text-body-lg sm:flex-row sm:justify-between sm:gap-4"
                    >
                      <dt className="text-muted">{s.label}</dt>
                      <dd className="font-medium sm:text-end">{s.value}</dd>
                    </div>
                  ))}
                </motion.dl>
                <motion.p variants={rowV} className="text-subtitle font-semibold">
                  {product.price ?? t.quote}
                </motion.p>
              </div>
              <motion.div variants={rowV}>
                <ProductOptions product={product} lang={lang} />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}