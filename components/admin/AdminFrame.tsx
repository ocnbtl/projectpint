import Link from "next/link";
import type { ReactNode } from "react";
import { AdminNavLink } from "./AdminNavLink";

const NAV_ITEMS = [
  { href: "/admin", label: "Home" },
  { href: "/admin/pins", label: "Pins" },
  { href: "/admin/blogs", label: "Blogs" },
  { href: "/admin/guides", label: "Guides" },
  { href: "/admin/emails", label: "Emails" },
  { href: "/admin/customers", label: "Users" },
  { href: "/admin/products", label: "Products" }
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
        <div className="admin-sidebar-note">
          <p className="small">Private workspace</p>
          <p>Assisted mode stays on. Human approval is still required before publish or export.</p>
        </div>
        <nav className="admin-nav" aria-label="Admin navigation">
          {NAV_ITEMS.map((item) => (
            <AdminNavLink key={item.href} href={item.href} label={item.label} />
          ))}
        </nav>
        <div className="admin-sidebar-foot">
          <div className="admin-sidebar-chip-row">
            <span className="admin-chip">Manual visuals</span>
            <span className="admin-chip">Evergreen ops</span>
          </div>
          <p className="small">Use Save Changes after manual edits. Publish and export remain intentional operator actions.</p>
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
