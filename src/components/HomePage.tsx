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
import OverflowProbe from "@/components/OverflowProbe";
import LanguageBanner from "@/components/LanguageBanner";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import BasketProvider from "@/components/BasketProvider";
import BasketDrawer from "@/components/BasketDrawer";
import SearchDialog from "@/components/SearchDialog";
import type { Reel } from "@/components/HeroReel";
import { getProducts } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";
import { DICT, type Lang } from "@/lib/i18n";

export default async function HomePage({ lang }: { lang: Lang }) {
  const [products, settings] = await Promise.all([getProducts(lang), getSettings()]);
  const t = DICT[lang];
  const intro = lang === "ar" ? t.hero.intro : settings.heroIntro;
  const blurb = lang === "ar" ? t.footer.blurb : settings.footerBlurb;
  const whatsapp = lang === "ar" ? settings.whatsappOman || settings.whatsapp : settings.whatsapp;

  const reels: Reel[] = products
    .filter((p) => p.inReel !== false)
    .flatMap((p) =>
      (p.media ?? [])
        .filter((m) => m.kind === "video")
        .slice(0, 2)
        .map((m) => ({
          url: m.url,
          productId: p.id,
          name: p.name,
          tagline: p.tagline,
          price: p.price ?? null,
          poster: p.image ?? null,
        })),
    )
    .slice(0, 8);

  return (
    <MotionProvider>
      <BasketProvider>
        <a href="#main" className="skip-link">
          {t.skip}
        </a>
        <EnquiryTracker />
        <OverflowProbe />
        {lang === "en" && <LanguageBanner />}
        <Nav lang={lang} />
        <main id="main" tabIndex={-1} className="outline-none">
          <Hero intro={intro} lang={lang} reels={reels} />
          <Showcase products={products} whatsapp={whatsapp} lang={lang} />
          <Shop products={products} whatsapp={whatsapp} lang={lang} />
          <Craft lang={lang} />
          <Process lang={lang} />
          <Markets lang={lang} />
          <Cta whatsapp={whatsapp} lang={lang} />
        </main>
        <Footer whatsapp={whatsapp} blurb={blurb} lang={lang} />
        <FloatingWhatsApp whatsapp={whatsapp} lang={lang} />
        <BasketDrawer whatsapp={whatsapp} lang={lang} />
        <SearchDialog products={products} whatsapp={whatsapp} lang={lang} />
      </BasketProvider>
    </MotionProvider>
  );
}