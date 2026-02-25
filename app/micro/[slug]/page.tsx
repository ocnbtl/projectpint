import fs from "node:fs";
import path from "node:path";
import { SiteShell } from "../../../components/SiteShell";

export default async function MicroPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = path.join(process.cwd(), "micro_guides", `${slug}.md`);
  const content = fs.existsSync(p)
    ? fs.readFileSync(p, "utf8")
    : `# ${slug.replace(/-/g, " ")}\n\nThis micro guide is being prepared.`;
  return (
    <SiteShell>
      <article className="card">
        <pre style={{ whiteSpace: "pre-wrap" }}>{content}</pre>
      </article>
    </SiteShell>
  );
}
