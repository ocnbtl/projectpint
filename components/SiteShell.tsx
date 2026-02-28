import Link from "next/link";
import type { ReactNode } from "react";
import { CookieNotice } from "./CookieNotice";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="site-shell">
      <header className="topbar">
        <div className="container topbar-inner">
          <Link href="/" className="brand" aria-label="Diyesu Decor home">
            <span className="brand-mark" aria-hidden="true" />
            <span>
              <span className="brand-name">Diyesu Decor</span>
              <span className="brand-tagline">DIY Bathroom Upgrades</span>
            </span>
          </Link>
          <nav className="main-nav" aria-label="Primary">
            <Link href="/start-here" className="nav-link">
              Start Here
            </Link>
            <Link href="/hub" className="nav-link">
              Areas
            </Link>
            <Link href="/blog" className="nav-link">
              Blog
            </Link>
            <Link href="/products/renter-bathroom-upgrade-blueprint" className="nav-link">
              Blueprint
            </Link>
            <Link href="/lead-magnets/plant-picker" className="nav-link nav-cta">
              Free Plant Picker
            </Link>
          </nav>
        </div>
      </header>
      <main className="container">{children}</main>
      <div className="container cookie-note">
        <CookieNotice />
      </div>
      <footer className="container">
        <div className="card small footer-card">
          <div className="brand-footer">
            <span className="brand-mark brand-mark-footer" aria-hidden="true" />
            <p className="brand-footer-line">
              Diyesu Decor | DIY Bathroom Upgrades
            </p>
          </div>
          <p>
            Personalized and practical bathroom improvements for renters, DIY enthusiasts, and budget-first households.
          </p>
          <p>
            Disclosure: some links may be affiliate links. Diyesu Decor may earn a commission at no additional cost to
            you.
          </p>
          <p className="footer-links">
            <Link href="/about">About</Link> |{" "}
            <Link href="/legal/privacy">Privacy</Link> | <Link href="/legal/terms">Terms</Link> |{" "}
            <Link href="/legal/affiliate-disclosure">Affiliate Disclosure</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
