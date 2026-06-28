import Link from "next/link";
import type { ReactNode } from "react";
import { CookieNotice } from "./CookieNotice";

const navItems = [
  { href: "/start-here", label: "Start Here" },
  { href: "/areas", label: "Areas" },
  { href: "/inspiration", label: "Inspiration" },
  { href: "/blog", label: "Blog" },
  { href: "/blueprint", label: "Blueprint" },
  { href: "/about", label: "About" }
];

function LeafMark({ small = false }: { small?: boolean }) {
  return (
    <span className={`brand-mark${small ? " brand-mark-footer" : ""}`} aria-hidden="true">
      <svg viewBox="0 0 24 24" role="img">
        <path d="M19.2 4.8c-6.8.4-11.5 3.1-14 8.2 2.2-.9 4.4-.9 6.7-.1-2.9 1.1-5.1 3-6.5 5.8 5.9-.2 10.3-2.1 13.1-5.8 1.5-2 1.7-4.7.7-8.1Z" />
        <path d="M5.5 18.2c2.8-4.4 6.2-7.2 10.1-8.5" />
      </svg>
    </span>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="site-shell">
      <header className="topbar">
        <div className="container topbar-inner">
          <Link href="/" className="brand" aria-label="Diyesu Decor home">
            <LeafMark />
            <span>
              <span className="brand-name">Diyesu Decor</span>
              <span className="brand-tagline">Budget DIY Bathroom Upgrades</span>
            </span>
          </Link>
          <nav className="main-nav" aria-label="Primary">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="nav-link">
                {item.label}
              </Link>
            ))}
            <Link href="/plant-picker" className="nav-link nav-cta">
              <LeafMark small />
              Free Plant Picker
            </Link>
          </nav>
          <details className="mobile-nav">
            <summary aria-label="Open navigation">
              <MenuIcon />
            </summary>
            <div className="mobile-nav-panel">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className="nav-link">
                  {item.label}
                </Link>
              ))}
              <Link href="/plant-picker" className="nav-link nav-cta">
                <LeafMark small />
                Free Plant Picker
              </Link>
            </div>
          </details>
        </div>
      </header>
      <main className="site-main">{children}</main>
      <div className="container cookie-note">
        <CookieNotice />
      </div>
      <footer className="site-footer">
        <div className="container footer-grid">
          <div className="footer-brand-block">
            <Link href="/" className="brand brand-footer" aria-label="Diyesu Decor home">
              <LeafMark small />
              <span>
                <span className="brand-name">Diyesu Decor</span>
                <span className="brand-tagline">DIY Bathroom Upgrades</span>
              </span>
            </Link>
            <p>Practical bathroom upgrades for renters, small spaces, and tight budgets.</p>
            <div className="footer-ticker" aria-hidden="true">
              <span>Plants</span>
              <span>Mirrors</span>
              <span>Showers</span>
              <span>Storage</span>
            </div>
          </div>
          <div>
            <h2>Explore</h2>
            <p className="footer-links footer-links-column">
              <Link href="/start-here">Start Here</Link>
              <Link href="/areas">Areas</Link>
              <Link href="/inspiration">Inspiration</Link>
              <Link href="/blog">Blog</Link>
            </p>
          </div>
          <div>
            <h2>Tools</h2>
            <p className="footer-links footer-links-column">
              <Link href="/plant-picker">Plant Picker</Link>
              <Link href="/blueprint">Blueprint</Link>
              <Link href="/admin" prefetch={false}>
                Admin
              </Link>
            </p>
          </div>
          <div>
            <h2>Legal</h2>
            <p className="footer-links footer-links-column">
              <Link href="/legal/privacy">Privacy</Link>
              <Link href="/legal/terms">Terms</Link>
              <Link href="/legal/affiliate-disclosure">Affiliate Disclosure</Link>
            </p>
            <p className="small">Some links may be affiliate links. Diyesu Decor may earn a commission at no additional cost to you.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
