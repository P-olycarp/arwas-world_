export type ProductKind =
  | "hoodie"
  | "tee"
  | "polo"
  | "jersey"
  | "tumbler"
  | "bottle"
  | "mug";

export type MediaItem = { kind: "image" | "video"; url: string };

export type Product = {
  id: string;
  kind: ProductKind;
  name: string;
  tagline: string;
  description: string;
  specs: { label: string; value: string }[];
  /** Path in /public/models. Leave undefined to use the placeholder shape. */
  model?: string;
  scale: number;
  offsetY: number;
  /** Optional display price, for example "KES 1,800". Empty shows "Request a quote". */
  price?: string;
  /** Optional photo in /public/products, for example "/products/hoodie.jpg". */
  image?: string;
  media?: MediaItem[];
  /** English name, used in WhatsApp order messages on the Arabic site. */
  orderName?: string;
};

export const WHATSAPP_NUMBER = "254115003996";

export const waLink = (message: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

export const COLORS = [
  { name: "Black", hex: "#1c1c1e" },
  { name: "White", hex: "#f2f2f0" },
  { name: "Sand", hex: "#d6c3a3" },
  { name: "Forest", hex: "#2f5d46" },
  { name: "Crimson", hex: "#a3212f" },
  { name: "Navy", hex: "#1f3357" },
] as const;

const SEED: SeedProduct[] = [
  {
    id: "hoodie",
    name: "Hoodies",
    tagline: "Warm, roomy, made to be lived in.",
    description:
      "A soft hoodie with a generous hood and front pocket. Print your design on the chest, back, sleeve or hood, whatever suits your team, school or brand.",
    specs: [
      { label: "Fit", value: "Relaxed, unisex" },
      { label: "Print areas", value: "Chest, back, sleeves" },
      { label: "Great for", value: "Teams, schools, gifts" },
    ],
    scale: 1,
    offsetY: -0.3,
  },
  {
    id: "tee",
    name: "T-shirts",
    tagline: "The everyday classic.",
    description:
      "A comfortable crew-neck tee that takes a print cleanly. Simple enough for daily wear, personal enough to be unmistakably yours.",
    specs: [
      { label: "Fit", value: "Regular, unisex" },
      { label: "Print areas", value: "Chest, back" },
      { label: "Great for", value: "Events, uniforms, merch" },
    ],
    scale: 1,
    offsetY: 0,
  },
  {
    id: "polo",
    name: "Polos",
    tagline: "Smart without trying too hard.",
    description:
      "A collared polo with a buttoned placket, ideal for staff uniforms and company events, with your logo on the chest.",
    specs: [
      { label: "Fit", value: "Regular" },
      { label: "Print areas", value: "Chest, sleeve, back" },
      { label: "Great for", value: "Staff, corporate, clubs" },
    ],
    scale: 1,
    offsetY: 0,
  },
  {
    id: "jersey",
    name: "Jerseys",
    tagline: "Kit your whole team.",
    description:
      "Sports jerseys made for movement, with your team name, player names and numbers. Order a full squad with matching designs.",
    specs: [
      { label: "Fit", value: "Athletic" },
      { label: "Print areas", value: "Front, back, sleeves" },
      { label: "Great for", value: "Teams, leagues, fan groups" },
    ],
    scale: 1,
    offsetY: 0,
  },
  {
    id: "tumbler",
    name: "Tumblers",
    tagline: "Your drink, your name on it.",
    description:
      "A tall tumbler with lid and straw for everyday carrying. Add a name, logo or message that wraps around the body.",
    specs: [
      { label: "Style", value: "Lid and straw" },
      { label: "Print areas", value: "Body wrap" },
      { label: "Great for", value: "Gifts, offices, brands" },
    ],
    scale: 1,
    offsetY: -0.5,
  },
  {
    id: "bottle",
    name: "Bottles",
    tagline: "Carry water in style.",
    description:
      "A slim reusable bottle for the gym, school or the road. Personalize it with a name or a logo for a gift people actually keep.",
    specs: [
      { label: "Style", value: "Slim, screw cap" },
      { label: "Print areas", value: "Body wrap" },
      { label: "Great for", value: "Sports, schools, events" },
    ],
    scale: 1,
    offsetY: -0.3,
  },
  {
    id: "mug",
    name: "Mugs",
    tagline: "Every morning, a little more you.",
    description:
      "A classic mug with a comfortable handle. A favourite for gifts and office sets, printed with your text or artwork.",
    specs: [
      { label: "Style", value: "Classic with handle" },
      { label: "Print areas", value: "Front wrap" },
      { label: "Great for", value: "Gifts, cafes, offices" },
    ],
    scale: 1.6,
    offsetY: 0,
  },
];

type SeedProduct = Omit<Product, "id" | "kind"> & { id: ProductKind };

export const PRODUCTS: Product[] = SEED.map((p) => ({ ...p, kind: p.id }));

export const waLinkTo = (number: string, message: string) =>
  `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
