import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const roboto = Roboto({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  metadataBase: new URL("https://krapper.vercel.app"),
  title: "Krapper | High-Speed Job Scraper",
  description: "Extract job listings in seconds using Krapper's high-speed, proxy-powered scraping technology. No registration required.",
  keywords: ["job scraper", "job search tool", "data extraction", "scraping"],
  authors: [{ name: "Kirtan Patel" }],
  openGraph: {
    title: "Krapper | High-Speed Job Scraper",
    description: "Extract job listings in seconds using Krapper's high-speed, proxy-powered scraping technology.",
    type: "website",
    locale: "en_US",
    siteName: "Krapper",
    images: [
      {
        url: "https://krapper.vercel.app/og.png",
        width: 1200,
        height: 630,
        alt: "Krapper | High-Speed Job Scraper",
      },
      {
        url: "https://krapper.vercel.app/square.png",
        width: 600,
        height: 600,
        alt: "Krapper Icon",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Krapper | High-Speed Job Scraper",
    description: "Extract job listings in seconds using Krapper's high-speed, proxy-powered scraping technology.",
    images: ["https://krapper.vercel.app/card.png"],
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-K97XZWQ6QB"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-K97XZWQ6QB');
          `}
        </Script>
      </head>
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
