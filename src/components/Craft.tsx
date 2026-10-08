import { Reveal } from "./Reveal";
import SectionHeading from "./SectionHeading";

const points = [
  {
    title: "Comfort first",
    body: "Every piece is chosen to feel good on the first wear and the fiftieth: soft fabrics, easy fits and prints that stay part of the garment.",
  },
  {
    title: "Your design, your way",
    body: "Send a name, a crest, a company logo or a rough sketch. We place it, show you the result and only print once you approve it.",
  },
  {
    title: "One piece or a hundred",
    body: "A single gift hoodie, a full football kit or matching mugs for your whole office. You get the same care at any quantity.",
  },
];

export default function Craft() {
  return (
    <section
      id="custom"
      aria-labelledby="craft-title"
      className="mx-auto max-w-[1000px] px-4 pt-24 sm:px-6 sm:pt-32"
    >
      <SectionHeading id="craft-title" eyebrow="Customizing" title="Made around you, not off a shelf" />
      <ul role="list">
        {points.map((p) => (
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
