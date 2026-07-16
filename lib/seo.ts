import type { Metadata } from "next";
import { redesignImages } from "./redesign-data.ts";

export const SITE_NAME = "Diyesu Decor";
export const SITE_DESCRIPTION = "Renter-friendly bathroom DIY systems for budget-first households.";
export const PRODUCTION_SITE_ORIGIN = "https://projectpint.vercel.app";
const VERIFIED_SITE_ORIGINS = new Set([PRODUCTION_SITE_ORIGIN]);

export function resolveSiteOrigin(configured = process.env.NEXT_PUBLIC_SITE_URL): string {
  const candidate = configured?.trim();
  if (!candidate) return PRODUCTION_SITE_ORIGIN;

  try {
    const url = new URL(candidate);
    if (url.protocol !== "https:") return PRODUCTION_SITE_ORIGIN;
    if (url.hostname === "localhost" || url.hostname === "127.0.0.1" || url.hostname.endsWith(".example.com")) {
      return PRODUCTION_SITE_ORIGIN;
    }
    // Canonicals must never point at an intended custom domain before its
    // Vercel attachment, public DNS, and TLS have been verified.
    return VERIFIED_SITE_ORIGINS.has(url.origin) ? url.origin : PRODUCTION_SITE_ORIGIN;
  } catch {
    return PRODUCTION_SITE_ORIGIN;
  }
}

export function absoluteUrl(pathname: string): string {
  return new URL(pathname, `${resolveSiteOrigin()}/`).toString();
}

interface PageMetadataOptions {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  indexable?: boolean;
}

export function pageMetadata({
  title,
  description,
  path,
  image,
  type = "website",
  publishedTime,
  indexable = true
}: PageMetadataOptions): Metadata {
  const canonical = absoluteUrl(path);
  const socialTitle = `${title} | ${SITE_NAME}`;
  const socialImage = image || redesignImages.hero;
  const images = [{ url: socialImage, alt: title }];
  const openGraph: Metadata["openGraph"] = {
    title: socialTitle,
    description,
    url: canonical,
    siteName: SITE_NAME,
    locale: "en_US",
    type,
    images
  };

  if (type === "article" && publishedTime && openGraph) {
    Object.assign(openGraph, { publishedTime });
  }

  return {
    title,
    description,
    robots: indexable ? undefined : { index: false, follow: false },
    alternates: { canonical },
    openGraph,
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [socialImage]
    }
  };
}

export function jsonLd(value: Record<string, unknown>): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function articleJsonLd({
  title,
  description,
  path,
  image,
  publishedTime,
  authorName
}: Omit<PageMetadataOptions, "type" | "indexable"> & { authorName?: string }): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    mainEntityOfPage: absoluteUrl(path),
    ...(image ? { image } : {}),
    ...(publishedTime ? { datePublished: publishedTime } : {}),
    ...(authorName ? { author: { "@type": "Person", name: authorName } } : {}),
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: resolveSiteOrigin()
    }
  };
}
