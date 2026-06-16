import Link from "next/link";
import { AdSlot } from "../components/AdSlot";
import { EmailSignupForm } from "../components/EmailSignupForm";
import { SiteShell } from "../components/SiteShell";
import { excerptFromMarkdown } from "../lib/content-render";
import { areaVisuals, inspirationStyles, redesignImages } from "../lib/redesign-data";
import { contentAreaForBlog, hubs, readBlogs, tagsForBlog } from "../lib/site-data";

export const dynamic = "force-dynamic";

function HouseSmokeIcon() {
  return (
    <span className="house-smoke-icon" aria-hidden="true">
      <span />
      <span />
      <span />
      <svg viewBox="0 0 24 24" role="img">
        <path d="M3 11.5 12 4l9 7.5" />
        <path d="M5 10v9h14v-9" />
        <path d="M16 6V4h2v3.5" />
        <path d="M10 19v-4h4v4" />
      </svg>
    </span>
  );
}

export default async function HomePage() {
  const allBlogs = await readBlogs();
  const publishedBlogs = allBlogs.filter((blog) => blog.Status === "published");
  const blogs = (publishedBlogs.length > 0 ? publishedBlogs : allBlogs).slice(0, 3);
  const hasLiveBlogs = blogs.length > 0;
  const fallbackBlogCards = [
    {
      id: "fallback-plants",
      href: "/hub/plants",
      image: areaVisuals.Plants.image,
      tags: ["Plants", "Low light"],
      title: "The easiest plants for a small bathroom",
      excerpt: "Start with resilient greenery that handles humidity, tight corners, and imperfect light."
    },
    {
      id: "fallback-mirror",
      href: "/hub/mirror",
      image: areaVisuals.Mirror.image,
      tags: ["Mirror", "Renter-safe"],
      title: "Mirror upgrades that make a bathroom feel bigger",
      excerpt: "Use shape, scale, and simple frame details to change the room without a full renovation."
    },
    {
      id: "fallback-storage",
      href: "/hub/storage",
      image: areaVisuals.Storage.image,
      tags: ["Storage", "Small spaces"],
      title: "Storage fixes that calm bathroom clutter",
      excerpt: "A practical starting point for shelves, bins, and vanity zones that stay usable."
    }
  ];

  return (
    <SiteShell>
      <section className="home-photo-hero" style={{ backgroundImage: `url(${redesignImages.hero})` }}>
        <div className="home-photo-hero-overlay">
          <div className="container home-photo-hero-copy">
            <h1>
              <span className="hero-line hero-line-mobile">Your bathroom</span>
              <span className="hero-line hero-line-mobile">deserves better.</span>
              <span className="hero-line hero-line-desktop">Your bathroom deserves better.</span>
              <span className="hero-line hero-line-wallet">Your wallet says be smart.</span>
            </h1>
            <p>
              <span className="hero-line hero-line-mobile">Practical upgrades for renters, small spaces,</span>
              <span className="hero-line hero-line-mobile">and tight budgets.</span>
              <span className="hero-line hero-line-desktop">Practical upgrades for renters, small spaces, and tight budgets.</span>
            </p>
            <div className="cta-row">
              <Link href="/start-here" className="btn btn-accent">
                <span>Start Here</span>
                <HouseSmokeIcon />
              </Link>
              <Link href="/hub" className="btn btn-secondary">
                Browse Bathroom Areas
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="container site-page">
        <section className="home-section home-areas-section">
          <div className="dd-section-head home-section-head home-section-head-center">
            <div>
              <p className="eyebrow blog-eyebrow">Bathroom Areas</p>
              <h2>What part of your bathroom needs love?</h2>
              <p>Pick an area to explore realistic ideas, product picks, and step-by-step guides.</p>
            </div>
          </div>
          <div className="area-photo-grid home-area-grid">
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

        <section className="home-section home-inspiration-section">
          <div className="dd-section-head home-section-head">
            <div>
              <p className="eyebrow blog-eyebrow">Inspiration</p>
              <h2>Beautiful bathrooms, attainable upgrades</h2>
              <p>
                Scroll through curated style boards that balance aesthetics with function and budget. Tap any look to
                explore the full board.
              </p>
            </div>
            <Link href="/inspiration" className="home-section-link">
              View all inspiration
            </Link>
          </div>
          <div className="inspo-strip home-inspo-strip">
            {inspirationStyles.slice(0, 6).map((style) => (
              <Link key={style.slug} href={`/inspiration/${style.slug}`} className="inspo-strip-card">
                <img src={style.cover} alt="" />
                <span>{style.name}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="home-section home-blog-section">
          <div className="dd-section-head home-section-head">
            <div>
              <p className="eyebrow blog-eyebrow">Quick Reads</p>
              <h2>Quick reads to upgrade your bathroom</h2>
            </div>
            <Link href="/blog" className="home-section-link">
              All articles
            </Link>
          </div>
          <div className="home-blog-scroll">
            {hasLiveBlogs
              ? blogs.map((blog) => {
                  const image = areaVisuals[contentAreaForBlog(blog)].image;
                  return (
                    <Link key={blog.Blog_ID} href={`/blog/${blog.Slug}`} className="blog-card-link home-blog-card-link">
                      <article className="blog-image-card">
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
                          <h3>{blog.Title}</h3>
                          <p>{excerptFromMarkdown(blog.Draft_Markdown, 130)}</p>
                        </div>
                      </article>
                    </Link>
                  );
                })
              : fallbackBlogCards.map((blog) => (
                  <Link key={blog.id} href={blog.href} className="blog-card-link home-blog-card-link">
                    <article className="blog-image-card">
                      <div className="blog-image-card-media">
                        <img src={blog.image} alt="" />
                      </div>
                      <div className="blog-image-card-copy">
                        <div className="tag-list tag-list-compact">
                          {blog.tags.map((tag) => (
                            <span key={`${blog.id}-${tag}`} className="tag">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <h3>{blog.title}</h3>
                        <p>{blog.excerpt}</p>
                      </div>
                    </article>
                  </Link>
                ))}
          </div>
        </section>

        <section className="home-section home-plant-section dark-cta">
          <div>
            <p className="eyebrow">Free Tool</p>
            <h2>Find the perfect bathroom plant</h2>
            <p>
              Tell us about your bathroom&apos;s light and humidity. We&apos;ll recommend plants that will actually thrive, with
              placement tips included.
            </p>
            <Link href="/plant-picker" className="btn btn-accent">
              Try the Plant Picker
            </Link>
          </div>
        </section>

        <section className="home-section newsletter-band">
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
