"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import { SettingModel } from "@/models/Setting";

export type SettingsResult = { error?: string; ok?: boolean };

export async function saveSettings(formData: FormData): Promise<SettingsResult> {
  await requireAdmin();
  const digits = String(formData.get("whatsapp") ?? "").replace(/\D/g, "");
  const oman = String(formData.get("whatsappOman") ?? "").replace(/\D/g, "");
  const heroIntro = String(formData.get("heroIntro") ?? "").trim();
  const footerBlurb = String(formData.get("footerBlurb") ?? "").trim();

  if (digits.length < 8 || digits.length > 15) {
    return { error: "Enter the WhatsApp number with its country code, for example 254712345678." };
  }
  if (oman && (oman.length < 8 || oman.length > 15)) {
    return { error: "Enter the Oman WhatsApp number with its country code, for example 96891234567, or leave it empty." };
  }
  if (heroIntro.length < 10 || heroIntro.length > 300) {
    return { error: "The hero intro must be between 10 and 300 characters." };
  }
  if (footerBlurb.length < 5 || footerBlurb.length > 200) {
    return { error: "The footer text must be between 5 and 200 characters." };
  }

  try {
    await connectDb();
    await SettingModel.updateOne(
      { key: "site" },
      { $set: { whatsapp: digits, whatsappOman: oman, heroIntro, footerBlurb } },
      { upsert: true },
    );
  } catch (error) {
    console.error("saveSettings failed", error);
    return { error: "The settings could not be saved. Try again." };
  }

  revalidatePath("/");
  revalidatePath("/ar");
  revalidatePath("/admin/settings");
  return { ok: true };
}