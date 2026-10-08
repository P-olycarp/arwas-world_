import { waLink } from "@/data/products";
import { Reveal } from "./Reveal";

export default function Cta() {
  return (
    <section
      aria-labelledby="cta-title"
      className="px-3 pb-16 pt-24 sm:px-6 sm:pt-32"
    >
      <Reveal>
        <div className="cta-panel mx-auto max-w-[1200px] rounded-panel px-6 py-16 text-center text-white sm:py-24">
          <h2
            id="cta-title"
            className="mx-auto mb-8 max-w-[16ch] text-title1 font-semibold tracking-tight"
          >
            Let&rsquo;s make something with your name on it
          </h2>
          <a
            href={waLink("Hi Arwas World, I would like to place a custom order.")}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-inverse"
          >
            Start an order on WhatsApp
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
      </Reveal>
    </section>
  );
}
