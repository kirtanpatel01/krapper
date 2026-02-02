import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Krapper | High-Speed Indeed Job Scraper",
  description: "Extract job listings from Indeed in seconds using Krapper's high-speed, proxy-powered scraping technology. No registration required.",
  keywords: ["job scraper", "indeed scraper", "job search tool", "data extraction", "scraping"],
  authors: [{ name: "Kirtan Patel" }],
  openGraph: {
    title: "Krapper | High-Speed Indeed Job Scraper",
    description: "Extract job listings from Indeed in seconds using Krapper's high-speed, proxy-powered scraping technology.",
    type: "website",
    locale: "en_US",
    siteName: "Krapper",
  },
  twitter: {
    card: "summary_large_image",
    title: "Krapper | High-Speed Indeed Job Scraper",
    description: "Extract job listings from Indeed in seconds using Krapper's high-speed, proxy-powered scraping technology.",
  },
  alternates: {
    canonical: "https://krapper.vercel.app",
  },
};

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`antialiased ${roboto.variable} custom-scrollbar`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
