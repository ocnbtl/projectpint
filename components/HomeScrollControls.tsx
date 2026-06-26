"use client";

type HomeScrollControlsProps = {
  targetId: string;
  label: string;
};

function scrollTarget(targetId: string, direction: "left" | "right") {
  const element = document.getElementById(targetId);
  if (!element) return;
  const amount = Math.min(380, element.clientWidth * 0.82);
  element.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
}

export function HomeScrollControls({ targetId, label }: HomeScrollControlsProps) {
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
