"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface AdminNavLinkProps {
  href: string;
  label: string;
  icon?: string;
}

export function AdminNavLink({ href, label, icon }: AdminNavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href} className={`admin-nav-link${isActive ? " is-active" : ""}`} aria-current={isActive ? "page" : undefined}>
      {icon ? <span className="admin-nav-icon" aria-hidden="true">{icon}</span> : null}
      {label}
    </Link>
  );
}
