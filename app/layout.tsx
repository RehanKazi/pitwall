import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Sidebar from "./components/Sidebar";
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <div className="dither-bg flex h-screen overflow-hidden font-sans text-navy-100">
          <Sidebar />
          {children}
        </div>
      </body>
    </html>
  );
}
