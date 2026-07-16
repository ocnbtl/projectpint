"use client";

import { useEffect } from "react";

const DEFAULT_MESSAGE = "You have unsaved changes. Leave this page and discard them?";

interface NavigationEventLike extends Event {
  canIntercept: boolean;
  navigationType: string;
  intercept(options: { handler: () => Promise<void> }): void;
}

interface NavigationLike {
  addEventListener(type: "navigate", listener: EventListener): void;
  removeEventListener(type: "navigate", listener: EventListener): void;
}

/**
 * Protects hard exits, internal links, and browsers that expose traversal
 * interception through the Navigation API. The native confirmation keeps the
 * guard synchronous, including while an autosave request is still pending.
 */
export function useUnsavedChangesGuard(active: boolean, message = DEFAULT_MESSAGE) {
  useEffect(() => {
    if (!active) return undefined;

    const confirmExit = () => window.confirm(message);
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    const handleDocumentClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!target || target.target === "_blank" || target.hasAttribute("download")) return;

      const destination = new URL(target.href, window.location.href);
      const current = new URL(window.location.href);
      if (destination.origin !== current.origin) return;
      if (destination.pathname === current.pathname && destination.search === current.search && destination.hash) return;
      if (confirmExit()) return;

      event.preventDefault();
      event.stopImmediatePropagation();
    };
    const handleNavigate = (event: Event) => {
      const navigationEvent = event as NavigationEventLike;
      if (!navigationEvent.canIntercept || navigationEvent.navigationType !== "traverse") return;
      navigationEvent.intercept({
        handler: async () => {
          if (!confirmExit()) throw new DOMException("Navigation cancelled", "AbortError");
        }
      });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleDocumentClick, true);
    const navigation = (window as unknown as { navigation?: NavigationLike }).navigation;
    navigation?.addEventListener("navigate", handleNavigate);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleDocumentClick, true);
      navigation?.removeEventListener("navigate", handleNavigate);
    };
  }, [active, message]);
}
