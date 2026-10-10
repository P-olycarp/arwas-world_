import { Globe, MapPin } from "lucide-react";
import { Reveal } from "./Reveal";
import SectionHeading from "./SectionHeading";
import { DICT, type Lang } from "@/lib/i18n";

const STYLE = [
  { icon: MapPin, color: "var(--kenya)" },
  { icon: MapPin, color: "var(--oman)" },
  { icon: Globe, color: "var(--sky)" },
];

export default function Markets({ lang }: { lang: Lang }) {
  const t = DICT[lang].markets;
  return (
    <section id="markets" aria-labelledby="markets-title" className="mx-auto max-w-[1000px] px-4 pt-24 sm:px-6 sm:pt-32">
      <SectionHeading id="markets-title" eyebrow={t.eyebrow} title={t.title} />
      <ul role="list" className="grid gap-4 md:grid-cols-3">
        {t.items.map((m, i) => {
          const { icon: Icon, color } = STYLE[i];
          return (
            <li key={m.title}>
              <Reveal delay={i * 0.08} className="card h-full rounded-card p-6">
                <span
                  aria-hidden
                  style={{ color, background: `color-mix(in srgb, ${color} 14%, var(--surface))` }}
                  className="mb-8 grid h-11 w-11 place-items-center rounded-card"
                >
                  <Icon size={22} strokeWidth={2} />
                </span>
                <h3 className="mb-2 text-subtitle font-semibold tracking-tight">{m.title}</h3>
                <p className="text-body-lg text-muted">{m.body}</p>
              </Reveal>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
