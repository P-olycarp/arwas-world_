import { Reveal } from "./Reveal";
import SectionHeading from "./SectionHeading";

const steps = [
  {
    title: "Choose",
    body: "Select a product and colour in the studio and see it in 3D.",
    color: "var(--kenya)",
  },
  {
    title: "Share your design",
    body: "Message us on WhatsApp with your text, logo and sizes.",
    color: "var(--gold)",
  },
  {
    title: "We print and deliver",
    body: "Approve the preview, then we produce your order and ship it to you.",
    color: "var(--oman)",
  },
];

export default function Process() {
  return (
    <section
      aria-labelledby="process-title"
      className="mx-auto max-w-[1000px] px-4 pt-24 sm:px-6 sm:pt-32"
    >
      <SectionHeading id="process-title" eyebrow="How it works" title="Three steps from idea to doorstep" />
      <ol role="list" className="grid gap-4 md:grid-cols-3">
        {steps.map((s, i) => (
          <li key={s.title}>
            <Reveal delay={i * 0.08} className="card h-full rounded-card p-6">
              <span
                aria-hidden
                style={{
                  color: s.color,
                  background: `color-mix(in srgb, ${s.color} 14%, var(--surface))`,
                }}
                className="mb-4 grid h-11 w-11 place-items-center rounded-card text-subtitle font-semibold"
              >
                {i + 1}
              </span>
              <h3 className="mb-2 text-subtitle font-semibold tracking-tight">
                <span className="sr-only">Step {i + 1}: </span>
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
