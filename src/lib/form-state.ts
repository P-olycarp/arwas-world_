export type FormState = { error?: string };

export type ProductFormValues = {
  name: string;
  slug: string;
  kind: string;
  tagline: string;
  description: string;
  price: string;
  image: string;
  model: string;
  scale: number;
  offsetY: number;
  sortOrder: number;
  published: boolean;
  specs: { label: string; value: string }[];
  media: { kind: "image" | "video"; url: string }[];
};

export const EMPTY_PRODUCT: ProductFormValues = {
  name: "",
  slug: "",
  kind: "hoodie",
  tagline: "",
  description: "",
  price: "",
  image: "",
  model: "",
  scale: 1,
  offsetY: 0,
  sortOrder: 0,
  published: true,
  specs: [],
  media: [],
};
