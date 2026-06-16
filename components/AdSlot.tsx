export function AdSlot({ enabled, slotId }: { enabled: boolean; slotId: string }) {
  if (!enabled) return null;
  return (
    <aside className="ad-slot" data-ad-slot={slotId} aria-label="Advertising placement">
      <span>Ad placement</span>
      <p>{slotId} will activate when paid placements are enabled.</p>
    </aside>
  );
}
