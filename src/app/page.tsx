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

export default function Home() {
  return (
    <MotionProvider>
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <Nav />
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero />
        <Studio />
        <Shop />
        <Craft />
        <Process />
        <Markets />
        <Cta />
      </main>
      <Footer />
    </MotionProvider>
  );
}
