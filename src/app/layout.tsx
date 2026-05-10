import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "UnifiedTools Pro | Premium Utilities",
  description: "Advanced image converters, geo-tagger, and SEO utilities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Force ignore any injected scripts/styles from extensions */}
      </head>
      <body 
        className={`${inter.className} min-h-screen flex flex-col bg-white text-slate-900`}
        suppressHydrationWarning
      >
        <div className="aurora-bg opacity-30" suppressHydrationWarning></div>
        <Navbar />
        <main className="flex-1 mt-16 bg-white" suppressHydrationWarning>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
