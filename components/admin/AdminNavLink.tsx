"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface AdminNavLinkProps {
  href: string;
  label: string;
  icon?: string;
}

function AdminNavIcon({ name }: { name: string }) {
  switch (name) {
    case "dashboard":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 5h7v6H4zM13 5h7v4h-7zM13 11h7v8h-7zM4 13h7v6H4z" />
        </svg>
      );
    case "pin":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M14 4 20 10l-3.2 1.4-3.7 7.6-2.1-2.1 2.4-5.8-5.8 2.4L5.5 11.4l7.6-3.7L14 4Z" />
        </svg>
      );
    case "file":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 4h8l4 4v12H6z" />
          <path d="M14 4v4h4M9 12h6M9 16h6" />
        </svg>
      );
    case "book":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H20v16H7.5A2.5 2.5 0 0 0 5 21.5v-16Z" />
          <path d="M5 5.5A2.5 2.5 0 0 1 7.5 8H20" />
        </svg>
      );
    case "image":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="4" y="5" width="16" height="14" rx="2" />
          <circle cx="9" cy="10" r="1.5" />
          <path d="m6 17 4.5-4 3 2.5 2-2 2.5 3.5" />
        </svg>
      );
    case "mail":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 6h16v12H4z" />
          <path d="m4 7 8 6 8-6" />
        </svg>
      );
    case "users":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="9" cy="8" r="3" />
          <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
          <path d="M16 6.5a2.5 2.5 0 0 1 0 5M16.5 14a4.5 4.5 0 0 1 4 5" />
        </svg>
      );
    case "package":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 8.5 12 5l7 3.5v7L12 19l-7-3.5v-7Z" />
          <path d="m5.5 8.8 6.5 3.3 6.5-3.3M12 12.1V19" />
        </svg>
      );
    case "chart":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 19V5" />
          <path d="M4 19h16" />
          <path d="M8 16v-5M12 16V8M16 16v-7" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="7" />
        </svg>
      );
  }
}

export function AdminNavLink({ href, label, icon }: AdminNavLinkProps) {
  const pathname = usePathname();
  const isUsersAlias = href === "/admin/users" && pathname.startsWith("/admin/customers");
  const isActive = href === "/admin"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`) || isUsersAlias;

  return (
    <Link href={href} className={`admin-nav-link${isActive ? " is-active" : ""}`} aria-current={isActive ? "page" : undefined}>
      {icon ? <span className="admin-nav-icon" aria-hidden="true"><AdminNavIcon name={icon} /></span> : null}
      {label}
      {isActive ? (
        <span className="admin-nav-chevron" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </span>
      ) : null}
    </Link>
  );
}
