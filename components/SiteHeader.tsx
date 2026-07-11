"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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

export function SiteHeader() {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  return (
    <header className="topbar">
      <div className="container topbar-inner">
        <Link href="/" className="brand" aria-label="Diyesu Decor home">
          <LeafMark />
          <span className="brand-name">Diyesu Decor</span>
          {isLanding ? <span className="brand-home-divider" aria-hidden="true" /> : null}
          {isLanding ? <span className="brand-tagline brand-tagline-landing">Budget DIY Bathroom Upgrades</span> : null}
        </Link>
        <nav className="main-nav" aria-label="Primary">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={`nav-link${pathname.startsWith(item.href) ? " is-active" : ""}`}>
              {item.label}
            </Link>
          ))}
          <Link href="/plant-picker" className={`nav-link nav-cta${pathname.startsWith("/plant-picker") ? " is-active" : ""}`}>
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
              <Link key={item.href} href={item.href} className={`nav-link${pathname.startsWith(item.href) ? " is-active" : ""}`}>
                {item.label}
              </Link>
            ))}
            <Link href="/plant-picker" className={`nav-link nav-cta${pathname.startsWith("/plant-picker") ? " is-active" : ""}`}>
              <LeafMark small />
              Free Plant Picker
            </Link>
          </div>
        </details>
      </div>
    </header>
  );
}
