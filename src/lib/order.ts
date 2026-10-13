import type { Lang } from "@/lib/i18n";

export type BasketItem = {
  key: string;
  productId: string;
  name: string;
  orderName: string;
  kind: string;
  size: string;
  colour: string;
  note: string;
  qty: number;
  price?: string;
  image?: string;
};

/** The WhatsApp message the admin receives. Always English so the business can read it. */
export function buildOrderMessage(items: BasketItem[], note: string, lang: Lang): string {
  const lines = ["Hi Arwas World, I would like to place an order:", ""];
  items.forEach((it, i) => {
    const parts: string[] = [];
    if (it.size) parts.push(`Size: ${it.size}`);
    if (it.colour) parts.push(`Colour: ${it.colour}`);
    if (it.note) parts.push(`Print/notes: "${it.note}"`);
    parts.push(`Qty: ${it.qty}`);
    lines.push(`${i + 1}. ${it.orderName}`);
    lines.push(`   ${parts.join(" | ")}`);
  });
  const total = items.reduce((n, it) => n + it.qty, 0);
  lines.push("", `Total pieces: ${total}`);
  if (note.trim()) lines.push("", `Delivery / notes: ${note.trim()}`);
  if (lang === "ar") lines.push("", "(Ordered from the Arabic site)");
  return lines.join("\n");
}