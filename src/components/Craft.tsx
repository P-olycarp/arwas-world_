import { Reveal } from "./Reveal";
import SectionHeading from "./SectionHeading";
import { DICT, type Lang } from "@/lib/i18n";

export default function Craft({ lang }: { lang: Lang }) {
  const t = DICT[lang].craft;
  return (
    <section id="custom" aria-labelledby="craft-title" className="mx-auto max-w-[1000px] px-4 pt-24 sm:px-6 sm:pt-32">
      <SectionHeading id="craft-title" eyebrow={t.eyebrow} title={t.title} />
      <ul role="list">
        {t.points.map((p) => (
          <li key={p.title} className="border-t border-line">
            <Reveal className="grid gap-3 py-8 md:grid-cols-[1fr_1.4fr] md:gap-8">
              <h3 className="text-title3 font-semibold tracking-tight">{p.title}</h3>
              <p className="text-body-lg text-muted">{p.body}</p>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
