import type { Metadata } from "next";
import { Inter, Inter_Tight } from "next/font/google";
import "./globals.css";
import JsonLd from "@/components/seo/JsonLd";
import { siteSchema } from "@/lib/seo/schema";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Display/heading face for the redesign — zero new dependency (same next/font
// loader already importing Inter). Tighter, more geometric than body Inter.
const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.novique.ai"),
  title: {
    default: "Novique — AI consulting and products",
    template: "%s | Novique",
  },
  description:
    "We build custom AI and automation for small and mid-sized businesses — and build and operate our own AI products, so you get a team that's shipped the real thing.",
  authors: [{ name: "Novique" }],
  openGraph: {
    siteName: "Novique",
    url: "https://www.novique.ai",
    locale: "en_US",
    type: "website",
    title: "Novique — AI consulting and products",
    description:
      "We build custom AI and automation for small and mid-sized businesses — and build and operate our own AI products, so you get a team that's shipped the real thing.",
  },
  twitter: {
    card: "summary_large_image",
    site: "@noviqueai",
    creator: "@noviqueai",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${interTight.variable}`}>
      <body className={`${inter.className} antialiased`}>
        <JsonLd data={siteSchema()} />
        {children}
      </body>
    </html>
  );
}
