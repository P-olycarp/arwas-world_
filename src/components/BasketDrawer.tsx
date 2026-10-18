"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Minus, Plus, Trash2, X } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import { waLinkTo } from "@/data/products";
import { BDICT } from "@/lib/basket-i18n";
import { DICT, type Lang } from "@/lib/i18n";
import { buildOrderMessage, formatMoney, itemsToLines, round3 } from "@/lib/order";
import { useBasket } from "./BasketProvider";

const X_TEXT = {
  en: {
    total: "Total",
    totalTbc: "Total confirmed on WhatsApp",
    mixed: "Your basket has prices in different currencies, so we confirm the total on WhatsApp.",
    placing: "Saving your order",
    failed: "Your order could not be saved. Try again.",
    savedTitle: "Order saved",
    savedNumber: "Your order number is",
    savedBody:
      "WhatsApp should have opened with your order. If it did not, tap the button below. Send the message so we can confirm delivery and payment.",
    again: "Open WhatsApp again",
    keep: "Keep browsing",
  },
  ar: {
    total: "المجموع",
    totalTbc: "المجموع يُؤكَّد عبر واتساب",
    mixed: "سلتك تحتوي أسعاراً بعملات مختلفة، لذلك نؤكد المجموع عبر واتساب.",
    placing: "جارٍ حفظ طلبك",
    failed: "تعذّر حفظ طلبك. حاول مرة أخرى.",
    savedTitle: "تم حفظ الطلب",
    savedNumber: "رقم طلبك هو",
    savedBody: "يجب أن يكون واتساب قد فُتح مع طلبك. إن لم يحدث ذلك، اضغط الزر أدناه. أرسل الرسالة لنؤكد التوصيل والدفع.",
    again: "افتح واتساب مرة أخرى",
    keep: "تابع التصفح",
  },
};

type Placed = { number: string; total: number | null; currency: string; url: string };

export default function BasketDrawer({ whatsapp, lang }: { whatsapp: string; lang: Lang }) {
  const t = BDICT[lang].basket;
  const x = X_TEXT[lang];
  const { items, count, isOpen, closeBasket, setQty, remove, clear } = useBasket();
  const ref = useRef<HTMLDialogElement>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [placed, setPlaced] = useState<Placed | null>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (isOpen && !d.open) d.showModal();
    if (!isOpen && d.open) d.close();
    if (!isOpen) {
      setPlaced(null);
      setError("");
    }
  }, [isOpen]);

  const currencies = new Set(items.map((i) => i.currency ?? ""));
  const allPriced = items.length > 0 && items.every((i) => typeof i.amount === "number" && i.currency);
  const sameCurrency = currencies.size === 1;
  const total =
    allPriced && sameCurrency
      ? round3(items.reduce((n, i) => n + (i.amount as number) * i.qty, 0))
      : null;
  const currency = total !== null ? (items[0].currency as string) : "";

  async function place() {
    if (busy || items.length === 0) return;
    setBusy(true);
    setError("");
    // Opened inside the click so the browser allows it, then pointed at WhatsApp once the order is saved.
    const w = window.open("", "_blank");
    if (w) w.opener = null;
    const go = (url: string) => {
      if (w) w.location.href = url;
      else window.location.href = url;
    };
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 9000);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          lang,
          note,
          items: items.map((i) => ({
            productId: i.productId,
            size: i.size,
            colour: i.colour,
            note: i.note,
            qty: i.qty,
          })),
        }),
      });
      if (res.status >= 400 && res.status < 500) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        w?.close();
        setError(data.error ?? x.failed);
        return;
      }
      if (!res.ok) throw new Error("server");
      const data = (await res.json()) as { number: string; total: number | null; currency: string; message: string };
      const url = waLinkTo(whatsapp, data.message);
      go(url);
      setPlaced({ number: data.number, total: data.total, currency: data.currency, url });
      clear();
      setNote("");
    } catch {
      // Saving failed. Still send the order on WhatsApp so the sale is not lost.
      const message = buildOrderMessage(itemsToLines(items), note, lang);
      go(waLinkTo(whatsapp, message));
      try {
        fetch("/api/enquiries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ source: "basket", product: `Basket (${count})`, details: message }),
          keepalive: true,
        }).catch(() => {});
      } catch {
        /* ignore */
      }
    } finally {
      clearTimeout(timer);
      setBusy(false);
    }
  }

  return (
    <dialog
      ref={ref}
      onClose={closeBasket}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeBasket();
      }}
      aria-labelledby="basket-title"
      className="m-0 ms-auto h-dvh max-h-none w-full max-w-md border-s border-line bg-surface p-0 text-foreground shadow-e16 backdrop:bg-black/50"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-line p-4">
          <h2 id="basket-title" className="text-title3 font-semibold">
            {t.title} <span className="text-muted">({count})</span>
          </h2>
          <button type="button" onClick={closeBasket} aria-label={t.close} className="btn btn-subtle !px-0">
            <X size={22} aria-hidden />
          </button>
        </div>

        {placed ? (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid gap-4 py-6 text-center">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-kenya/15 text-kenya">
                <Check size={28} aria-hidden />
              </span>
              <p className="text-subtitle font-semibold">{x.savedTitle}</p>
              <p className="text-body-lg">
                {x.savedNumber} <span dir="ltr" className="font-bold">{placed.number}</span>
              </p>
              {placed.total !== null && (
                <p className="text-body-lg">
                  {x.total}: <span dir="ltr" className="font-semibold">{formatMoney(placed.total, placed.currency)}</span>
                </p>
              )}
              <p className="text-body-lg text-muted">{x.savedBody}</p>
              <button type="button" onClick={() => window.open(placed.url, "_blank", "noopener")} className="btn btn-primary w-full">
                <FaWhatsapp size={22} aria-hidden />
                {x.again}
              </button>
              <button type="button" onClick={closeBasket} className="btn btn-secondary w-full">{x.keep}</button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="grid gap-2 py-10 text-center">
                  <p className="text-subtitle font-semibold">{t.empty}</p>
                  <p className="text-body-lg text-muted">{t.emptyHint}</p>
                </div>
              ) : (
                <ul role="list" className="grid gap-3">
                  {items.map((it) => {
                    const summary = [it.size && `${t.sizeWord} ${it.size}`, it.colour, it.note && `"${it.note}"`]
                      .filter(Boolean)
                      .join(" · ");
                    return (
                      <li key={it.key} className="card flex gap-3 rounded-card p-3">
                        <div className="h-16 w-16 flex-none overflow-hidden rounded-card bg-panel">
                          {it.image && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={it.image} alt="" className="h-full w-full object-cover" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="break-words font-semibold">{it.name}</p>
                          {summary && <p className="break-words text-body text-muted">{summary}</p>}
                          {it.price && <p className="text-body">{it.price}</p>}
                          <div className="mt-2 flex items-center gap-1">
                            <button type="button" className="btn btn-secondary !min-h-11 !px-0" aria-label={t.less(it.name)} onClick={() => setQty(it.key, it.qty - 1)}>
                              <Minus size={16} aria-hidden />
                            </button>
                            <output className="grid min-w-10 place-items-center font-semibold">{it.qty}</output>
                            <button type="button" className="btn btn-secondary !min-h-11 !px-0" aria-label={t.more(it.name)} onClick={() => setQty(it.key, it.qty + 1)}>
                              <Plus size={16} aria-hidden />
                            </button>
                            <button type="button" className="btn btn-subtle ms-auto !min-h-11 !px-0" aria-label={t.remove(it.name)} onClick={() => remove(it.key)}>
                              <Trash2 size={18} aria-hidden />
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="grid gap-3 border-t border-line p-4">
                <p className="flex items-baseline justify-between gap-3 text-subtitle font-semibold">
                  <span>{x.total}</span>
                  <span dir="ltr" className={total === null ? "text-body-lg font-medium text-muted" : ""}>
                    {total !== null ? formatMoney(total, currency) : x.totalTbc}
                  </span>
                </p>
                {allPriced && !sameCurrency && <p className="text-body text-muted">{x.mixed}</p>}

                <div className="grid gap-1.5">
                  <label htmlFor="basket-notes" className="text-body-lg font-semibold">{t.notes}</label>
                  <textarea
                    id="basket-notes"
                    className="field !min-h-20 py-2"
                    rows={2}
                    maxLength={200}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    aria-describedby="basket-notes-help"
                  />
                  <p id="basket-notes-help" className="text-body text-muted">{t.notesHelp}</p>
                </div>

                {error && <p role="alert" className="text-body-lg font-semibold text-oman">{error}</p>}

                <button type="button" onClick={place} disabled={busy} className="btn btn-primary w-full">
                  <FaWhatsapp size={22} aria-hidden />
                  {busy ? x.placing : t.whatsapp}
                  <span className="sr-only">{DICT[lang].nav.newTab}</span>
                </button>

                <button type="button" disabled className="btn btn-secondary w-full cursor-not-allowed opacity-70">
                  {t.mpesa}
                  <span className="rounded-full bg-panel px-2 py-0.5 text-caption font-semibold">{t.soon}</span>
                </button>
                <p className="text-body text-muted">{t.mpesaNote}</p>
                <p className="text-body text-muted">{t.priceNote}</p>

                <button type="button" onClick={clear} className="btn btn-subtle self-start">{t.clear}</button>
              </div>
            )}
          </>
        )}
      </div>
    </dialog>
  );
}