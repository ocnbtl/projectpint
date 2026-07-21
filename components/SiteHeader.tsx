"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { BrandMark, PlantLeafIcon } from "./BrandMarks";

const navItems = [
  { href: "/start-here", label: "Start Here" },
  { href: "/areas", label: "Areas" },
  { href: "/inspiration", label: "Inspiration" },
  { href: "/blog", label: "Blog" },
  { href: "/blueprint", label: "Blueprint" },
  { href: "/about", label: "About" }
];

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
  const landingTaglineRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const root = document.documentElement;
    const nextState = String(isLanding);
    const previousState = root.dataset.diyesuHeaderHome;
    root.dataset.diyesuHeaderHome = nextState;

    if (
      previousState === undefined ||
      previousState === nextState ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !landingTaglineRef.current
    ) {
      return;
    }

    const previousWasLanding = previousState === "true";
    const animation = landingTaglineRef.current.animate(
      [
        {
          maxWidth: previousWasLanding ? "17rem" : "0rem",
          opacity: previousWasLanding ? 1 : 0,
          transform: previousWasLanding ? "translateX(0)" : "translateX(-0.5rem)"
        },
        {
          maxWidth: isLanding ? "17rem" : "0rem",
          opacity: isLanding ? 1 : 0,
          transform: isLanding ? "translateX(0)" : "translateX(-0.5rem)"
        }
      ],
      {
        duration: 350,
        easing: "cubic-bezier(0.25, 0.1, 0.25, 1)"
      }
    );

    return () => animation.cancel();
  }, [isLanding]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="topbar">
      <div className="container topbar-inner">
        <Link href="/" className="brand" aria-label="Diyesu Decor home">
          <BrandMark />
          <span className="brand-name">Diyesu Decor</span>
          <span
            ref={landingTaglineRef}
            className={`brand-home-reveal ${isLanding ? "is-visible" : "is-collapsed"}`}
            aria-hidden={!isLanding}
          >
            <span className="brand-home-divider" aria-hidden="true" />
            <span className="brand-tagline brand-tagline-landing">Budget DIY Bathroom Upgrades</span>
          </span>
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
          <PlantLeafIcon className="nav-plant-leaf" />
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
              <PlantLeafIcon className="nav-plant-leaf" />
              Free Plant Picker
            </Link>
          </div>
        </details>
      </div>
    </header>
  );
}
