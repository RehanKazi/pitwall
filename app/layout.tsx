import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Sidebar, { MobileHeader, MobileNav } from "./components/Sidebar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Absolute base for the social preview image URL. Set NEXT_PUBLIC_SITE_URL to
 * your domain; on Vercel the production URL is used automatically.
 */
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

const description = "Formula 1 standings, results and race weekends";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Pitwall",
  description,
  // The image itself comes from app/opengraph-image.png.
  openGraph: { siteName: "Pitwall", title: "Pitwall", description, type: "website" },
  twitter: { card: "summary_large_image", title: "Pitwall", description },
};

export const viewport: Viewport = {
  // Lets the bottom tab bar sit under the iPhone home indicator (padded by safe-area insets).
  viewportFit: "cover",
  themeColor: "#070d1e",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/*
          Below lg the page scrolls as a normal document, with a top bar and a
          bottom tab bar. From lg up it's a fixed-height app shell with a
          sidebar, and each page scrolls inside its own panel.
        */}
        <div className="dither-bg flex min-h-dvh flex-col pb-[calc(4.25rem+env(safe-area-inset-bottom))] font-sans text-navy-100 lg:h-screen lg:min-h-0 lg:flex-row lg:overflow-hidden lg:pb-0">
          <Sidebar />
          <MobileHeader />
          {children}
          <MobileNav />
        </div>
      </body>
    </html>
  );
}
