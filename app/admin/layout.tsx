import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: {
    default: "Command Center",
    template: "%s | Diyesu Decor Command Center"
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      noarchive: true,
      noimageindex: true,
      nosnippet: true
    }
  }
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}
