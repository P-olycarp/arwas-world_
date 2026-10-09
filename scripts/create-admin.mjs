import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const [, , email, password] = process.argv;

if (!email || !password || password.length < 12) {
  console.error("Usage: node --env-file=.env.local scripts/create-admin.mjs <email> <password of 12+ characters>");
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI);

const schema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    failedAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Date },
  },
  { timestamps: true },
);
const AdminUser = mongoose.models.AdminUser || mongoose.model("AdminUser", schema);

await AdminUser.updateOne(
  { email: email.toLowerCase() },
  {
    $set: { passwordHash: await bcrypt.hash(password, 12), failedAttempts: 0 },
    $unset: { lockedUntil: 1 },
  },
  { upsert: true },
);

console.log("Admin account ready for", email.toLowerCase());
await mongoose.disconnect();
