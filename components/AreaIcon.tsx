import type { ReactNode } from "react";

function IconSvg({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {children}
    </svg>
  );
}

export function AreaIcon({ name }: { name: string }) {
  switch (name) {
    case "leaf":
      return (
        <IconSvg>
          <path d="M5 19c7.5-.2 12.1-4 13.7-11.4l.4-2-2 .2C9.7 6.4 5.8 10.6 5 19Z" />
          <path d="M6.4 17.6c2.9-3.9 6.3-6.4 10.2-7.5" />
        </IconSvg>
      );
    case "circle":
      return (
        <IconSvg>
          <circle cx="12" cy="12" r="7" />
        </IconSvg>
      );
    case "box":
      return (
        <IconSvg>
          <path d="M5 8.5 12 5l7 3.5v7L12 19l-7-3.5v-7Z" />
          <path d="m5.5 8.8 6.5 3.3 6.5-3.3" />
          <path d="M12 12.1V19" />
        </IconSvg>
      );
    case "sun":
      return (
        <IconSvg>
          <circle cx="12" cy="12" r="3.8" />
          <path d="M12 3.5v2.1M12 18.4v2.1M3.5 12h2.1M18.4 12h2.1M6 6l1.5 1.5M16.5 16.5 18 18M18 6l-1.5 1.5M7.5 16.5 6 18" />
        </IconSvg>
      );
    case "drop":
      return (
        <IconSvg>
          <path d="M12 3.8c3.6 4.1 5.4 7.2 5.4 9.4a5.4 5.4 0 0 1-10.8 0c0-2.2 1.8-5.3 5.4-9.4Z" />
        </IconSvg>
      );
    case "home":
      return (
        <IconSvg>
          <path d="M4.5 11.2 12 5l7.5 6.2" />
          <path d="M6.5 10.2V19h11v-8.8" />
          <path d="M10 19v-5h4v5" />
        </IconSvg>
      );
    case "tool":
      return (
        <IconSvg>
          <path d="M14.5 5.3a4.4 4.4 0 0 0 4.2 5.9l-8.4 8.4a2.4 2.4 0 0 1-3.4-3.4l8.4-8.4a4.4 4.4 0 0 0-.8-2.5Z" />
        </IconSvg>
      );
    case "dollar":
      return (
        <IconSvg>
          <path d="M12 4v16" />
          <path d="M16.2 7.2c-.9-.8-2.2-1.2-3.8-1.2-2.2 0-3.7 1-3.7 2.6 0 4 7.6 1.9 7.6 6.1 0 1.8-1.7 3-4.1 3-1.9 0-3.4-.5-4.5-1.6" />
        </IconSvg>
      );
    default:
      return (
        <IconSvg>
          <circle cx="12" cy="12" r="7" />
        </IconSvg>
      );
  }
}
