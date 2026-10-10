import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Showcase from "@/components/Showcase";
import Shop from "@/components/Shop";
import Craft from "@/components/Craft";
import Process from "@/components/Process";
import Markets from "@/components/Markets";
import Cta from "@/components/Cta";
import Footer from "@/components/Footer";
import MotionProvider from "@/components/MotionProvider";
import EnquiryTracker from "@/components/EnquiryTracker";
import LanguageBanner from "@/components/LanguageBanner";
import { getProducts } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";
import { DICT, type Lang } from "@/lib/i18n";

export default async function HomePage({ lang }: { lang: Lang }) {
  const [products, settings] = await Promise.all([getProducts(lang), getSettings()]);
  const t = DICT[lang];
  const intro = lang === "ar" ? t.hero.intro : settings.heroIntro;
  const blurb = lang === "ar" ? t.footer.blurb : settings.footerBlurb;
  const whatsapp = lang === "ar" ? settings.whatsappOman || settings.whatsapp : settings.whatsapp;
  return (
    <MotionProvider>
      <a href="#main" className="skip-link">
        {t.skip}
      </a>
      <EnquiryTracker />
      {lang === "en" && <LanguageBanner />}
      <Nav whatsapp={whatsapp} lang={lang} />
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero intro={intro} lang={lang} />
        <Showcase products={products} whatsapp={whatsapp} lang={lang} />
        <Shop products={products} whatsapp={whatsapp} lang={lang} />
        <Craft lang={lang} />
        <Process lang={lang} />
        <Markets lang={lang} />
        <Cta whatsapp={whatsapp} lang={lang} />
      </main>
      <Footer whatsapp={whatsapp} blurb={blurb} lang={lang} />
    </MotionProvider>
  );
}