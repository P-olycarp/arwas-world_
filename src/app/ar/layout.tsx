import { Cairo } from "next/font/google";

const arabic = Cairo({ subsets: ["arabic", "latin"], variable: "--font-arabic" });

export default function ArabicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div lang="ar" dir="rtl" className={`${arabic.variable} rtl-site`}>
      {children}
    </div>
  );
}