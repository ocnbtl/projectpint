"use client";

import { useMemo, useRef, useState } from "react";
import type { AffiliateProduct } from "../lib/affiliate-catalog";
import { SafeImage } from "./SafeImage";

interface AffiliateProductGalleryProps {
  product: AffiliateProduct;
  styles: Array<{ slug: string; name: string }>;
}

export function AffiliateProductGallery({ product, styles }: AffiliateProductGalleryProps) {
  const initialStyle = product.styleAssignments.find((assignment) => assignment.role === "primary")?.styleSlug
    ?? styles[0]?.slug
    ?? "";
  const [selectedStyle, setSelectedStyle] = useState(initialStyle);
  const [activeSlot, setActiveSlot] = useState(1);
  const swipeStartX = useRef<number | null>(null);

  const mediaSet = useMemo(
    () => product.mediaSets.find((set) => set.styleSlug === selectedStyle),
    [product.mediaSets, selectedStyle]
  );
  const assets = Array.from({ length: 5 }, (_, index) => {
    const slot = index + 1;
    return mediaSet?.assets.find((asset) => asset.slot === slot) ?? null;
  });
  const activeAsset = assets[activeSlot - 1];
  const activeStyleName = styles.find((style) => style.slug === selectedStyle)?.name ?? selectedStyle;

  function move(delta: number) {
    setActiveSlot((current) => ((current - 1 + delta + 5) % 5) + 1);
  }

  function finishSwipe(clientX: number) {
    if (swipeStartX.current === null) return;
    const delta = clientX - swipeStartX.current;
    swipeStartX.current = null;
    if (Math.abs(delta) < 40) return;
    move(delta < 0 ? 1 : -1);
  }

  return (
    <section className="affiliate-gallery" aria-label={`${product.name} gallery`}>
      <div
        className="affiliate-gallery-stage"
        onPointerDown={(event) => {
          swipeStartX.current = event.clientX;
        }}
        onPointerCancel={() => {
          swipeStartX.current = null;
        }}
        onPointerUp={(event) => finishSwipe(event.clientX)}
      >
        {activeAsset?.publicUrl ? (
          <SafeImage
            src={activeAsset.publicUrl}
            alt={activeAsset.alt || `${product.name} in a ${activeStyleName} bathroom`}
            width={1600}
            height={2000}
            priority
          />
        ) : (
          <div className="affiliate-gallery-placeholder" role="img" aria-label={`Planned ${activeStyleName} gallery image ${activeSlot} for ${product.name}`}>
            <span>Media awaiting approval</span>
            <strong>{activeStyleName}</strong>
            <em>View {activeSlot} of 5</em>
          </div>
        )}
        <button type="button" className="affiliate-gallery-arrow is-previous" onClick={() => move(-1)} aria-label="Previous image">
          ‹
        </button>
        <button type="button" className="affiliate-gallery-arrow is-next" onClick={() => move(1)} aria-label="Next image">
          ›
        </button>
      </div>

      <div className="affiliate-gallery-controls">
        <label>
          <span>Bathroom style</span>
          <select value={selectedStyle} onChange={(event) => {
            setSelectedStyle(event.target.value);
            setActiveSlot(1);
          }}>
            {styles.map((style) => (
              <option key={style.slug} value={style.slug}>{style.name}</option>
            ))}
          </select>
        </label>
        <div className="affiliate-gallery-thumbs" aria-label="Choose gallery image">
          {assets.map((asset, index) => {
            const slot = index + 1;
            return (
              <button
                key={`${selectedStyle}-${slot}`}
                type="button"
                className={slot === activeSlot ? "is-active" : undefined}
                onClick={() => setActiveSlot(slot)}
                aria-label={`Show image ${slot}`}
                aria-pressed={slot === activeSlot}
              >
                {asset?.publicUrl ? (
                  <SafeImage src={asset.publicUrl} alt="" width={120} height={150} />
                ) : (
                  <span>{slot}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
