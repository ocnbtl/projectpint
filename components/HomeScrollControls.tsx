"use client";

import { useEffect, useState } from "react";

type HomeScrollControlsProps = {
  targetId: string;
  label: string;
};

function scrollTarget(targetId: string, direction: "left" | "right") {
  const element = document.getElementById(targetId);
  if (!element) return;
  const amount = Math.min(380, element.clientWidth * 0.82);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  element.scrollBy({ left: direction === "left" ? -amount : amount, behavior: reduceMotion ? "auto" : "smooth" });
}

export function HomeScrollControls({ targetId, label }: HomeScrollControlsProps) {
  const [canScroll, setCanScroll] = useState(false);

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;

    const updateScrollability = () => {
      setCanScroll(target.scrollWidth > target.clientWidth + 1);
    };

    updateScrollability();
    const observer = new ResizeObserver(updateScrollability);
    observer.observe(target);
    return () => observer.disconnect();
  }, [targetId]);

  if (!canScroll) return null;

  return (
    <span className="home-scroll-controls" aria-label={label}>
      <button type="button" onClick={() => scrollTarget(targetId, "left")} aria-label="Scroll left">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m15 6-6 6 6 6" />
        </svg>
      </button>
      <button type="button" onClick={() => scrollTarget(targetId, "right")} aria-label="Scroll right">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m9 6 6 6-6 6" />
        </svg>
      </button>
    </span>
  );
}
