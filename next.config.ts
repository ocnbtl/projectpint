import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/photo-*"
      }
    ]
  },
  outputFileTracingRoot: __dirname,
  outputFileTracingIncludes: {
    "/api/admin/review-pack": ["./review_pack.html"]
  },
  async redirects() {
    return [
      { source: "/hub", destination: "/areas", permanent: true },
      { source: "/hub/:slug", destination: "/areas/:slug", permanent: true },
      { source: "/lead-magnets/plant-picker", destination: "/plant-picker", permanent: true },
      { source: "/products/renter-bathroom-upgrade-blueprint", destination: "/blueprint", permanent: true },
      { source: "/privacy", destination: "/legal/privacy", permanent: true },
      { source: "/terms", destination: "/legal/terms", permanent: true },
      { source: "/affiliate", destination: "/legal/affiliate-disclosure", permanent: true }
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: "object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" }
        ]
      },
      {
        source: "/admin/:path*",
        headers: [{ key: "Cache-Control", value: "private, no-store" }]
      },
      {
        source: "/api/admin/:path*",
        headers: [{ key: "Cache-Control", value: "private, no-store" }]
      }
    ];
  },
  experimental: {
    webpackBuildWorker: false
  },
  turbopack: {
    root: __dirname
  }
};

export default nextConfig;
