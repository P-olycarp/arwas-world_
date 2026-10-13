"use client";

import { useEffect, useRef, useState } from "react";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import { waLinkTo } from "@/data/products";
import { BDICT } from "@/lib/basket-i18n";
import { DICT, type Lang } from "@/lib/i18n";
import { buildOrderMessage } from "@/lib/order";
import { useBasket } from "./BasketProvider";

export default function BasketDrawer({ whatsapp, lang }: { whatsapp: string; lang: Lang }) {
  const t = BDICT[lang].basket;
  const { items, count, isOpen, closeBasket, setQty, remove, clear } = useBasket();
  const ref = useRef<HTMLDialogElement>(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (isOpen && !d.open) d.showModal();
    if (!isOpen && d.open) d.close();
  }, [isOpen]);

  const message = buildOrderMessage(items, note, lang);

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

        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="grid gap-2 py-10 text-center">
              <p className="text-subtitle font-semibold">{t.empty}</p>
              <p className="text-body-lg text-muted">{t.emptyHint}</p>
            </div>
          ) : (
            <ul role="list" className="grid gap-3">
              {items.map((it) => {
                const summary = [
                  it.size && `${t.sizeWord} ${it.size}`,
                  it.colour,
                  it.note && `"${it.note}"`,
                ]
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

            <a
              href={waLinkTo(whatsapp, message)}
              target="_blank"
              rel="noopener noreferrer"
              data-source="basket"
              data-product={`Basket (${t.pieces(count)})`}
              data-details={message}
              className="btn btn-primary w-full"
            >
              <FaWhatsapp size={22} aria-hidden />
              {t.whatsapp}
              <span className="sr-only">{DICT[lang].nav.newTab}</span>
            </a>

            <button type="button" disabled className="btn btn-secondary w-full cursor-not-allowed opacity-70">
              {t.mpesa}
              <span className="rounded-full bg-panel px-2 py-0.5 text-caption font-semibold">{t.soon}</span>
            </button>
            <p className="text-body text-muted">{t.mpesaNote}</p>
            <p className="text-body text-muted">{t.priceNote}</p>

            <button type="button" onClick={clear} className="btn btn-subtle self-start">{t.clear}</button>
          </div>
        )}
      </div>
    </dialog>
  );
}