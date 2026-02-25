import Link from "next/link";
import type { ReactNode } from "react";
import { CookieNotice } from "./CookieNotice";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div>
      <header className="container">
        <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/" style={{ fontWeight: 700 }}>Ranosa Decor</Link>
          <nav style={{ display: "flex", gap: 14 }}>
            <Link href="/start-here">Start Here</Link>
            <Link href="/hub/renter-friendly-upgrades">Hubs</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/lead-magnets/plant-picker">Plant Picker</Link>
            <Link href="/products/renter-bathroom-upgrade-blueprint">Blueprint</Link>
            <Link href="/about">About</Link>
            <Link href="/legal/affiliate-disclosure">Disclosure</Link>
          </nav>
        </div>
      </header>
      <main className="container">{children}</main>
      <div className="container">
        <CookieNotice />
      </div>
      <footer className="container">
        <div className="card small">
          <p>Ranosa Decor | DIY Bathroom Upgrades</p>
          <p>
            Disclosure: Some links may be affiliate links. We may earn a commission at no extra cost to you.
          </p>
          <p>
            <Link href="/about">About</Link> |{" "}
            <Link href="/legal/privacy">Privacy</Link> | <Link href="/legal/terms">Terms</Link> |{" "}
            <Link href="/legal/affiliate-disclosure">Affiliate Disclosure</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
