"use client";

import { useEffect, useState } from "react";

/** Diagnostic only. Visible when the address ends with ?probe=1. Lists elements wider than the screen. */
export default function OverflowProbe() {
  const [lines, setLines] = useState<string[] | null>(null);

  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has("probe")) return;

    const clipped = (el: HTMLElement) => {
      let p = el.parentElement;
      while (p && p !== document.body && p !== document.documentElement) {
        const o = getComputedStyle(p).overflowX;
        if (o === "auto" || o === "scroll" || o === "hidden" || o === "clip") return true;
        p = p.parentElement;
      }
      return false;
    };

    const run = () => {
      const w = window.innerWidth;
      const head = `innerWidth ${w} | clientWidth ${document.documentElement.clientWidth} | scrollWidth ${document.documentElement.scrollWidth} | screen ${screen.width} | dpr ${window.devicePixelRatio} | visual ${Math.round(window.visualViewport?.width ?? 0)}`;
      const bad: string[] = [];
      document.querySelectorAll<HTMLElement>("body *").forEach((el) => {
        if (el.closest("[data-probe]")) return;
        const cs = getComputedStyle(el);
        if (cs.position === "fixed" || cs.display === "none") return;
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.right > w + 1 && !clipped(el)) {
          const cls = String(el.className).split(" ").slice(0, 5).join(" ");
          bad.push(`<${el.tagName.toLowerCase()}> ${cls} | right ${Math.round(r.right)} width ${Math.round(r.width)}`);
        }
      });
      setLines([head, bad.length ? "Sticking out:" : "Nothing sticks out.", ...bad.slice(0, 12)]);
    };

    run();
    const id = setTimeout(run, 1500);
    return () => clearTimeout(id);
  }, []);

  if (!lines) return null;
  return (
    <pre
      data-probe
      className="fixed bottom-0 start-0 z-[100] m-0 max-h-[45vh] w-full overflow-auto whitespace-pre-wrap break-all bg-black/90 p-2 text-[11px] leading-tight text-lime-300"
    >
      {lines.join("\n")}
    </pre>
  );
}