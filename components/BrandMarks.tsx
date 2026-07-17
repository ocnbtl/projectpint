import Image from "next/image";

export function BrandMark({ small = false, contrast = false }: { small?: boolean; contrast?: boolean }) {
  return (
    <span
      className={`brand-mark${small ? " brand-mark-footer" : ""}${contrast ? " brand-mark-contrast" : ""}`}
      aria-hidden="true"
    >
      <Image
        src={contrast ? "/brand/diyesu-mark-white.svg" : "/brand/diyesu-mark.svg"}
        alt=""
        width={1500}
        height={1500}
        unoptimized
      />
    </span>
  );
}

export function PlantLeafIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 19c9.5 0 14-5.6 14-14-8.4 0-14 4.5-14 14Z" />
      <path d="M5 19c3-5 6.7-8 11-10" />
    </svg>
  );
}
