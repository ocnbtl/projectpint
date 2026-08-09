"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode
} from "react";
import { BrandMark } from "../BrandMarks";
import { AdminNavLink } from "./AdminNavLink";

const NAV_ITEMS = [
  { href: "/admin", label: "Home", icon: "dashboard" },
  { href: "/admin/pins", label: "Pins", icon: "pin" },
  { href: "/admin/blogs", label: "Blogs", icon: "file" },
  { href: "/admin/guides", label: "Guides", icon: "book" },
  { href: "/admin/inspiration", label: "Inspiration", icon: "image" },
  { href: "/admin/emails", label: "Emails", icon: "mail" },
  { href: "/admin/users", label: "Users", icon: "users" },
  { href: "/admin/products", label: "Products", icon: "package" },
  { href: "/admin/affiliate-links", label: "Affiliate Catalog", icon: "link" },
  { href: "/admin/media-review", label: "Media Review", icon: "review" },
  { href: "/admin/analytics", label: "Analytics", icon: "chart" }
];

function BrandLockup({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link href="/admin" className="admin-brand" onClick={onNavigate}>
      <BrandMark contrast />
      <span>
        <strong>Diyesu Decor</strong>
        <span className="admin-brand-sub">Command Center</span>
      </span>
    </Link>
  );
}

function SidebarContents({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <BrandLockup onNavigate={onNavigate} />
      <nav
        className="admin-nav"
        aria-label="Admin navigation"
        onClick={(event) => {
          if (event.target instanceof Element && event.target.closest("a")) onNavigate?.();
        }}
      >
        {NAV_ITEMS.map((item) => (
          <AdminNavLink key={item.href} href={item.href} label={item.label} icon={item.icon} />
        ))}
      </nav>
      <div className="admin-sidebar-foot">
        <div className="admin-sidebar-actions">
          <Link href="/" className="btn btn-ghost" target="_blank" rel="noreferrer" onClick={onNavigate}>
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
    </>
  );
}

function focusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ).filter((element) => !element.hasAttribute("hidden"));
}

export function AdminFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeAtDesktop = () => {
      if (desktop.matches) setDrawerOpen(false);
    };
    closeAtDesktop();
    desktop.addEventListener("change", closeAtDesktop);
    return () => desktop.removeEventListener("change", closeAtDesktop);
  }, []);

  useEffect(() => {
    if (!drawerOpen) return undefined;

    document.body.classList.add("admin-drawer-open");
    const firstFocusable = drawerRef.current ? focusableElements(drawerRef.current)[0] : null;
    firstFocusable?.focus();

    return () => {
      document.body.classList.remove("admin-drawer-open");
    };
  }, [drawerOpen]);

  function closeDrawer() {
    const focusTarget = menuButtonRef.current;
    setDrawerOpen(false);
    window.setTimeout(() => focusTarget?.focus(), 0);
  }

  function handleDrawerKeyDown(event: ReactKeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeDrawer();
      return;
    }

    if (event.key !== "Tab" || !drawerRef.current) return;
    const focusable = focusableElements(drawerRef.current);
    if (focusable.length === 0) {
      event.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar admin-sidebar-desktop" aria-label="Command Center">
        <SidebarContents />
      </aside>

      <header className="admin-mobile-topbar">
        <button
          ref={menuButtonRef}
          type="button"
          className="admin-mobile-menu-button"
          aria-label="Open admin navigation"
          aria-controls="admin-mobile-navigation"
          aria-expanded={drawerOpen}
          onClick={() => setDrawerOpen(true)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
        <span>Command Center</span>
      </header>

      {drawerOpen ? (
        <>
          <button
            type="button"
            className="admin-sidebar-backdrop"
            aria-label="Close admin navigation"
            onClick={closeDrawer}
          />
          <aside
            ref={drawerRef}
            id="admin-mobile-navigation"
            className="admin-sidebar admin-sidebar-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Admin navigation"
            onKeyDown={handleDrawerKeyDown}
          >
            <button
              type="button"
              className="admin-drawer-close"
              aria-label="Close admin navigation"
              onClick={closeDrawer}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m6 6 12 12M18 6 6 18" />
              </svg>
            </button>
            <SidebarContents onNavigate={closeDrawer} />
          </aside>
        </>
      ) : null}

      <main className="admin-main">{children}</main>
    </div>
  );
}
