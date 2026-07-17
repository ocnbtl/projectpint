import Link from "next/link";
import type { ReactNode } from "react";
import { BrandMark } from "./BrandMarks";
import { CookieNotice } from "./CookieNotice";
import { RevealController } from "./RevealController";
import { SiteHeader } from "./SiteHeader";

const footerTickerItems = [
  { icon: "🪴", label: "Plants" },
  { icon: "✨", label: "Mirrors" },
  { icon: "🚿", label: "Showers" },
  { icon: "💡", label: "Lighting" },
  { icon: "📦", label: "Storage" },
  { icon: "🔧", label: "DIY" },
  { icon: "🏠", label: "Renter" },
  { icon: "💰", label: "Budget" }
];

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="site-shell">
      <SiteHeader />
      <RevealController />
      <noscript>
        <style>{`[data-reveal] { opacity: 1 !important; transform: none !important; }`}</style>
      </noscript>
      <main className="site-main">{children}</main>
      <footer className="site-footer">
        <div className="container footer-grid">
          <div className="footer-brand-block">
            <Link href="/" className="brand brand-footer" aria-label="Diyesu Decor home">
              <BrandMark small contrast />
              <span className="brand-name">Diyesu Decor</span>
            </Link>
            <p>
              <span>Personalized bathroom improvements with</span>
              <span>less guesswork and more savings.</span>
            </p>
            <div className="footer-ticker" aria-hidden="true">
              <div className="footer-ticker-track">
                {[0, 1].map((setIndex) => (
                  <div key={setIndex} className="footer-ticker-group">
                    {footerTickerItems.map((item, itemIndex) => (
                      <span key={`${setIndex}-${item.label}`} className={itemIndex % 2 === 0 ? "is-bright" : undefined}>
                        {item.icon} {item.label}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="footer-nav-groups">
            <div>
              <h2>Explore</h2>
              <p className="footer-links footer-links-column">
                <Link href="/start-here">Start Here</Link>
                <Link href="/areas">Areas</Link>
                <Link href="/inspiration">Inspiration</Link>
                <Link href="/blog">Blog</Link>
                <Link href="/blueprint">Blueprint</Link>
              </p>
            </div>
            <div>
              <h2>Tools</h2>
              <p className="footer-links footer-links-column">
                <Link href="/plant-picker">Plant Picker</Link>
                <Link href="/blueprint">Upgrade Blueprint</Link>
                <Link href="/about">About &amp; FAQ</Link>
              </p>
            </div>
            <div>
              <h2>Legal</h2>
              <p className="footer-links footer-links-column">
                <Link href="/legal/privacy">Privacy</Link>
                <Link href="/legal/terms">Terms</Link>
                <Link href="/legal/affiliate-disclosure">Affiliate Disclosure</Link>
                <Link href="/admin/login">Admin</Link>
              </p>
            </div>
          </div>
        </div>
        <div className="container footer-bottom">
          <p>&copy; 2026 Diyesu Decor. All rights reserved.</p>
          <p>Made with care for bathrooms everywhere.</p>
          <CookieNotice />
        </div>
      </footer>
    </div>
  );
}
