import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import ClientBoot from "@/components/ClientBoot";
import RootLayoutShell from "@/components/RootLayoutShell";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "UnifiedTools Pro | Premium Utilities",
  description: "Advanced image converters, geo-tagger, and SEO utilities.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' }
    ],
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${inter.className} min-h-screen flex flex-col bg-white text-slate-900`}
      >
        <ClientBoot />
        <AnalyticsTracker />
        <RootLayoutShell>{children}</RootLayoutShell>
      </body>
    </html>
  );
}
