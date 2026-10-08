import { waLink } from "@/data/products";

const links = [
  { href: "#studio", label: "3D studio" },
  { href: "#shop", label: "Shop" },
  { href: "#custom", label: "Customizing" },
  { href: "#markets", label: "Where we ship" },
];

export default function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto grid max-w-[1200px] gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <p className="text-body-lg font-semibold">Arwas World</p>
          <p className="mt-2 max-w-[28em] text-body-lg text-muted">
            Comfy, customized apparel and drinkware. Based in Kenya and Oman,
            shipping worldwide.
          </p>
        </div>
        <nav aria-label="Footer">
          <h2 className="mb-2 text-body-lg font-semibold">Explore</h2>
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
          <h2 className="mb-2 text-body-lg font-semibold">Contact</h2>
          <a
            href={waLink("Hi Arwas World, I have a question.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center text-body-lg link"
          >
            Message us on WhatsApp
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-[1200px] px-4 py-4 text-caption text-muted sm:px-6">
          &copy; {new Date().getFullYear()} Arwas World. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
