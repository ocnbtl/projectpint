import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { redesignImages } from "../lib/redesign-data";
import { jsonLd, resolveSiteOrigin, SITE_DESCRIPTION, SITE_NAME } from "../lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(resolveSiteOrigin()),
  title: {
    default: `${SITE_NAME} | DIY Bathroom Upgrades`,
    template: `%s | ${SITE_NAME}`
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  openGraph: {
    title: `${SITE_NAME} | DIY Bathroom Upgrades`,
    description: SITE_DESCRIPTION,
    url: "/",
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
    images: [{ url: redesignImages.hero, alt: "Warm, attainable bathroom inspiration" }]
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | DIY Bathroom Upgrades`,
    description: SITE_DESCRIPTION,
    images: [redesignImages.hero]
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: resolveSiteOrigin(),
    description: SITE_DESCRIPTION
  };

  return (
    <html lang="en">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(websiteJsonLd) }} />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
