import { Globe, MapPin } from "lucide-react";
import { Reveal } from "./Reveal";
import SectionHeading from "./SectionHeading";

const markets = [
  {
    icon: MapPin,
    title: "Kenya",
    body: "Our home market, with delivery across the country.",
    color: "var(--kenya)",
  },
  {
    icon: MapPin,
    title: "Oman",
    body: "Customers across Oman order the same custom range.",
    color: "var(--oman)",
  },
  {
    icon: Globe,
    title: "Worldwide",
    body: "Ordering from somewhere else? Message us and we will arrange delivery.",
    color: "var(--sky)",
  },
];

export default function Markets() {
  return (
    <section
      id="markets"
      aria-labelledby="markets-title"
      className="mx-auto max-w-[1000px] px-4 pt-24 sm:px-6 sm:pt-32"
    >
      <SectionHeading
        id="markets-title"
        eyebrow="Where we ship"
        title="Rooted in Kenya and Oman, open to everywhere"
      />
      <ul role="list" className="grid gap-4 md:grid-cols-3">
        {markets.map((m, i) => (
          <li key={m.title}>
            <Reveal delay={i * 0.08} className="card h-full rounded-card p-6">
              <span
                aria-hidden
                style={{
                  color: m.color,
                  background: `color-mix(in srgb, ${m.color} 14%, var(--surface))`,
                }}
                className="mb-8 grid h-11 w-11 place-items-center rounded-card"
              >
                <m.icon size={22} strokeWidth={2} />
              </span>
              <h3 className="mb-2 text-subtitle font-semibold tracking-tight">
                {m.title}
              </h3>
              <p className="text-body-lg text-muted">{m.body}</p>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
