import HomePage from "@/components/HomePage";

export const revalidate = 300;

export const metadata = {
  alternates: { canonical: "/", languages: { en: "/", ar: "/ar" } },
};

export default function Page() {
  return <HomePage lang="en" />;
}