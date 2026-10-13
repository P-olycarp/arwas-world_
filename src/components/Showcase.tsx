"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type KeyboardEvent, type TouchEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import type { Product } from "@/data/products";
import { DICT, type Lang } from "@/lib/i18n";
import ProductOptions from "./ProductOptions";

function Cover({ p }: { p: Product }) {
  const first = p.media?.[0];
  if (first?.kind === "image") {
    return <Image src={first.url} alt="" fill unoptimized sizes="13rem" className="object-cover" />;
  }
  if (first?.kind === "video") {
    return <video src={`${first.url}#t=0.1`} muted playsInline preload="metadata" className="h-full w-full object-cover" />;
  }
  return <span aria-hidden className="absolute inset-0 bg-gradient-to-br from-[#1b1b1d] to-[#45454a]" />;
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
  const L = (en: string, ar: string) => (rtl ? ar : en);

  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [index, setIndex] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [playing, setPlaying] = useState(false);

  const rail = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const detail = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const touchX = useRef<number | null>(null);
  const lock = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const currentId = useRef(productId);
  currentId.current = productId;

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    return () => clearTimeout(timer.current);
  }, []);

  const centerOn = (id: string) => {
    lock.current = Date.now() + 700;
    cardRefs.current[id]?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      inline: "center",
      block: "nearest",
    });
  };

  useEffect(() => {
    const onSelect = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      if (!products.some((p) => p.id === id)) return;
      setProductId(id);
      setIndex(0);
      centerOn(id);
      setTimeout(
        () => detail.current?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" }),
        90,
      );
    };
    window.addEventListener("arwas:select", onSelect);
    return () => window.removeEventListener("arwas:select", onSelect);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, reduced]);

  const product = products.find((p) => p.id === productId) ?? products[0];
  if (!product) return null;

  const pIndex = products.findIndex((p) => p.id === product.id);
  const media = product.media ?? [];
  const n = media.length;
  const cur = Math.min(index, Math.max(n - 1, 0));
  const item = n > 0 ? media[cur] : undefined;
  const go = (d: number) => setIndex((i) => (n === 0 ? 0 : (i + d + n) % n));

  const pickCard = (id: string) => {
    setProductId(id);
    setIndex(0);
    centerOn(id);
  };
  const moveProduct = (d: number) => {
    const k = (pIndex + d + products.length) % products.length;
    pickCard(products[k].id);
  };

  const onScroll = () => {
    if (Date.now() < lock.current) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const r = rail.current;
      if (!r) return;
      const box = r.getBoundingClientRect();
      const mid = box.left + box.width / 2;
      let best = products[0]?.id;
      let dist = Infinity;
      for (const p of products) {
        const el = cardRefs.current[p.id];
        if (!el) continue;
        const b = el.getBoundingClientRect();
        const d = Math.abs(b.left + b.width / 2 - mid);
        if (d < dist) {
          dist = d;
          best = p.id;
        }
      }
      if (best && best !== currentId.current) {
        setProductId(best);
        setIndex(0);
      }
    }, 90);
  };

  const onRailKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.key === "ArrowRight" ? (rtl ? -1 : 1) : e.key === "ArrowLeft" ? (rtl ? 1 : -1) : 0;
    let k = pIndex;
    if (step !== 0) k = (pIndex + step + products.length) % products.length;
    else if (e.key === "Home") k = 0;
    else if (e.key === "End") k = products.length - 1;
    else return;
    e.preventDefault();
    pickCard(products[k].id);
    cardRefs.current[products[k].id]?.focus({ preventScroll: true });
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

  const toggleVideo = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) void v.play();
    else v.pause();
  };

  const arrow =
    "btn absolute top-1/2 hidden -translate-y-1/2 !rounded-full !bg-surface/95 !px-0 shadow-e8 md:inline-flex";

  return (
    <section id="studio" aria-label={t.label} className="scroll-mt-16">
      <div className="mx-auto max-w-[1200px]">
        <div className="relative">
          <div
            ref={rail}
            role="group"
            aria-label={L("Browse products", "تصفح المنتجات")}
            onScroll={onScroll}
            onKeyDown={onRailKey}
            style={{ paddingInline: "calc(50% - var(--cw) / 2)" }}
            className="flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain py-6 [--cw:11rem] [scrollbar-width:none] sm:[--cw:13rem] [&::-webkit-scrollbar]:hidden"
          >
            {products.map((p) => {
              const active = p.id === product.id;
              return (
                <button
                  key={p.id}
                  ref={(el) => {
                    cardRefs.current[p.id] = el;
                  }}
                  type="button"
                  aria-pressed={active}
                  onClick={() => pickCard(p.id)}
                  className={`relative aspect-[3/4] w-[var(--cw)] flex-none snap-center overflow-hidden rounded-card bg-panel text-start text-white transition duration-300 ${
                    active ? "scale-100 shadow-e16 ring-2 ring-brand" : "scale-[0.92] opacity-70 hover:opacity-100"
                  }`}
                >
                  <Cover p={p} />
                  <span aria-hidden className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/75 to-transparent" />
                  <span
                    className={`absolute inset-x-3 bottom-3 text-xl font-extrabold leading-tight ${rtl ? "" : "uppercase"}`}
                    style={rtl ? undefined : { fontFamily: "var(--font-display)" }}
                  >
                    {p.name}
                  </span>
                </button>
              );
            })}
          </div>

          <button type="button" onClick={() => moveProduct(-1)} aria-label={L("Previous product", "المنتج السابق")} className={`${arrow} start-3`}>
            <ChevronLeft size={22} aria-hidden className="rtl:rotate-180" />
          </button>
          <button type="button" onClick={() => moveProduct(1)} aria-label={L("Next product", "المنتج التالي")} className={`${arrow} end-3`}>
            <ChevronRight size={22} aria-hidden className="rtl:rotate-180" />
          </button>
        </div>

        <p className="flex items-center justify-center gap-3 px-4 text-body text-muted">
          <span>{L("Swipe to browse products", "اسحب لتصفح المنتجات")}</span>
          <span dir="ltr" className="font-semibold text-foreground">
            {pIndex + 1} / {products.length}
          </span>
        </p>
        <p className="sr-only" role="status">{product.name}</p>

        <div
          ref={detail}
          className="grid scroll-mt-20 items-start gap-8 px-4 pb-4 pt-8 sm:px-6 lg:grid-cols-2 lg:gap-12"
        >
          <div className="min-w-0 lg:sticky lg:top-20">
            <div
              tabIndex={n > 1 ? 0 : -1}
              role="group"
              aria-roledescription="carousel"
              aria-label={t.carousel(product.name)}
              onKeyDown={onViewerKey}
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
              className="relative aspect-[4/5] max-h-[min(640px,75vh)] w-full touch-pan-y overflow-hidden rounded-panel bg-[#0b0b0c] text-white"
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
                        sizes="(min-width:1024px) 50vw, 100vw"
                        className="kenburns object-cover"
                      />
                    ) : (
                      <video
                        ref={video}
                        src={item.url}
                        autoPlay={!reduced}
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        aria-label={t.videoLabel(product.name, cur + 1, n)}
                        onPlay={() => setPlaying(true)}
                        onPause={() => setPlaying(false)}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              ) : (
                <div className="grid h-full place-items-center p-8 text-center">
                  <div>
                    <p className="text-[clamp(2rem,6vw,3.5rem)] font-extrabold leading-tight text-white/90">
                      {product.name}
                    </p>
                    <p className="mt-3 text-body-lg text-white/70">{t.soon}</p>
                  </div>
                </div>
              )}

              <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />

              {n > 1 && (
                <>
                  <button type="button" onClick={() => go(-1)} aria-label={t.prev} className="btn absolute start-3 top-1/2 -translate-y-1/2 !rounded-full !bg-black/50 !px-0 text-white hover:!bg-black/70">
                    <ChevronLeft size={22} aria-hidden className="rtl:rotate-180" />
                  </button>
                  <button type="button" onClick={() => go(1)} aria-label={t.next} className="btn absolute end-3 top-1/2 -translate-y-1/2 !rounded-full !bg-black/50 !px-0 text-white hover:!bg-black/70">
                    <ChevronRight size={22} aria-hidden className="rtl:rotate-180" />
                  </button>
                </>
              )}

              <div className="absolute inset-x-0 bottom-3 flex items-center justify-between px-4">
                <span dir="ltr" className="rounded-full bg-black/50 px-3 py-1 text-caption font-semibold">
                  {n > 0 ? `${cur + 1} / ${n}` : ""}
                </span>
                {item?.kind === "video" && (
                  <button type="button" onClick={toggleVideo} aria-label={playing ? t.pause : t.play} className="btn !rounded-full !bg-black/50 !px-0 text-white hover:!bg-black/70">
                    {playing ? <Pause size={18} aria-hidden /> : <Play size={18} aria-hidden />}
                  </button>
                )}
              </div>
            </div>

            {n > 1 && (
              <ul role="list" className="flex gap-2 overflow-x-auto pt-3 [scrollbar-width:none]">
                {media.map((m, i) => (
                  <li key={m.url} className="flex-none">
                    <button
                      type="button"
                      onClick={() => setIndex(i)}
                      aria-label={m.kind === "image" ? t.showPhoto(i + 1, n) : t.showVideo(i + 1, n)}
                      aria-current={i === cur}
                      className={`relative block h-16 w-14 overflow-hidden rounded-card ring-2 transition ${
                        i === cur ? "ring-brand" : "opacity-70 ring-transparent hover:opacity-100"
                      }`}
                    >
                      {m.kind === "image" ? (
                        <Image src={m.url} alt="" fill unoptimized sizes="56px" className="object-cover" />
                      ) : (
                        <>
                          <video src={`${m.url}#t=0.1`} muted preload="metadata" className="h-full w-full object-cover" />
                          <span aria-hidden className="absolute inset-0 grid place-items-center bg-black/30 text-white">
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

          <div className="flex min-w-0 flex-col gap-6 break-words text-start">
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
                <p className="text-subtitle font-semibold text-brand">{product.price ?? t.quote}</p>
                <p className="max-w-[34em] text-body-lg text-muted">{product.description}</p>
                <dl>
                  {product.specs.map((s) => (
                    <div key={s.label} className="flex flex-col gap-0.5 border-t border-line py-3 text-body-lg sm:flex-row sm:justify-between sm:gap-4">
                      <dt className="text-muted">{s.label}</dt>
                      <dd className="font-medium sm:text-end">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </motion.div>
            </AnimatePresence>

            <ProductOptions key={product.id} product={product} lang={lang} />
          </div>
        </div>
      </div>
    </section>
  );
}