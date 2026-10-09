import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const adminSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    failedAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Date },
  },
  { timestamps: true },
);

export type AdminUserDoc = InferSchemaType<typeof adminSchema>;

export const AdminUserModel: Model<AdminUserDoc> =
  (mongoose.models.AdminUser as Model<AdminUserDoc> | undefined) ??
  mongoose.model<AdminUserDoc>("AdminUser", adminSchema);
