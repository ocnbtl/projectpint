"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface AdminNavLinkProps {
  href: string;
  label: string;
}

export function AdminNavLink({ href, label }: AdminNavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href} className={`admin-nav-link${isActive ? " is-active" : ""}`} aria-current={isActive ? "page" : undefined}>
      {label}
    </Link>
  );
}
