import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Studio from "@/components/Studio";
import Shop from "@/components/Shop";
import Craft from "@/components/Craft";
import Process from "@/components/Process";
import Markets from "@/components/Markets";
import Cta from "@/components/Cta";
import Footer from "@/components/Footer";
import MotionProvider from "@/components/MotionProvider";
import EnquiryTracker from "@/components/EnquiryTracker";
import { getProducts } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";

export const revalidate = 300;

export default async function Home() {
  const [products, settings] = await Promise.all([getProducts(), getSettings()]);
  return (
    <MotionProvider>
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <EnquiryTracker />
      <Nav whatsapp={settings.whatsapp} />
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero intro={settings.heroIntro} />
        <Studio products={products} whatsapp={settings.whatsapp} />
        <Shop products={products} whatsapp={settings.whatsapp} />
        <Craft />
        <Process />
        <Markets />
        <Cta whatsapp={settings.whatsapp} />
      </main>
      <Footer whatsapp={settings.whatsapp} blurb={settings.footerBlurb} />
    </MotionProvider>
  );
}
