import { waLinkTo } from "@/data/products";
import { DICT, type Lang } from "@/lib/i18n";

export default function Footer({
  whatsapp,
  blurb,
  lang,
}: {
  whatsapp: string;
  blurb: string;
  lang: Lang;
}) {
  const d = DICT[lang];
  const t = d.footer;
  const links = [
    { href: "#studio", label: d.nav.showcase },
    { href: "#shop", label: d.nav.shop },
    { href: "#custom", label: d.nav.custom },
    { href: "#markets", label: d.nav.markets },
  ];
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto grid max-w-[1200px] gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <p className="text-body-lg font-semibold">{d.nav.brand}</p>
          <p className="mt-2 max-w-[28em] text-body-lg text-muted">{blurb}</p>
        </div>
        <nav aria-label={t.aria}>
          <h2 className="mb-2 text-body-lg font-semibold">{t.explore}</h2>
          <ul role="list">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="inline-flex min-h-11 items-center text-body-lg text-muted hover:text-foreground hover:underline"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <h2 className="mb-2 text-body-lg font-semibold">{t.contact}</h2>
          <a
            href={waLinkTo(whatsapp, "Hi Arwas World, I have a question.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center text-body-lg link"
          >
            {t.wa}
            <span className="sr-only">{d.nav.newTab}</span>
          </a>
        </div>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-[1200px] px-4 py-4 text-caption text-muted sm:px-6">
          {t.rights(new Date().getFullYear())}
        </p>
      </div>
    </footer>
  );
}
