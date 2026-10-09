"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { waLinkTo, type Product } from "@/data/products";

export default function Showcase({
  products,
  whatsapp,
}: {
  products: Product[];
  whatsapp: string;
}) {
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [index, setIndex] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [playing, setPlaying] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

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
  const item = n > 0 ? media[Math.min(index, n - 1)] : undefined;
  const go = (d: number) => setIndex((i) => (n === 0 ? 0 : (i + d + n) % n));
  const choose = (id: string) => {
    setProductId(id);
    setIndex(0);
  };

  const onTabKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = products.findIndex((p) => p.id === productId);
    let k = i;
    if (e.key === "ArrowRight") k = (i + 1) % products.length;
    else if (e.key === "ArrowLeft") k = (i - 1 + products.length) % products.length;
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
      go(-1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    }
  };

  const toggleVideo = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) void v.play();
    else v.pause();
  };

  const orderLink = waLinkTo(
    whatsapp,
    `Hi Arwas World, I would like to order: ${product.name}. I would like it customized.`,
  );

  return (
    <section id="studio" aria-label="Product showcase" className="px-3 sm:px-6">
      <div className="card mx-auto grid max-w-[1200px] overflow-hidden rounded-panel lg:grid-cols-[1.15fr_1fr]">
        <div
          role="tablist"
          aria-label="Products"
          onKeyDown={onTabKey}
          className="col-span-full flex overflow-x-auto border-b border-line px-2 [scrollbar-width:none]"
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
          <div className="bg-[#0b0b0c] text-white">
            <div
              tabIndex={n > 1 ? 0 : -1}
              role="group"
              aria-roledescription="carousel"
              aria-label={`${product.name} photos and videos. Use the left and right arrow keys to browse.`}
              onKeyDown={onViewerKey}
              className="relative aspect-[4/5] w-full overflow-hidden sm:aspect-[4/3] lg:aspect-auto lg:h-[600px]"
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
                        alt={`${product.name}, photo ${Math.min(index, n - 1) + 1} of ${n}`}
                        fill
                        unoptimized
                        sizes="(min-width:1024px) 55vw, 100vw"
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
                        aria-label={`${product.name}, video ${Math.min(index, n - 1) + 1} of ${n}`}
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
                    <p className="font-display text-[clamp(2.5rem,7vw,4.5rem)] uppercase leading-none text-white/90">
                      {product.name}
                    </p>
                    <p className="mt-3 text-body-lg text-white/70">Photos and videos coming soon.</p>
                  </div>
                </div>
              )}

              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent"
              />

              {n > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => go(-1)}
                    aria-label="Previous photo or video"
                    className="btn absolute left-3 top-1/2 -translate-y-1/2 !rounded-full !bg-black/50 !px-0 text-white hover:!bg-black/70"
                  >
                    <ChevronLeft size={22} aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => go(1)}
                    aria-label="Next photo or video"
                    className="btn absolute right-3 top-1/2 -translate-y-1/2 !rounded-full !bg-black/50 !px-0 text-white hover:!bg-black/70"
                  >
                    <ChevronRight size={22} aria-hidden />
                  </button>
                </>
              )}

              <div className="absolute inset-x-0 bottom-3 flex items-center justify-between px-4">
                <span className="rounded-full bg-black/50 px-3 py-1 text-caption font-semibold">
                  {n > 0 ? `${Math.min(index, n - 1) + 1} / ${n}` : ""}
                </span>
                {item?.kind === "video" && (
                  <button
                    type="button"
                    onClick={toggleVideo}
                    aria-label={playing ? "Pause video" : "Play video"}
                    className="btn !rounded-full !bg-black/50 !px-0 text-white hover:!bg-black/70"
                  >
                    {playing ? <Pause size={18} aria-hidden /> : <Play size={18} aria-hidden />}
                  </button>
                )}
              </div>
            </div>

            {n > 1 && (
              <ul role="list" className="flex gap-2 overflow-x-auto p-3 [scrollbar-width:none]">
                {media.map((m, i) => (
                  <li key={m.url} className="flex-none">
                    <button
                      type="button"
                      onClick={() => setIndex(i)}
                      aria-label={`Show ${m.kind === "image" ? "photo" : "video"} ${i + 1} of ${n}`}
                      aria-current={i === Math.min(index, n - 1)}
                      className={`relative block h-16 w-14 overflow-hidden rounded-card ring-2 transition ${
                        i === Math.min(index, n - 1) ? "ring-white" : "opacity-70 ring-transparent hover:opacity-100"
                      }`}
                    >
                      {m.kind === "image" ? (
                        <Image src={m.url} alt="" fill unoptimized sizes="56px" className="object-cover" />
                      ) : (
                        <>
                          <video src={`${m.url}#t=0.1`} muted preload="metadata" className="h-full w-full object-cover" />
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
                <h2 className="text-title1 font-semibold tracking-tight">{product.name}</h2>
                <p className="text-subtitle font-semibold">{product.tagline}</p>
                <p className="max-w-[34em] text-body-lg text-muted">{product.description}</p>
                <dl>
                  {product.specs.map((s) => (
                    <div key={s.label} className="flex justify-between gap-4 border-t border-line py-3 text-body-lg">
                      <dt className="text-muted">{s.label}</dt>
                      <dd className="text-right font-medium">{s.value}</dd>
                    </div>
                  ))}
                </dl>
                <p className="text-subtitle font-semibold">{product.price ?? "Request a quote"}</p>
              </motion.div>
            </AnimatePresence>

            <div className="flex flex-col gap-3">
              <a
                href={orderLink}
                target="_blank"
                rel="noopener noreferrer"
                data-source="showcase"
                data-product={product.name}
                className="btn btn-primary self-start"
              >
                Order on WhatsApp
                <ArrowUpRight size={18} aria-hidden />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              <p className="max-w-[30em] text-body text-muted">
                Tell us your name, team or logo on WhatsApp and we will send a preview before we print.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
