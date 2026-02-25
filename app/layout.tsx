import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Ranosa Decor | DIY Bathroom Upgrades",
  description: "Renter-friendly bathroom DIY systems for budget-first households"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
