import { MessageCircle } from "lucide-react";
import { waLinkTo } from "@/data/products";
import type { Lang } from "@/lib/i18n";

export default function FloatingWhatsApp({ whatsapp, lang }: { whatsapp: string; lang: Lang }) {
  const label =
    lang === "ar" ? "تحدث معنا عبر واتساب (يفتح في تبويب جديد)" : "Chat on WhatsApp (opens in a new tab)";
  return (
    <a
      href={waLinkTo(whatsapp, "Hi Arwas World, I have a question.")}
      target="_blank"
      rel="noopener noreferrer"
      data-source="floating"
      aria-label={label}
      className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] end-4 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25d366] text-black shadow-e16 md:hidden"
    >
      <MessageCircle size={26} aria-hidden />
    </a>
  );
}