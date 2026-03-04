import Link from "next/link";
import type { ReactNode } from "react";

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
        <nav className="admin-nav" aria-label="Admin navigation">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className="admin-nav-link">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="admin-sidebar-foot">
          <p className="small">Use Save Changes after manual edits.</p>
          <Link href="/" className="btn btn-ghost">
            Open public site
          </Link>
        </div>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
