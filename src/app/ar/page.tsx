import type { Metadata } from "next";
import HomePage from "@/components/HomePage";

export const revalidate = 300;

const title = "Arwas World | ملابس وأدوات شرب مخصّصة ومريحة";
const description =
  "هوديات وتيشيرتات وقمصان رياضية وبولو وتامبلر وزجاجات وأكواب مخصّصة باسمك أو فريقك أو علامتك. من كينيا وعُمان، ونشحن إلى جميع أنحاء العالم.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/ar", languages: { en: "/", ar: "/ar" } },
  openGraph: { title, description, locale: "ar_OM", siteName: "Arwas World", type: "website" },
};

export default function Page() {
  return <HomePage lang="ar" />;
}