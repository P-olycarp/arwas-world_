import { Reveal } from "./Reveal";
import HeroReel, { type Reel } from "./HeroReel";
import { DICT, type Lang } from "@/lib/i18n";

export default function Hero({ intro, lang, reels }: { intro: string; lang: Lang; reels: Reel[] }) {
  const t = DICT[lang].hero;
  const dark = reels.length > 0;

  const copy = (
    <>
      <Reveal>
        <p className={`mb-4 text-body-lg font-semibold ${dark ? "text-white/85" : "text-muted"}`}>{t.eyebrow}</p>
      </Reveal>
      <Reveal delay={0.06}>
        <h1
          id="hero-title"
          className={`mx-auto max-w-[14ch] text-display font-semibold tracking-tight ${dark ? "text-white" : ""}`}
        >
          {t.a} <span className={dark ? "text-gradient-light" : "text-gradient"}>{t.b}</span>
        </h1>
      </Reveal>
      <Reveal delay={0.14}>
        <p className={`mx-auto mb-8 mt-6 max-w-[36em] text-subtitle ${dark ? "text-white/85" : "text-muted"}`}>{intro}</p>
      </Reveal>
      <Reveal delay={0.22}>
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
          <a href="#studio" className={dark ? "btn btn-inverse" : "btn btn-primary"}>
            {t.primary}
          </a>
          <a href="#custom" className={dark ? "btn border-white/60 text-white hover:bg-white/15" : "btn btn-secondary"}>
            {t.secondary}
          </a>
        </div>
      </Reveal>
    </>
  );

  if (!dark) {
    return (
      <section
        aria-labelledby="hero-title"
        className="relative isolate overflow-hidden px-4 pb-14 pt-16 text-center sm:px-6 sm:pt-24"
      >
        <div aria-hidden className="hero-aurora absolute inset-0 -z-10" />
        {copy}
      </section>
    );
  }

  return (
    <HeroReel reels={reels} lang={lang}>
      {copy}
    </HeroReel>
  );
}