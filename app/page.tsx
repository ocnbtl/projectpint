import Link from "next/link";
import { AdSlot } from "../components/AdSlot";
import { EmailSignupForm } from "../components/EmailSignupForm";
import { SiteShell } from "../components/SiteShell";
import { excerptFromMarkdown } from "../lib/content-render";
import { hubs, readBlogs } from "../lib/site-data";

export default function HomePage() {
  const blogs = readBlogs().slice(0, 3);

  return (
    <SiteShell>
      <div className="section-stack">
        <section className="hero">
          <div className="hero-grid">
            <div>
              <p className="eyebrow">Diyesu Decor | DIY Bathroom Upgrades</p>
              <h1>Practical bathroom upgrades for renters, small spaces, and tight budgets.</h1>
              <p>
                Make one upgrade that eases your daily routine, then stack the next move when you are ready. Every plan
                is built for real rentals, real budgets, and normal toolkits.
              </p>
              <p className="home-hero-cta">Start with your current constraint and aim for one clear bathroom win today.</p>
              <div className="pill-row" aria-label="Core benefits">
                <span className="pill">Renter-safe options</span>
                <span className="pill">Budget tiers under $75/$150/$300</span>
                <span className="pill">Small-space ready</span>
              </div>
              <div className="cta-row">
                <Link href="/start-here" className="btn btn-primary">
                  Build my plan
                </Link>
                <Link href="/lead-magnets/plant-picker" className="btn btn-secondary">
                  Try free plant picker
                </Link>
              </div>
            </div>
            <div className="hero-card">
              <h3>Start in 3 steps</h3>
              <ol>
                <li>Pick your main constraint (renter, budget, small-space, plants).</li>
                <li>Follow one path with one anchor fix and one support layer.</li>
                <li>Use weekly checklists so results last beyond day one.</li>
              </ol>
              <p className="small">If you are unsure where to begin, use Start Here and choose the closest situation.</p>
            </div>
          </div>
        </section>

        <section className="panel">
          <h2>What changes first</h2>
          <div className="metric-grid">
            <div className="metric">
              <p className="metric-value">15-30 min</p>
              <p className="small">Quick-win tasks that reduce visible clutter fast.</p>
            </div>
            <div className="metric">
              <p className="metric-value">$75 / $150 / $300</p>
              <p className="small">Clear budget lanes so you stop second-guessing purchases.</p>
            </div>
            <div className="metric">
              <p className="metric-value">No-drill first</p>
              <p className="small">Renter-safe defaults with drill-allowed alternatives when needed.</p>
            </div>
          </div>
        </section>

        <section className="grid grid-3">
          {hubs.map((hub) => (
            <article key={hub.slug} className="card card-soft path-card home-path-card">
              <h3>{hub.title}</h3>
              <p className="path-card-summary">{hub.description}</p>
              <p className="benefit-highlight">Win today: {hub.outcome}</p>
              <Link href={`/hub/${hub.slug}`} className="btn btn-accent">
                Open this path
              </Link>
            </article>
          ))}
        </section>

        <section className="panel">
          <h2>Read this week</h2>
          <div className="grid grid-3">
            {blogs.map((blog) => (
              <article key={blog.Blog_ID} className="card">
                <p className="small">{blog.Keyword_Target}</p>
                <h3>
                  <Link href={`/blog/${blog.Slug}`}>{blog.Title}</Link>
                </h3>
                <p>{excerptFromMarkdown(blog.Draft_Markdown, 150)}</p>
                <div className="tag-list">
                  <span className="tag">{blog.Pillar}</span>
                  <span className="tag">{blog.Status}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid grid-2">
          <article className="card card-accent">
            <p className="eyebrow" style={{ color: "var(--brand-deep)" }}>
              Free lead magnet
            </p>
            <h3>Bathroom Plant Picker</h3>
            <p>Tell us your light, humidity, and space. Get practical plant matches and placement tips.</p>
            <Link href="/lead-magnets/plant-picker" className="btn btn-accent">
              Get my free picks
            </Link>
          </article>
          <article className="card card-accent">
            <p className="eyebrow" style={{ color: "var(--brand-deep)" }}>
              Paid system
            </p>
            <h3>Renter Bathroom Upgrade Blueprint</h3>
            <p>Choose-your-path upgrade kit with checklists, decision trees, and budget-aligned plans.</p>
            <Link href="/products/renter-bathroom-upgrade-blueprint" className="btn btn-accent">
              Preview blueprint
            </Link>
          </article>
        </section>

        <section className="panel">
          <h2>Get weekly renter-safe bathroom plans</h2>
          <p>
            Join the newsletter for actionable upgrades, not hype. You will get one practical sequence each week that you
            can execute with a normal budget and schedule.
          </p>
          <EmailSignupForm
            sourceUrl="/"
            buttonLabel="Send me weekly plans"
            consentText="I agree to receive Diyesu Decor emails and understand I can unsubscribe anytime."
          />
        </section>

        <AdSlot enabled={true} slotId="home-top" />
      </div>
    </SiteShell>
  );
}
