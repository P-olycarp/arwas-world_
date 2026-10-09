import { connectDb } from "@/lib/db";
import { SettingModel } from "@/models/Setting";
import { WHATSAPP_NUMBER } from "@/data/products";

export type SiteSettings = {
  whatsapp: string;
  heroIntro: string;
  footerBlurb: string;
};

export const DEFAULT_SETTINGS: SiteSettings = {
  whatsapp: WHATSAPP_NUMBER,
  heroIntro:
    "Hoodies, T-shirts, jerseys and polos, plus tumblers, bottles and mugs, made with your name, team or brand on them. We ship from Kenya and Oman to the world.",
  footerBlurb:
    "Comfy, customized apparel and drinkware. Based in Kenya and Oman, shipping worldwide.",
};

/** Site settings with a safe fallback to the defaults if the database is empty or unreachable. */
export async function getSettings(): Promise<SiteSettings> {
  try {
    await connectDb();
    const d = await SettingModel.findOne({ key: "site" }).lean();
    if (!d) return DEFAULT_SETTINGS;
    return {
      whatsapp: d.whatsapp || DEFAULT_SETTINGS.whatsapp,
      heroIntro: d.heroIntro || DEFAULT_SETTINGS.heroIntro,
      footerBlurb: d.footerBlurb || DEFAULT_SETTINGS.footerBlurb,
    };
  } catch (error) {
    console.error("getSettings failed, using defaults", error);
    return DEFAULT_SETTINGS;
  }
}
