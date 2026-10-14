"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type TouchEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import type { Lang } from "@/lib/i18n";

export type Reel = {
  url: string;
  kind: "image" | "video";
  productId: string;
  name: string;
  tagline: string;
  price: string | null;
  thumb: string | null;
};

const VIDEO_MAX = 12;
const IMAGE_MS = 6000;

function shuffled(n: number, avoidFirst?: number) {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  if (n > 1 && avoidFirst !== undefined && a[0] === avoidFirst) [a[0], a[1]] = [a[1], a[0]];
  return a;
}

export default function HeroReel({
  reels,
  lang,
  children,
}: {
  reels: Reel[];
  lang: Lang;
  children: React.ReactNode;
}) {
  const rtl = lang === "ar";
  const L = (en: string, ar: string) => (rtl ? ar : en);
  const n = reels.length;

  const [st, setSt] = useState<{ order: number[]; pos: number } | null>(null);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const [hidden, setHidden] = useState(false);
  const [progress, setProgress] = useState(0);

  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const strip = useRef<HTMLUListElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const touchX = useRef<number | null>(null);
  const stripTouched = useRef(0);
  const currentUrl = useRef("");
  const elapsed = useRef(0);

  // Random order on every visit. Calm mode (nothing moves by itself) for reduced motion or Data Saver.
  useEffect(() => {
    setSt({ order: shuffled(n), pos: 0 });
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (reduced || conn?.saveData) setPaused(true);
  }, [n]);

  // Pause when the hero is off screen or the tab is hidden.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    const onVis = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const activePos = st ? st.pos : -1;
  const reel = st ? reels[st.order[st.pos]] : null;
  const playing = !paused && visible && !hidden;

  useEffect(() => {
    currentUrl.current = reel?.url ?? "";
  }, [reel]);

  const go = useCallback((d: number) => {
    elapsed.current = 0;
    setProgress(0);
    setSt((s) => {
      if (!s) return s;
      const len = s.order.length;
      const p = s.pos + d;
      if (p >= len) return { order: shuffled(len, s.order[len - 1]), pos: 0 };
      if (p < 0) return { ...s, pos: len - 1 };
      return { ...s, pos: p };
    });
  }, []);

  const jump = (pos: number) => {
    elapsed.current = 0;
    setProgress(0);
    setPaused(false);
    setSt((s) => (s ? { ...s, pos } : s));
  };

  const view = (productId: string) => {
    window.dispatchEvent(new CustomEvent("arwas:select", { detail: productId }));
    document.getElementById("studio")?.scrollIntoView({ behavior: "smooth" });
  };

  // Videos: play the current one, pause the others.
  useEffect(() => {
    const box = stage.current;
    if (!box) return;
    const vids = Array.from(box.querySelectorAll("video"));
    vids.forEach((v) => {
      if (!reel || reel.kind !== "video" || v.dataset.url !== reel.url) v.pause();
    });
    if (!reel || reel.kind !== "video") return;
    const v = vids.find((x) => x.dataset.url === reel.url);
    if (!v) return;
    if (!playing) {
      v.pause();
      return;
    }
    const p = v.play();
    if (p) {
      p.catch((e: unknown) => {
        if ((e as { name?: string })?.name === "NotAllowedError") setPaused(true);
      });
    }
  }, [reel, playing]);

  // Photos: advance on a timer, holding still while paused.
  useEffect(() => {
    if (!reel || reel.kind !== "image" || !playing || n < 2) return;
    const id = setInterval(() => {
      elapsed.current += 100;
      setProgress(Math.min(1, elapsed.current / IMAGE_MS));
      if (elapsed.current >= IMAGE_MS) go(1);
    }, 100);
    return () => clearInterval(id);
  }, [reel, playing, n, go]);

  // Keep the active card in view without moving the page.
  useEffect(() => {
    const row = strip.current;
    const el = activePos >= 0 ? cardRefs.current[activePos] : null;
    if (!row || !el) return;
    if (Date.now() - stripTouched.current < 4000) return;
    const rr = row.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    row.scrollBy({ left: er.left + er.width / 2 - (rr.left + rr.width / 2), behavior: "smooth" });
  }, [activePos]);

  const onTouchStart = (e: TouchEvent<HTMLElement>) => {
    touchX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: TouchEvent<HTMLElement>) => {
    const s = touchX.current;
    touchX.current = null;
    if (s === null || n < 2) return;
    const dx = e.changedTouches[0].clientX - s;
    if (Math.abs(dx) < 50) return;
    go((dx < 0 ? 1 : -1) * (rtl ? -1 : 1));
  };

  const order = st ? st.order : reels.map((_, i) => i);

  return (
    <section
      ref={root}
      aria-labelledby="hero-title"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      className="relative isolate flex touch-pan-y flex-col overflow-hidden bg-[#0b0b0c] text-white"
      style={{ minHeight: "clamp(36rem, calc(100svh - 3.5rem), 52rem)" }}
    >
      <div ref={stage} aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1b1b1d] to-[#3a3a3f]" />
        <AnimatePresence initial={false}>
          {reel && (
            <motion.div
              key={reel.url}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0"
            >
              {reel.kind === "image" ? (
                <Image src={reel.url} alt="" fill unoptimized priority sizes="100vw" className="kenburns object-cover" />
              ) : (
                <video
                  data-url={reel.url}
                  src={reel.url}
                  poster={reel.thumb ?? undefined}
                  muted
                  playsInline
                  preload="auto"
                  loop={n === 1}
                  onEnded={() => {
                    if (n > 1 && reel.url === currentUrl.current) go(1);
                  }}
                  onError={() => {
                    if (n > 1 && reel.url === currentUrl.current) go(1);
                  }}
                  onTimeUpdate={(e) => {
                    const v = e.currentTarget;
                    if (v.dataset.url !== currentUrl.current) return;
                    const cap = Math.min(v.duration || VIDEO_MAX, VIDEO_MAX);
                    setProgress(Math.min(1, v.currentTime / cap));
                    if (n > 1 && v.currentTime >= VIDEO_MAX) go(1);
                  }}
                  className="h-full w-full object-cover"
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/35 to-black/85" />
      </div>

      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        aria-label={paused ? L("Play the reel", "تشغيل العرض") : L("Pause the reel", "إيقاف العرض مؤقتاً")}
        className="btn absolute end-3 top-3 z-10 !rounded-full !bg-black/45 !px-0 text-white hover:!bg-black/65"
      >
        {paused ? <Play size={18} aria-hidden /> : <Pause size={18} aria-hidden />}
      </button>

      <div className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col items-center justify-center px-4 pb-8 pt-14 text-center sm:px-6 sm:pt-20">
        {children}
      </div>

      <div className="mx-auto w-full max-w-[1200px] pb-4 sm:pb-6">
        <div className="flex items-center gap-2 px-4 sm:px-6">
          <ul
            ref={strip}
            role="list"
            aria-label={L("Latest from our products", "أحدث منتجاتنا")}
            onTouchStart={(e) => {
              e.stopPropagation();
              stripTouched.current = Date.now();
            }}
            onTouchEnd={(e) => e.stopPropagation()}
            onPointerDown={() => {
              stripTouched.current = Date.now();
            }}
            onWheel={() => {
              stripTouched.current = Date.now();
            }}
            className="flex min-w-0 flex-1 snap-x gap-2 overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {order.map((ri, pos) => {
              const r = reels[ri];
              const active = pos === activePos;
              return (
                <li key={r.url} className="flex-none snap-start">
                  <button
                    ref={(el) => {
                      cardRefs.current[pos] = el;
                    }}
                    type="button"
                    aria-current={active}
                    aria-label={
                      active
                        ? L(`Open ${r.name}`, `فتح ${r.name}`)
                        : r.kind === "video"
                          ? L(`Play video: ${r.name}`, `تشغيل فيديو: ${r.name}`)
                          : L(`Show photo: ${r.name}`, `عرض صورة: ${r.name}`)
                    }
                    onClick={() => (active ? view(r.productId) : jump(pos))}
                    className={`relative flex w-[13.5rem] items-center gap-3 overflow-hidden rounded-card p-2 text-start transition sm:w-60 ${
                      active
                        ? "bg-white text-black shadow-e16"
                        : "bg-white/12 text-white ring-1 ring-white/25 backdrop-blur-md hover:bg-white/20"
                    }`}
                  >
                    <span className="relative grid h-12 w-12 flex-none place-items-center overflow-hidden rounded-card bg-white/10">
                      {r.thumb && <Image src={r.thumb} alt="" fill unoptimized sizes="48px" className="object-cover" />}
                      {r.kind === "video" && (
                        <span aria-hidden className="absolute inset-0 grid place-items-center bg-black/30 text-white">
                          <Play size={16} />
                        </span>
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-body-lg font-semibold">{r.name}</span>
                      <span className={`block truncate text-body ${active ? "text-black/70" : "text-white/80"}`}>
                        {r.price ?? r.tagline}
                      </span>
                    </span>
                    {active && n > 1 && (
                      <span aria-hidden className="absolute inset-x-0 bottom-0 h-1 bg-black/10">
                        <span className="block h-full bg-brand" style={{ width: `${progress * 100}%` }} />
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          {n > 1 && (
            <div className="hidden items-center gap-1 md:flex">
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label={L("Previous", "السابق")}
                className="btn !rounded-full !bg-white/15 !px-0 text-white ring-1 ring-white/30 hover:!bg-white/25"
              >
                <ChevronLeft size={20} aria-hidden className="rtl:rotate-180" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label={L("Next", "التالي")}
                className="btn !rounded-full !bg-white/15 !px-0 text-white ring-1 ring-white/30 hover:!bg-white/25"
              >
                <ChevronRight size={20} aria-hidden className="rtl:rotate-180" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}