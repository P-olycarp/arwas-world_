import { FaWhatsapp } from "react-icons/fa6";
import { waLinkTo } from "@/data/products";
import type { Lang } from "@/lib/i18n";

export default function FloatingWhatsApp({ whatsapp, lang }: { whatsapp: string; lang: Lang }) {
  const ar = lang === "ar";
  const label = ar ? "تحدث معنا عبر واتساب (يفتح في تبويب جديد)" : "Chat on WhatsApp (opens in a new tab)";
  return (
    <a
      href={waLinkTo(whatsapp, "Hi Arwas World, I have a question.")}
      target="_blank"
      rel="noopener noreferrer"
      data-source="floating"
      aria-label={label}
      className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] end-4 z-40 inline-flex h-14 min-w-14 items-center justify-center gap-2 rounded-full bg-[#0a7566] px-3.5 text-white shadow-e16 transition hover:bg-[#085c50] md:bottom-6 md:end-6 md:px-5"
    >
      <FaWhatsapp size={30} aria-hidden />
      <span aria-hidden className="hidden text-body-lg font-semibold md:inline">
        {ar ? "تحدث معنا" : "Chat with us"}
      </span>
    </a>
  );
}