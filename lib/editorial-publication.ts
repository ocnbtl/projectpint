export type EditorialTab = "blogs" | "guides";
export type EditorialCollection = EditorialTab | "inspiration";

const SNAPSHOT_PREFIX = "__PUBLISHED__";

function idColumn(tab: EditorialCollection): "Blog_ID" | "Guide_ID" | "Inspiration_ID" {
  if (tab === "blogs") return "Blog_ID";
  if (tab === "guides") return "Guide_ID";
  return "Inspiration_ID";
}

function statusOf(row: Record<string, unknown>): string {
  return String(row.Workflow_Status ?? "").trim().toLowerCase();
}

export function publishedSnapshotId(sourceId: string): string {
  return `${SNAPSHOT_PREFIX}${sourceId}`;
}

export function isPublishedSnapshot(tab: EditorialCollection, row: Record<string, unknown>): boolean {
  return String(row[idColumn(tab)] ?? "").startsWith(SNAPSHOT_PREFIX);
}

export function publishedSnapshotSourceId(tab: EditorialCollection, row: Record<string, unknown>): string {
  const value = String(row[idColumn(tab)] ?? "");
  return value.startsWith(SNAPSHOT_PREFIX) ? value.slice(SNAPSHOT_PREFIX.length) : value;
}

export function editableEditorialRows<T extends Record<string, unknown>>(tab: EditorialCollection, rows: T[]): T[] {
  return rows.filter((row) => !isPublishedSnapshot(tab, row));
}

export function publicEditorialRows<T extends Record<string, unknown>>(tab: EditorialCollection, rows: T[]): T[] {
  const key = idColumn(tab);
  const editable = editableEditorialRows(tab, rows);
  const snapshots = new Map(
    rows
      .filter((row) => isPublishedSnapshot(tab, row))
      .map((row) => [publishedSnapshotSourceId(tab, row), row] as const)
  );

  return editable.flatMap((row) => {
    const sourceId = String(row[key] ?? "");
    const snapshot = snapshots.get(sourceId);
    if (snapshot) {
      return [{ ...snapshot, [key]: sourceId, Workflow_Status: "published" } as T];
    }
    return statusOf(row) === "published" ? [row] : [];
  });
}

export function mergeEditorialAdminSave<T extends Record<string, unknown>>(
  tab: EditorialCollection,
  existingRows: T[],
  incomingRows: T[]
): T[] {
  const key = idColumn(tab);
  const incomingIds = new Set(incomingRows.map((row) => String(row[key] ?? "")).filter(Boolean));
  const snapshots = new Map<string, T>();

  for (const row of existingRows) {
    if (!isPublishedSnapshot(tab, row)) continue;
    const sourceId = publishedSnapshotSourceId(tab, row);
    if (incomingIds.has(sourceId)) snapshots.set(sourceId, row);
  }

  for (const row of editableEditorialRows(tab, existingRows)) {
    const sourceId = String(row[key] ?? "");
    if (!sourceId || !incomingIds.has(sourceId) || snapshots.has(sourceId) || statusOf(row) !== "published") continue;
    snapshots.set(sourceId, {
      ...row,
      [key]: publishedSnapshotId(sourceId),
      Workflow_Status: "published"
    } as T);
  }

  return [...incomingRows.filter((row) => !isPublishedSnapshot(tab, row)), ...snapshots.values()];
}

export function publishEditorialSnapshots<T extends Record<string, unknown>>(
  tab: EditorialCollection,
  rows: T[],
  sourceIds: Iterable<string>,
  publishedAt: string
): T[] {
  const key = idColumn(tab);
  const publishIds = new Set(sourceIds);
  const editable = editableEditorialRows(tab, rows).map((row) => {
    const sourceId = String(row[key] ?? "");
    if (!publishIds.has(sourceId)) return row;
    return { ...row, Workflow_Status: "published", Published_To_Public_At: publishedAt } as T;
  });
  const existingSnapshots = rows.filter((row) => isPublishedSnapshot(tab, row) && !publishIds.has(publishedSnapshotSourceId(tab, row)));
  const nextSnapshots = editable
    .filter((row) => publishIds.has(String(row[key] ?? "")))
    .map((row) => {
      const sourceId = String(row[key] ?? "");
      return {
        ...row,
        [key]: publishedSnapshotId(sourceId),
        Workflow_Status: "published",
        Published_To_Public_At: publishedAt
      } as T;
    });

  return [...editable, ...existingSnapshots, ...nextSnapshots];
}

export function unpublishEditorialSnapshot<T extends Record<string, unknown>>(
  tab: EditorialCollection,
  rows: T[],
  sourceId: string
): T[] {
  const key = idColumn(tab);
  return rows.flatMap((row) => {
    if (isPublishedSnapshot(tab, row)) {
      return publishedSnapshotSourceId(tab, row) === sourceId ? [] : [row];
    }
    if (String(row[key] ?? "") !== sourceId) return [row];
    return [{ ...row, Workflow_Status: "draft", Published_To_Public_At: "" } as T];
  });
}

export function restoreEditorialSnapshot<T extends Record<string, unknown>>(
  tab: EditorialCollection,
  rows: T[],
  sourceId: string
): T[] {
  const key = idColumn(tab);
  const snapshot = rows.find((row) => isPublishedSnapshot(tab, row) && publishedSnapshotSourceId(tab, row) === sourceId);
  if (!snapshot) return rows;

  return rows.map((row) => {
    if (isPublishedSnapshot(tab, row) || String(row[key] ?? "") !== sourceId) return row;
    return { ...snapshot, [key]: sourceId } as T;
  });
}
