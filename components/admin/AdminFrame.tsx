import Link from "next/link";
import type { ReactNode } from "react";
import { AdminNavLink } from "./AdminNavLink";

const NAV_ITEMS = [
  { href: "/admin", label: "Home", icon: "dashboard" },
  { href: "/admin/pins", label: "Pins", icon: "pin" },
  { href: "/admin/blogs", label: "Blogs", icon: "file" },
  { href: "/admin/guides", label: "Guides", icon: "book" },
  { href: "/admin/emails", label: "Emails", icon: "mail" },
  { href: "/admin/customers", label: "Users", icon: "users" },
  { href: "/admin/products", label: "Products", icon: "package" },
  { href: "/admin/analytics", label: "Analytics", icon: "chart" }
];

export function AdminFrame({ children }: { children: ReactNode }) {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link href="/admin" className="admin-brand">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" role="img">
              <path d="M19.2 4.8c-6.8.4-11.5 3.1-14 8.2 2.2-.9 4.4-.9 6.7-.1-2.9 1.1-5.1 3-6.5 5.8 5.9-.2 10.3-2.1 13.1-5.8 1.5-2 1.7-4.7.7-8.1Z" />
              <path d="M5.5 18.2c2.8-4.4 6.2-7.2 10.1-8.5" />
            </svg>
          </span>
          <span>
            <strong>Diyesu Decor</strong>
            <span className="admin-brand-sub">Command Center</span>
          </span>
        </Link>
        <nav className="admin-nav" aria-label="Admin navigation">
          {NAV_ITEMS.map((item) => (
            <AdminNavLink key={item.href} href={item.href} label={item.label} icon={item.icon} />
          ))}
        </nav>
        <div className="admin-sidebar-foot">
          <p className="admin-sidebar-note">
            Human approval stays required before any publish or Pinterest export.
          </p>
          <div className="admin-sidebar-actions">
            <Link href="/" className="btn btn-ghost">
              <span className="admin-action-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M15 3h6v6" />
                  <path d="M10 14 21 3" />
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                </svg>
              </span>
              Open public site
            </Link>
            <form action="/api/admin/logout" method="post">
              <button type="submit" className="btn btn-accent admin-logout-btn">
                <span className="admin-action-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <path d="M16 17l5-5-5-5" />
                    <path d="M21 12H9" />
                  </svg>
                </span>
                Log out
              </button>
            </form>
          </div>
        </div>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
