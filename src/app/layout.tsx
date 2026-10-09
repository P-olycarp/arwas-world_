import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import "./globals.css";
import "./theme.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "800"],
});

const display = Barlow_Condensed({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["700", "800"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

const description =
  "Customized hoodies, T-shirts, jerseys, polos, tumblers, bottles and mugs. Based in Kenya and Oman, shipping worldwide.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Arwas World | Comfy, customized apparel and drinkware",
    template: "%s | Arwas World",
  },
  description,
  applicationName: "Arwas World",
  openGraph: {
    type: "website",
    siteName: "Arwas World",
    title: "Arwas World | Comfy, customized apparel and drinkware",
    description,
    locale: "en_KE",
  },
  twitter: {
    card: "summary_large_image",
    title: "Arwas World",
    description,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${display.variable}`}>
      <body>{children}</body>
    </html>
  );
}
