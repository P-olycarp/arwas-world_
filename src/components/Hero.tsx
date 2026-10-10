import { Reveal } from "./Reveal";
import { DICT, type Lang } from "@/lib/i18n";

export default function Hero({ intro, lang }: { intro: string; lang: Lang }) {
  const t = DICT[lang].hero;
  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate overflow-hidden px-4 pb-14 pt-16 text-center sm:px-6 sm:pt-24"
    >
      <div aria-hidden className="hero-aurora absolute inset-0 -z-10" />
      <Reveal>
        <p className="mb-4 text-body-lg font-semibold text-muted">{t.eyebrow}</p>
      </Reveal>
      <Reveal delay={0.06}>
        <h1 id="hero-title" className="mx-auto max-w-[14ch] text-display font-semibold tracking-tight">
          {t.a} <span className="text-gradient">{t.b}</span>
        </h1>
      </Reveal>
      <Reveal delay={0.14}>
        <p className="mx-auto mb-8 mt-6 max-w-[36em] text-subtitle text-muted">{intro}</p>
      </Reveal>
      <Reveal delay={0.22}>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a href="#studio" className="btn btn-primary">{t.primary}</a>
          <a href="#custom" className="btn btn-secondary">{t.secondary}</a>
        </div>
      </Reveal>
    </section>
  );
}
