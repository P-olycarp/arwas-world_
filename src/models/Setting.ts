import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const settingSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    whatsapp: { type: String, default: "" },
    heroIntro: { type: String, default: "" },
    footerBlurb: { type: String, default: "" },
  },
  { timestamps: true },
);

export type SettingDoc = InferSchemaType<typeof settingSchema>;

export const SettingModel: Model<SettingDoc> =
  (mongoose.models.Setting as Model<SettingDoc> | undefined) ??
  mongoose.model<SettingDoc>("Setting", settingSchema);
