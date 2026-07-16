"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function RevealController() {
  const pathname = usePathname();

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (elements.length === 0) return;

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const revealImmediately = (element: HTMLElement) => {
      element.style.transitionDelay = "";
      element.classList.add("is-revealed");
    };
    const revealAll = () => elements.forEach(revealImmediately);

    if (motionPreference.matches || !("IntersectionObserver" in window)) {
      revealAll();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const element = entry.target as HTMLElement;
          const clearDelay = () => {
            element.style.transitionDelay = "";
          };
          element.addEventListener("transitionend", clearDelay, { once: true });
          element.classList.add("is-revealed");
          observer.unobserve(element);
        });
      },
      { rootMargin: "0px 0px -8%", threshold: 0.08 }
    );

    elements.forEach((element) => observer.observe(element));

    const handlePreferenceChange = (event: MediaQueryListEvent) => {
      if (!event.matches) return;
      revealAll();
      observer.disconnect();
    };

    motionPreference.addEventListener("change", handlePreferenceChange);
    return () => {
      observer.disconnect();
      motionPreference.removeEventListener("change", handlePreferenceChange);
    };
  }, [pathname]);

  return null;
}
