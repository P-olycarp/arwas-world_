import type { Lang } from "@/lib/i18n";

export type Currency = "KES" | "OMR";

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
  amount?: number;
  currency?: Currency;
  image?: string;
};

export type OrderLine = {
  name: string;
  size: string;
  colour: string;
  note: string;
  qty: number;
  unitPrice: number | null;
};

export const round3 = (n: number) => Math.round(n * 1000) / 1000;

export function formatMoney(amount: number, currency: string) {
  const max = currency === "OMR" ? 3 : 2;
  return `${currency} ${amount.toLocaleString("en-US", { maximumFractionDigits: max })}`;
}

export function itemsToLines(items: BasketItem[]): OrderLine[] {
  return items.map((i) => ({
    name: i.orderName,
    size: i.size,
    colour: i.colour,
    note: i.note,
    qty: i.qty,
    unitPrice: typeof i.amount === "number" ? i.amount : null,
  }));
}

/** The WhatsApp message the admin receives. Always English so the business can read it. */
export function buildOrderMessage(
  lines: OrderLine[],
  note: string,
  lang: Lang,
  opts: { number?: string; total?: number | null; currency?: string } = {},
): string {
  const out = [
    opts.number
      ? `Hi Arwas World, I would like to confirm my order ${opts.number}:`
      : "Hi Arwas World, I would like to place an order:",
    "",
  ];
  lines.forEach((l, i) => {
    const parts: string[] = [];
    if (l.size) parts.push(`Size: ${l.size}`);
    if (l.colour) parts.push(`Colour: ${l.colour}`);
    if (l.note) parts.push(`Print/notes: "${l.note}"`);
    if (l.unitPrice !== null && opts.currency) {
      parts.push(
        `Qty: ${l.qty} x ${formatMoney(l.unitPrice, opts.currency)} = ${formatMoney(round3(l.unitPrice * l.qty), opts.currency)}`,
      );
    } else {
      parts.push(`Qty: ${l.qty}`);
    }
    out.push(`${i + 1}. ${l.name}`);
    out.push(`   ${parts.join(" | ")}`);
  });
  const pieces = lines.reduce((n, l) => n + l.qty, 0);
  out.push("");
  out.push(
    typeof opts.total === "number" && opts.currency
      ? `Total: ${formatMoney(opts.total, opts.currency)}`
      : "Total: to be confirmed",
  );
  out.push(`Total pieces: ${pieces}`);
  if (note.trim()) out.push("", `Delivery / notes: ${note.trim()}`);
  if (lang === "ar") out.push("", "(Ordered from the Arabic site)");
  return out.join("\n");
}