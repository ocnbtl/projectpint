export function parseKeywordTags(value: string): string[] {
  const seen = new Set<string>();
  const parts = value
    .split(/[,\n;|\t]/g)
    .map((item) => item.trim())
    .filter(Boolean);

  const tags: string[] = [];
  for (const part of parts) {
    const key = part.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    tags.push(part);
  }

  return tags;
}

export function mergeTags(...groups: string[][]): string[] {
  const seen = new Set<string>();
  const merged: string[] = [];

  for (const group of groups) {
    for (const tag of group) {
      const cleaned = tag.trim();
      if (!cleaned) continue;
      const key = cleaned.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(cleaned);
    }
  }

  return merged;
}

export function tagSlug(tag: string): string {
  return tag
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s]/g, " ")
    .trim()
    .replace(/\s+/g, "-");
}

export function tagPath(tag: string): string {
  return `/tags/${tagSlug(tag)}`;
}
