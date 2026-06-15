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
          <span className="brand-mark" aria-hidden="true" />
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
              Open public site
            </Link>
            <form action="/api/admin/logout" method="post">
              <button type="submit" className="btn btn-accent admin-logout-btn">
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
