import Link from "next/link";
import { AdSlot } from "../components/AdSlot";
import { EmailSignupForm } from "../components/EmailSignupForm";
import { SiteShell } from "../components/SiteShell";
import { excerptFromMarkdown } from "../lib/content-render";
import { areaVisuals, inspirationStyles, redesignImages } from "../lib/redesign-data";
import { contentAreaForBlog, hubs, readBlogs, tagsForBlog } from "../lib/site-data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const allBlogs = await readBlogs();
  const publishedBlogs = allBlogs.filter((blog) => blog.Status === "published");
  const blogs = (publishedBlogs.length > 0 ? publishedBlogs : allBlogs).slice(0, 3);

  return (
    <SiteShell>
      <section className="home-photo-hero" style={{ backgroundImage: `url(${redesignImages.hero})` }}>
        <div className="home-photo-hero-overlay">
          <div className="container home-photo-hero-copy">
            <h1>
              Your bathroom deserves better.
              <span>Your wallet says be smart.</span>
            </h1>
            <p>Practical upgrades for renters, small spaces, and tight budgets.</p>
            <div className="cta-row">
              <Link href="/start-here" className="btn btn-accent">
                Start Here
              </Link>
              <Link href="/hub" className="btn btn-secondary">
                Browse Bathroom Areas
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="container site-page">
        <section className="dd-section">
          <div className="dd-section-head">
            <div>
              <p className="eyebrow blog-eyebrow">Bathroom Areas</p>
              <h2>Every small upgrade starts with one area.</h2>
            </div>
            <Link href="/hub" className="btn btn-ghost">
              View all areas
            </Link>
          </div>
          <div className="area-photo-grid">
            {hubs.map((hub) => {
              const visual = areaVisuals[hub.area];
              return (
                <Link key={hub.slug} href={`/hub/${hub.slug}`} className="area-photo-card">
                  <img src={visual.image} alt="" />
                  <span className="area-photo-card-shade" aria-hidden="true" />
                  <span className="area-photo-card-copy">
                    <strong>{hub.title}</strong>
                    <span>{visual.tagline}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="dd-section split-feature">
          <div>
            <p className="eyebrow blog-eyebrow">Inspiration</p>
            <h2>Beautiful bathrooms, attainable upgrades.</h2>
            <p>
              Browse style boards built around finishes, plants, lighting, and renter-safe details before choosing the
              practical next step.
            </p>
            <Link href="/inspiration" className="btn btn-accent">
              Browse inspiration
            </Link>
          </div>
          <div className="inspo-strip">
            {inspirationStyles.slice(0, 4).map((style) => (
              <Link key={style.slug} href={`/inspiration/${style.slug}`} className="inspo-strip-card">
                <img src={style.cover} alt="" />
                <span>{style.name}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="dd-section">
          <div className="dd-section-head">
            <div>
              <p className="eyebrow blog-eyebrow">Quick Reads</p>
              <h2>Upgrade ideas from the live content system.</h2>
            </div>
            <Link href="/blog" className="btn btn-ghost">
              View all posts
            </Link>
          </div>
          <div className="grid grid-3">
            {blogs.map((blog) => {
              const image = areaVisuals[contentAreaForBlog(blog)].image;
              return (
                <article key={blog.Blog_ID} className="blog-image-card">
                  <div className="blog-image-card-media">
                    <img src={image} alt="" />
                  </div>
                  <div className="blog-image-card-copy">
                    <div className="tag-list tag-list-compact">
                      {tagsForBlog(blog)
                        .slice(0, 2)
                        .map((tag) => (
                          <span key={`${blog.Blog_ID}-${tag}`} className="tag">
                            {tag}
                          </span>
                        ))}
                    </div>
                    <h3>
                      <Link href={`/blog/${blog.Slug}`}>{blog.Title}</Link>
                    </h3>
                    <p>{excerptFromMarkdown(blog.Draft_Markdown, 130)}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="dark-cta">
          <div>
            <p className="eyebrow">Free Tool</p>
            <h2>Find bathroom plants that can actually survive your space.</h2>
          </div>
          <Link href="/plant-picker" className="btn btn-accent">
            Free Plant Picker
          </Link>
        </section>

        <section className="newsletter-band">
          <div>
            <p className="eyebrow blog-eyebrow">Weekly Plan</p>
            <h2>Bathroom inspiration with practical next steps.</h2>
          </div>
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
