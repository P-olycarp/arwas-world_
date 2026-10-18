import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

export const ORDER_STATUSES = ["new", "confirmed", "paid", "shipped", "delivered", "cancelled"] as const;

const lineSchema = new Schema(
  {
    productId: { type: String, default: "" },
    name: { type: String, default: "" },
    size: { type: String, default: "" },
    colour: { type: String, default: "" },
    note: { type: String, default: "" },
    qty: { type: Number, default: 1 },
    unitPrice: { type: Number, default: null },
  },
  { _id: false },
);

const orderSchema = new Schema({
  number: { type: String, required: true, unique: true },
  seq: { type: Number, required: true },
  lang: { type: String, enum: ["en", "ar"], default: "en" },
  currency: { type: String, enum: ["KES", "OMR"], default: "KES" },
  total: { type: Number, default: null },
  note: { type: String, default: "" },
  items: { type: [lineSchema], default: [] },
  status: { type: String, enum: ORDER_STATUSES, default: "new" },
  createdAt: { type: Date, default: Date.now, index: true },
});

export type OrderDoc = InferSchemaType<typeof orderSchema>;

export const OrderModel: Model<OrderDoc> =
  (mongoose.models.Order as Model<OrderDoc> | undefined) ?? mongoose.model<OrderDoc>("Order", orderSchema);

const counterSchema = new Schema({
  key: { type: String, required: true, unique: true },
  seq: { type: Number, default: 0 },
});

type CounterDoc = InferSchemaType<typeof counterSchema>;

const CounterModel: Model<CounterDoc> =
  (mongoose.models.Counter as Model<CounterDoc> | undefined) ?? mongoose.model<CounterDoc>("Counter", counterSchema);

/** Next order sequence number. Atomic, so two orders can never get the same number. */
export async function nextOrderSeq(): Promise<number> {
  const c = await CounterModel.findOneAndUpdate({ key: "order" }, { $inc: { seq: 1 } }, { upsert: true, new: true });
  return c.seq;
}