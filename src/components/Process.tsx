import { Reveal } from "./Reveal";
import SectionHeading from "./SectionHeading";
import { DICT, type Lang } from "@/lib/i18n";

const COLORS = ["var(--kenya)", "var(--gold)", "var(--oman)"];

export default function Process({ lang }: { lang: Lang }) {
  const t = DICT[lang].process;
  return (
    <section aria-labelledby="process-title" className="mx-auto max-w-[1000px] px-4 pt-24 sm:px-6 sm:pt-32">
      <SectionHeading id="process-title" eyebrow={t.eyebrow} title={t.title} />
      <ol role="list" className="grid gap-4 md:grid-cols-3">
        {t.steps.map((s, i) => (
          <li key={s.title}>
            <Reveal delay={i * 0.08} className="card h-full rounded-card p-6">
              <span
                aria-hidden
                style={{
                  color: COLORS[i],
                  background: `color-mix(in srgb, ${COLORS[i]} 14%, var(--surface))`,
                }}
                className="mb-4 grid h-11 w-11 place-items-center rounded-card text-subtitle font-semibold"
              >
                {i + 1}
              </span>
              <h3 className="mb-2 text-subtitle font-semibold tracking-tight">
                <span className="sr-only">{t.step}{i + 1}: </span>
                {s.title}
              </h3>
              <p className="text-body-lg text-muted">{s.body}</p>
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  );
}
