import Link from "next/link";
import { AdSlot } from "../components/AdSlot";
import { EmailSignupForm } from "../components/EmailSignupForm";
import { SiteShell } from "../components/SiteShell";
import { excerptFromMarkdown } from "../lib/content-render";
import { hubs, pillarLabel, readBlogs } from "../lib/site-data";

export default function HomePage() {
  const allBlogs = readBlogs();
  const publishedBlogs = allBlogs.filter((blog) => blog.Status === "published");
  const blogs = (publishedBlogs.length > 0 ? publishedBlogs : allBlogs).slice(0, 3);

  return (
    <SiteShell>
      <div className="section-stack">
        <section className="hero hero-home-compact">
          <div className="hero-compact-wrap">
            <p className="eyebrow hero-lead-in">Practical bathroom upgrades for:</p>
            <ul className="hero-bullet-list">
              <li>Renters</li>
              <li>Small spaces</li>
              <li>Tight budgets</li>
            </ul>
            <p className="home-hero-cta">Start with one area and finish one real bathroom upgrade today.</p>
            <div className="cta-row hero-cta-row">
              <Link href="/start-here" className="btn btn-accent">
                Start here
              </Link>
              <Link href="/lead-magnets/plant-picker" className="btn btn-secondary">
                Try free bathroom plant guide
              </Link>
            </div>
          </div>
        </section>

        <section className="panel">
          <h2>The bathroom you&apos;ve always wanted</h2>
          <div className="metric-grid">
            <div className="metric">
              <p className="metric-value">15-45 mins</p>
              <p className="small">Quick win improvements that reduce clutter fast.</p>
            </div>
            <div className="metric">
              <p className="metric-value">Budget-aware options</p>
              <p className="small">Clear recommendation &amp; options for your budget.</p>
            </div>
            <div className="metric">
              <p className="metric-value">Style that fits you</p>
              <p className="small">Explore mirror, lighting, and color options across different aesthetics.</p>
            </div>
          </div>
        </section>

        <section className="panel">
          <h2>Choose your path</h2>
          <div className="grid grid-3">
            {hubs.map((hub) => (
              <article key={hub.slug} className="card card-soft path-card home-path-card">
                <div className="path-card-main">
                  <h3>{hub.title}</h3>
                  <p className="path-card-summary">{hub.description}</p>
                </div>
                <div className="path-card-action">
                  <p className="benefit-highlight">Win today: {hub.outcome}</p>
                  <Link href={`/hub/${hub.slug}`} className="btn btn-accent">
                    Explore {hub.title}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <h2>Read in under 5 minutes</h2>
          <div className="grid grid-3">
            {blogs.map((blog) => (
              <article key={blog.Blog_ID} className="card">
                <div className="tag-list tag-list-compact read-tags">
                  <span className="tag">{blog.Keyword_Target}</span>
                  <span className="tag">{pillarLabel(blog.Pillar)}</span>
                </div>
                <h3>
                  <Link href={`/blog/${blog.Slug}`}>{blog.Title}</Link>
                </h3>
                <p>{excerptFromMarkdown(blog.Draft_Markdown, 150)}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid grid-2">
          <article className="card card-accent promo-card promo-card-plant">
            <h3>Bathroom Plant Picker</h3>
            <p>Tell us your light, humidity, and space. Get practical plant matches and placement tips.</p>
            <Link href="/lead-magnets/plant-picker" className="btn btn-accent">
              Get free plant recommendations
            </Link>
          </article>
          <article className="card card-accent promo-card promo-card-blueprint">
            <h3>
              Bathroom Upgrade Blueprint <strong className="promo-subtitle">(for renters)</strong>
            </h3>
            <p>Personalized bathroom recommendations for your budget.</p>
            <Link href="/products/renter-bathroom-upgrade-blueprint" className="btn btn-accent">
              Preview blueprint
            </Link>
          </article>
        </section>

        <section className="panel">
          <h2>Get weekly bathroom inspiration &amp; upgrade plans</h2>
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
