"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { BasketItem } from "@/lib/order";

type AddInput = Omit<BasketItem, "key">;

type Ctx = {
  items: BasketItem[];
  count: number;
  isOpen: boolean;
  openBasket: () => void;
  closeBasket: () => void;
  add: (item: AddInput) => "ok" | "full";
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
};

const BasketContext = createContext<Ctx | null>(null);
const STORAGE = "arwas_basket_v1";
const MAX_ITEMS = 20;
const MAX_QTY = 50;

export function useBasket() {
  const c = useContext(BasketContext);
  if (!c) throw new Error("useBasket must be used inside BasketProvider");
  return c;
}

function isItem(x: unknown): x is BasketItem {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.key === "string" &&
    typeof o.productId === "string" &&
    typeof o.name === "string" &&
    typeof o.orderName === "string" &&
    typeof o.qty === "number"
  );
}

export default function BasketProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<BasketItem[]>([]);
  const [ready, setReady] = useState(false);
  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setItems(
            parsed
              .filter(isItem)
              .slice(0, MAX_ITEMS)
              .map((i) => ({ ...i, size: i.size ?? "", colour: i.colour ?? "", note: i.note ?? "" })),
          );
        }
      }
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items, ready]);

  const add = useCallback(
    (item: AddInput): "ok" | "full" => {
      const key = [item.productId, item.size, item.colour, item.note.toLowerCase()].join("|");
      const existing = items.find((i) => i.key === key);
      if (existing) {
        setItems(items.map((i) => (i.key === key ? { ...i, qty: Math.min(MAX_QTY, i.qty + item.qty) } : i)));
        return "ok";
      }
      if (items.length >= MAX_ITEMS) return "full";
      setItems([...items, { ...item, key, qty: Math.min(MAX_QTY, item.qty) }]);
      return "ok";
    },
    [items],
  );

  const value = useMemo<Ctx>(
    () => ({
      items,
      count: items.reduce((n, i) => n + i.qty, 0),
      isOpen,
      openBasket: () => setOpen(true),
      closeBasket: () => setOpen(false),
      add,
      setQty: (key, qty) =>
        setItems((prev) => prev.map((i) => (i.key === key ? { ...i, qty: Math.max(1, Math.min(MAX_QTY, qty)) } : i))),
      remove: (key) => setItems((prev) => prev.filter((i) => i.key !== key)),
      clear: () => setItems([]),
    }),
    [items, isOpen, add],
  );

  return <BasketContext.Provider value={value}>{children}</BasketContext.Provider>;
}