import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import MotionProvider from "@/components/MotionProvider";
import EnquiryTracker from "@/components/EnquiryTracker";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import BasketProvider from "@/components/BasketProvider";
import BasketDrawer from "@/components/BasketDrawer";
import SearchDialog from "@/components/SearchDialog";
import ProductGallery from "@/components/ProductGallery";
import ProductOptions from "@/components/ProductOptions";
import ShareButton from "@/components/ShareButton";
import { getProducts } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";
import { DICT, type Lang } from "@/lib/i18n";
import { siteUrl } from "@/lib/product-meta";

export default async function ProductPageView({ slug, lang }: { slug: string; lang: Lang }) {
  const [products, settings] = await Promise.all([getProducts(lang), getSettings()]);
  const product = products.find((p) => p.id === slug);
  if (!product) notFound();

  const ar = lang === "ar";
  const L = (en: string, arText: string) => (ar ? arText : en);
  const t = DICT[lang];
  const base = ar ? "/ar" : "";
  const whatsapp = ar ? settings.whatsappOman || settings.whatsapp : settings.whatsapp;
  const blurb = ar ? t.footer.blurb : settings.footerBlurb;
  const more = products
    .filter((p) => p.id !== product.id)
    .sort((a, b) => Number(b.kind === product.kind) - Number(a.kind === product.kind))
    .slice(0, 4);

  const images = (product.media ?? []).filter((m) => m.kind === "image").map((m) => m.url);
  const ld = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: images,
    brand: { "@type": "Brand", name: "Arwas World" },
    url: `${siteUrl()}${base}/p/${product.id}`,
  };

  return (
    <MotionProvider>
      <BasketProvider>
        <a href="#main" className="skip-link">{t.skip}</a>
        <EnquiryTracker />
        <Nav
          lang={lang}
          home={ar ? "/ar" : "/"}
          switchHref={ar ? `/p/${product.id}` : `/ar/p/${product.id}`}
        />
        <main id="main" tabIndex={-1} className="outline-none">
          <div className="mx-auto max-w-[1200px] px-4 pb-8 pt-6 sm:px-6">
            <Link
              href={`${base || "/"}#shop`}
              className="inline-flex min-h-11 items-center gap-2 text-body-lg text-muted hover:text-foreground"
            >
              <ArrowLeft size={18} aria-hidden className="rtl:rotate-180" />
              {L("Back to the shop", "العودة إلى المتجر")}
            </Link>

            <div className="mt-4 grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
              <div className="min-w-0 lg:sticky lg:top-20">
                <ProductGallery media={product.media ?? []} name={product.name} lang={lang} />
              </div>

              <div className="flex min-w-0 flex-col gap-6 break-words text-start">
                <div className="flex flex-col gap-4">
                  <h1 className="!text-[clamp(2rem,5vw,3rem)] !leading-[1.1] font-semibold tracking-tight">
                    {product.name}
                  </h1>
                  <p className="text-subtitle font-semibold">{product.tagline}</p>
                  <p className="text-subtitle font-semibold text-brand">{product.price ?? t.showcase.quote}</p>
                  <p className="max-w-[34em] text-body-lg text-muted">{product.description}</p>
                  <dl>
                    {product.specs.map((s) => (
                      <div
                        key={s.label}
                        className="flex flex-col gap-0.5 border-t border-line py-3 text-body-lg sm:flex-row sm:justify-between sm:gap-4"
                      >
                        <dt className="text-muted">{s.label}</dt>
                        <dd className="font-medium sm:text-end">{s.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <ProductOptions product={product} lang={lang} />
                <ShareButton productId={product.id} name={product.name} lang={lang} />
              </div>
            </div>
          </div>

          {more.length > 0 && (
            <section aria-labelledby="more-title" className="mx-auto max-w-[1200px] px-4 pb-16 pt-8 sm:px-6">
              <h2 id="more-title" className="mb-4 !text-title3 !leading-tight font-semibold">
                {L("More from Arwas World", "المزيد من Arwas World")}
              </h2>
              <ul role="list" className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {more.map((p) => (
                  <li key={p.id}>
                    <Link href={`${base}/p/${p.id}`} className="card block overflow-hidden rounded-card">
                      <span className="relative block aspect-[4/5] bg-panel">
                        {p.image && (
                          <Image
                            src={p.image}
                            alt=""
                            fill
                            unoptimized
                            sizes="(min-width:768px) 25vw, 50vw"
                            className="object-cover"
                          />
                        )}
                      </span>
                      <span className="block p-3">
                        <span className="block font-semibold">{p.name}</span>
                        <span className="block text-body text-muted">{p.price ?? t.showcase.quote}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </main>
        <Footer whatsapp={whatsapp} blurb={blurb} lang={lang} home={ar ? "/ar" : "/"} />
        <FloatingWhatsApp whatsapp={whatsapp} lang={lang} />
        <BasketDrawer whatsapp={whatsapp} lang={lang} />
        <SearchDialog products={products} whatsapp={whatsapp} lang={lang} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }}
        />
      </BasketProvider>
    </MotionProvider>
  );
}