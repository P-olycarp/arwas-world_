import { waLinkTo } from "@/data/products";
import { DICT, type Lang } from "@/lib/i18n";
import { Reveal } from "./Reveal";

export default function Cta({ whatsapp, lang }: { whatsapp: string; lang: Lang }) {
  const t = DICT[lang].cta;
  return (
    <section aria-labelledby="cta-title" className="px-3 pb-16 pt-24 sm:px-6 sm:pt-32">
      <Reveal>
        <div className="cta-panel mx-auto max-w-[1200px] rounded-panel px-6 py-16 text-center text-white sm:py-24">
          <h2 id="cta-title" className="mx-auto mb-8 max-w-[16ch] text-title1 font-semibold tracking-tight">
            {t.title}
          </h2>
          <a
            href={waLinkTo(whatsapp, "Hi Arwas World, I would like to place a custom order.")}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-inverse"
          >
            {t.button}
            <span className="sr-only">{DICT[lang].nav.newTab}</span>
          </a>
        </div>
      </Reveal>
    </section>
  );
}
