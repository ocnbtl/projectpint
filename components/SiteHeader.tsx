"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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

function MenuIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={isOpen ? "M6 6l12 12M18 6 6 18" : "M4 7h16M4 12h16M4 17h16"} />
    </svg>
  );
}

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="topbar">
      <div className="container topbar-inner">
        <Link href="/" className="brand" aria-label="Diyesu Decor home">
          <LeafMark />
          <span className="brand-name">Diyesu Decor</span>
          {isLanding ? (
            <span className="brand-home-reveal">
              <span className="brand-home-divider" aria-hidden="true" />
              <span className="brand-tagline brand-tagline-landing">Budget DIY Bathroom Upgrades</span>
            </span>
          ) : null}
        </Link>
        <nav className="main-nav" aria-label="Primary">
          {navItems.map((item) => {
            const isActive = isActivePath(pathname, item.href);

            return (
              <Link key={item.href} href={item.href} className={`nav-link${isActive ? " is-active" : ""}`} aria-current={isActive ? "page" : undefined}>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <Link
          href="/plant-picker"
          className={`nav-link nav-cta desktop-nav-cta${isActivePath(pathname, "/plant-picker") ? " is-active" : ""}`}
          aria-current={isActivePath(pathname, "/plant-picker") ? "page" : undefined}
        >
          <LeafMark small />
          Free Plant Picker
        </Link>
        <details className="mobile-nav" open={isMobileMenuOpen} onToggle={(event) => setIsMobileMenuOpen(event.currentTarget.open)}>
          <summary aria-label={isMobileMenuOpen ? "Close navigation" : "Open navigation"} aria-expanded={isMobileMenuOpen}>
            <MenuIcon isOpen={isMobileMenuOpen} />
          </summary>
          <div className="mobile-nav-panel">
            {navItems.map((item) => {
              const isActive = isActivePath(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-link${isActive ? " is-active" : ""}`}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/plant-picker"
              className={`nav-link nav-cta${isActivePath(pathname, "/plant-picker") ? " is-active" : ""}`}
              aria-current={isActivePath(pathname, "/plant-picker") ? "page" : undefined}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <LeafMark small />
              Free Plant Picker
            </Link>
          </div>
        </details>
      </div>
    </header>
  );
}
