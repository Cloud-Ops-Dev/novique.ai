import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Novique.ai - AI Solutions for Your Small Business",
  description: "Unlock AI for your small business without the headache. Custom AI solutions that save time, cut costs, and boost growth. First consultation free.",
  keywords: ["AI consulting", "small business AI", "AI automation", "business automation", "AI chatbots", "AI solutions"],
  authors: [{ name: "Novique.ai" }],
  openGraph: {
    title: "Novique.ai - AI Solutions for Your Small Business",
    description: "Custom AI solutions that save time, cut costs, and boost growth. First consultation free.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
