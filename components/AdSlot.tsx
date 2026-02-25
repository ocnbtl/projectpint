export function AdSlot({ enabled, slotId }: { enabled: boolean; slotId: string }) {
  if (!enabled) return null;
  return (
    <div className="card small" data-ad-slot={slotId}>
      Ad placeholder ({slotId}) - enable AdSense or equivalent when traffic threshold is met.
    </div>
  );
}
