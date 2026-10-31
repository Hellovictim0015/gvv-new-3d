import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getPageMetadata } from "@/lib/seo";
import { SITE_URL } from "@/lib/siteUrl";
import "./globals.css";

// ISR: pages are cached and regenerated in the background at most once a
// minute, instead of doing a full server render + DB round-trip on every
// request (force-dynamic). Admin edits (SEO fields, site images) still show
// up within ~60s — plenty fresh for a low-traffic school site — while static
// visitors get cached, fast responses.
export const revalidate = 60;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  // Only a few small labels use the mono font; don't make every page download
  // it up front. It still loads (swap) where it's actually used.
  preload: false,
});

export async function generateMetadata(): Promise<Metadata> {
  // metadataBase makes per-page canonical/OG URLs absolute on the live domain.
  return { metadataBase: new URL(SITE_URL), ...(await getPageMetadata("/")) };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      // globals.css sets `scroll-behavior: smooth`; this tells Next 16 to switch
      // it off during route changes so a new page opens at the top instantly
      // (otherwise the slow smooth scroll got cut short by GSAP's pin refresh and
      // pages like /robotics opened halfway down).
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
