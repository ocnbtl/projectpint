import Link from "next/link";
import { SiteShell } from "../components/SiteShell";

export default function NotFoundPage() {
  return (
    <SiteShell>
      <section className="legal-figma-hero">
        <div className="container">
          <p className="eyebrow">404</p>
          <h1>That page is not available.</h1>
        </div>
      </section>
      <div className="container legal-figma-body">
        <article className="legal-prose">
          <p>The address may have changed, or the content may no longer be published.</p>
          <p><Link className="btn btn-accent" href="/">Return home</Link></p>
        </article>
      </div>
    </SiteShell>
  );
}
