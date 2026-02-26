export type MarkdownBlock =
  | { type: "h1" | "h2" | "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] };

function clean(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .trim();
}

export function markdownBlocks(markdown: string): MarkdownBlock[] {
  const lines = markdown.replace(/\r/g, "").split("\n");
  const blocks: MarkdownBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    if (!line) {
      i += 1;
      continue;
    }

    if (line.startsWith("### ")) {
      blocks.push({ type: "h3", text: clean(line.slice(4)) });
      i += 1;
      continue;
    }

    if (line.startsWith("## ")) {
      blocks.push({ type: "h2", text: clean(line.slice(3)) });
      i += 1;
      continue;
    }

    if (line.startsWith("# ")) {
      blocks.push({ type: "h1", text: clean(line.slice(2)) });
      i += 1;
      continue;
    }

    if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("- ")) {
        items.push(clean(lines[i].trim().slice(2)));
        i += 1;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    if (/^\d+\)\s/.test(line) || /^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && (/^\d+\)\s/.test(lines[i].trim()) || /^\d+\.\s/.test(lines[i].trim()))) {
        items.push(clean(lines[i].trim().replace(/^\d+[\).]\s/, "")));
        i += 1;
      }
      blocks.push({ type: "ol", items });
      continue;
    }

    const paragraphLines: string[] = [line];
    i += 1;
    while (i < lines.length) {
      const lookahead = lines[i].trim();
      if (
        !lookahead ||
        lookahead.startsWith("# ") ||
        lookahead.startsWith("## ") ||
        lookahead.startsWith("### ") ||
        lookahead.startsWith("- ") ||
        /^\d+\)\s/.test(lookahead) ||
        /^\d+\.\s/.test(lookahead)
      ) {
        break;
      }
      paragraphLines.push(lookahead);
      i += 1;
    }

    blocks.push({ type: "p", text: clean(paragraphLines.join(" ")) });
  }

  return blocks;
}

export function excerptFromMarkdown(markdown: string, maxChars = 165): string {
  const blocks = markdownBlocks(markdown).filter((block) => block.type === "p") as Array<{ type: "p"; text: string }>;
  const first = blocks[0]?.text ?? "Practical, renter-aware bathroom upgrade guidance.";
  if (first.length <= maxChars) return first;
  return `${first.slice(0, maxChars).trimEnd()}...`;
}

export function titleFromSlug(slug: string): string {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
