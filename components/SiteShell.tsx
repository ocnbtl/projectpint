import Link from "next/link";
import type { ReactNode } from "react";
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
              <LeafMark small />
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
