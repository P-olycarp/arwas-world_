"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import type { Product } from "@/data/products";
import { APPAREL_KINDS, BDICT, DEFAULT_SIZES } from "@/lib/basket-i18n";
import type { Lang } from "@/lib/i18n";
import { useBasket } from "./BasketProvider";

export default function ProductOptions({ product, lang }: { product: Product; lang: Lang }) {
  const t = BDICT[lang].options;
  const { add, count, openBasket } = useBasket();
  const sizes = product.sizes?.length ? product.sizes : APPAREL_KINDS.includes(product.kind) ? DEFAULT_SIZES : [];
  const colours = product.colours ?? [];
  const [size, setSize] = useState("");
  const [colour, setColour] = useState("");
  const [note, setNote] = useState("");
  const [qty, setQty] = useState(1);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");

  function submit() {
    setDone("");
    if (sizes.length && !size) return setError(t.sizeError);
    if (colours.length && !colour) return setError(t.colourError);
    const result = add({
      productId: product.id,
      name: product.name,
      orderName: product.orderName ?? product.name,
      kind: product.kind,
      size,
      colour,
      note: note.trim(),
      qty,
      price: product.price,
      image: product.image,
    });
    if (result === "full") return setError(t.full);
    setError("");
    setDone(t.added(count + qty));
  }

  const choice = (label: string, values: string[], current: string, set: (v: string) => void) => (
    <fieldset className="m-0 border-0 p-0">
      <legend className="mb-2 text-body-lg font-semibold">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {values.map((v) => (
          <button key={v} type="button" className="toggle" aria-pressed={current === v} onClick={() => set(v)}>
            {v}
          </button>
        ))}
      </div>
    </fieldset>
  );

  return (
    <div className="flex flex-col gap-5">
      {sizes.length > 0 && choice(t.size, sizes, size, setSize)}
      {colours.length > 0 && choice(t.colour, colours, colour, setColour)}

      <div className="grid gap-1.5">
        <label htmlFor={`note-${product.id}`} className="text-body-lg font-semibold">{t.note}</label>
        <input
          id={`note-${product.id}`}
          className="field"
          value={note}
          maxLength={80}
          autoComplete="off"
          aria-describedby={`note-help-${product.id}`}
          onChange={(e) => setNote(e.target.value)}
        />
        <p id={`note-help-${product.id}`} className="text-body text-muted">{t.noteHelp}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-body-lg font-semibold">{t.qty}</span>
        <div className="flex items-center gap-1">
          <button type="button" className="btn btn-secondary !px-0" aria-label={t.less} onClick={() => setQty((q) => Math.max(1, q - 1))}>
            <Minus size={18} aria-hidden />
          </button>
          <output aria-label={t.qty} className="grid min-w-12 place-items-center text-body-lg font-semibold">{qty}</output>
          <button type="button" className="btn btn-secondary !px-0" aria-label={t.more} onClick={() => setQty((q) => Math.min(50, q + 1))}>
            <Plus size={18} aria-hidden />
          </button>
        </div>
      </div>

      {error && <p role="alert" className="text-body-lg font-semibold text-oman">{error}</p>}

      <button type="button" onClick={submit} className="btn btn-primary w-full sm:w-auto sm:self-start">
        <ShoppingBag size={18} aria-hidden />
        {t.add}
      </button>

      <p role="status" className="flex flex-wrap items-center gap-3 text-body-lg">
        {done && (
          <>
            <span className="font-semibold">{done}</span>
            <button type="button" onClick={openBasket} className="link min-h-11">{t.view}</button>
          </>
        )}
      </p>

      <p className="max-w-[30em] text-body text-muted">{t.help}</p>
    </div>
  );
}