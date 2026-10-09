import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

export const ENQUIRY_SOURCES = ["studio", "shop", "general"] as const;
export const ENQUIRY_STATUSES = ["new", "contacted", "won", "lost"] as const;

const enquirySchema = new Schema({
  source: { type: String, enum: ENQUIRY_SOURCES, default: "general" },
  product: { type: String, default: "", trim: true },
  colour: { type: String, default: "", trim: true },
  printText: { type: String, default: "", trim: true },
  status: { type: String, enum: ENQUIRY_STATUSES, default: "new" },
  createdAt: { type: Date, default: Date.now, index: true },
});

export type EnquiryDoc = InferSchemaType<typeof enquirySchema>;

export const EnquiryModel: Model<EnquiryDoc> =
  (mongoose.models.Enquiry as Model<EnquiryDoc> | undefined) ??
  mongoose.model<EnquiryDoc>("Enquiry", enquirySchema);
