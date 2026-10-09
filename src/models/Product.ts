import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import { KINDS } from "@/lib/kinds";

const specSchema = new Schema(
  { label: { type: String, trim: true }, value: { type: String, trim: true } },
  { _id: false },
);

const mediaSchema = new Schema(
  {
    kind: { type: String, enum: ["image", "video"], required: true },
    url: { type: String, required: true },
  },
  { _id: false },
);

const productSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    kind: { type: String, required: true, enum: KINDS },
    name: { type: String, required: true, trim: true },
    tagline: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    specs: { type: [specSchema], default: [] },
    price: { type: String, default: "", trim: true },
    image: { type: String, default: "" },
    media: { type: [mediaSchema], default: [] },
    model: { type: String, default: "" },
    scale: { type: Number, default: 1 },
    offsetY: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export type ProductDoc = InferSchemaType<typeof productSchema>;

export const ProductModel: Model<ProductDoc> =
  (mongoose.models.Product as Model<ProductDoc> | undefined) ??
  mongoose.model<ProductDoc>("Product", productSchema);
