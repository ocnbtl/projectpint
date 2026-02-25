export function addHours(baseIso: string, hours: number): string {
  const dt = new Date(baseIso);
  dt.setHours(dt.getHours() + hours);
  return dt.toISOString();
}

export function hoursSince(lastIso: string, nowIso: string): number {
  if (!lastIso) return Number.POSITIVE_INFINITY;
  const last = new Date(lastIso).getTime();
  const now = new Date(nowIso).getTime();
  return (now - last) / (1000 * 60 * 60);
}

export function startOfWeekIso(referenceIso: string): string {
  const d = new Date(referenceIso);
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}
