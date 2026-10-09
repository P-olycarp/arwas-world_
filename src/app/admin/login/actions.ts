"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { connectDb } from "@/lib/db";
import { createSession } from "@/lib/session";
import { AdminUserModel } from "@/models/AdminUser";
import type { FormState } from "@/lib/form-state";

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

export async function login(formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const generic = { error: "The email or password is incorrect." };
  if (!email || !password) return generic;

  await connectDb();
  const user = await AdminUserModel.findOne({ email });
  if (!user) return generic;

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return { error: "Too many attempts. Try again in a few minutes." };
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    user.failedAttempts += 1;
    if (user.failedAttempts >= MAX_ATTEMPTS) {
      user.lockedUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);
      user.failedAttempts = 0;
    }
    await user.save();
    return generic;
  }

  user.failedAttempts = 0;
  user.lockedUntil = undefined;
  await user.save();
  await createSession(String(user._id), user.email);
  redirect("/admin");
}
