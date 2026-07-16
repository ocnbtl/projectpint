"use client";

import { useEffect, useState } from "react";

export function TypewriterEyebrow({ text }: { text: string }) {
  const [visibleText, setVisibleText] = useState("");

  useEffect(() => {
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionPreference.matches) {
      setVisibleText(text);
      return;
    }

    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setVisibleText(text.slice(0, index));
      if (index >= text.length) window.clearInterval(timer);
    }, 40);

    const handlePreferenceChange = (event: MediaQueryListEvent) => {
      if (!event.matches) return;
      window.clearInterval(timer);
      setVisibleText(text);
    };

    motionPreference.addEventListener("change", handlePreferenceChange);
    return () => {
      window.clearInterval(timer);
      motionPreference.removeEventListener("change", handlePreferenceChange);
    };
  }, [text]);

  return (
    <span className="typewriter-text">
      <span className="screen-reader-text">{text}</span>
      <span aria-hidden="true">{visibleText}</span>
      <span className="typewriter-cursor" aria-hidden="true" />
    </span>
  );
}
