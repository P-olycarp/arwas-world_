"use client";

import Image from "next/image";
import { useRef, useState, type KeyboardEvent, type TouchEvent } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import type { MediaItem } from "@/data/products";
import { DICT, type Lang } from "@/lib/i18n";

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

export default function ProductGallery({
  media,
  name,
  lang,
}: {
  media: MediaItem[];
  name: string;
  lang: Lang;
}) {
  const t = DICT[lang].showcase;
  const rtl = lang === "ar";
  const [index, setIndex] = useState(0);
  const touchX = useRef<number | null>(null);
  const n = media.length;
  const cur = Math.min(index, Math.max(n - 1, 0));
  const item = n > 0 ? media[cur] : undefined;
  const go = (d: number) => setIndex((i) => (n === 0 ? 0 : (i + d + n) % n));

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
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
    const s = touchX.current;
    touchX.current = null;
    if (s === null) return;
    const dx = e.changedTouches[0].clientX - s;
    if (Math.abs(dx) < 40) return;
    go((dx < 0 ? 1 : -1) * (rtl ? -1 : 1));
  };

  return (
    <div className="min-w-0 overflow-clip rounded-panel bg-[#0b0b0c] text-white">
      <div
        tabIndex={n > 1 ? 0 : -1}
        role="group"
        aria-roledescription="carousel"
        aria-label={t.carousel(name)}
        onKeyDown={onKey}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="relative aspect-[4/5] max-h-[80vh] w-full touch-pan-y overflow-hidden"
      >
        {item ? (
          item.kind === "image" ? (
            <Image
              src={item.url}
              alt={t.photoAlt(name, cur + 1, n)}
              fill
              priority
              unoptimized
              sizes="(min-width:1024px) 50vw, 100vw"
              className="object-cover"
            />
          ) : (
            <VideoPlayer src={item.url} label={t.videoLabel(name, cur + 1, n)} playLabel={t.play} />
          )
        ) : (
          <div className="grid h-full place-items-center p-8 text-center">
            <div>
              <p className="text-[clamp(2rem,6vw,3.5rem)] font-extrabold leading-tight text-white/90">{name}</p>
              <p className="mt-3 text-body-lg text-white/70">{t.soon}</p>
            </div>
          </div>
        )}

        {n > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label={t.prev} className="btn absolute start-3 top-1/2 -translate-y-1/2 !rounded-full !bg-black/50 !px-0 text-white hover:!bg-black/70">
              <ChevronLeft size={22} aria-hidden className="rtl:rotate-180" />
            </button>
            <button type="button" onClick={() => go(1)} aria-label={t.next} className="btn absolute end-3 top-1/2 -translate-y-1/2 !rounded-full !bg-black/50 !px-0 text-white hover:!bg-black/70">
              <ChevronRight size={22} aria-hidden className="rtl:rotate-180" />
            </button>
            <span dir="ltr" className="pointer-events-none absolute start-3 top-3 rounded-full bg-black/50 px-3 py-1 text-caption font-semibold">
              {cur + 1} / {n}
            </span>
          </>
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
                    <video src={`${m.url}#t=0.1`} muted playsInline preload="metadata" className="h-full w-full object-cover" />
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
  );
}