import type { Metadata } from "next";
import { Geist, Outfit } from "next/font/google";
import { connection } from "next/server";
import { getSettings } from "@/lib/queries";
import { siteUrl } from "@/lib/utils";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    metadataBase: new URL(siteUrl()),
    title: {
      default: settings.seoTitle || settings.siteName,
      template: `%s · ${settings.siteName}`,
    },
    description: settings.seoDescription,
    keywords: settings.seoKeywords
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    openGraph: {
      title: settings.seoTitle || settings.siteName,
      description: settings.seoDescription,
      images: settings.heroImage ? [settings.heroImage] : undefined,
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  await connection();
  return (
    <html lang="en" className={`${geistSans.variable} ${outfit.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
