import Link from "next/link";
import { AreaIcon } from "../components/AreaIcon";
import { EmailSignupForm } from "../components/EmailSignupForm";
import { HomeScrollControls } from "../components/HomeScrollControls";
import { SiteShell } from "../components/SiteShell";
import { estimateReadTimeMinutes, excerptFromMarkdown } from "../lib/content-render";
import { areaVisuals, inspirationStyles, redesignImages } from "../lib/redesign-data";
import { blogMatchesArea, contentAreaForBlog, hubs, readBlogs, readGuides, tagsForBlog } from "../lib/site-data";

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
  const [allBlogs, allGuides] = await Promise.all([readBlogs(), readGuides()]);
  const publishedBlogs = allBlogs.filter((blog) => blog.Status === "published");
  const blogSource = publishedBlogs.length > 0 ? publishedBlogs : allBlogs;
  const blogs = blogSource.slice(0, 6);
  const hasLiveBlogs = blogs.length > 0;
  const publishedGuides = allGuides.filter((guide) => guide.status.trim().toLowerCase() === "published");
  const guideSource = publishedGuides.length > 0 ? publishedGuides : allGuides;
  const inspirationLoop = [...inspirationStyles, ...inspirationStyles];
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
            <h1 aria-label="Your bathroom deserves better. Your wallet says be smart.">
              <span className="hero-line hero-line-mobile" aria-hidden="true">Your bathroom</span>
              <span className="hero-line hero-line-mobile" aria-hidden="true">deserves better.</span>
              <span className="hero-line hero-line-desktop" aria-hidden="true">Your bathroom deserves better.</span>
              <span className="hero-line hero-line-wallet" aria-hidden="true">Your wallet says be smart.</span>
            </h1>
            <p aria-label="Practical upgrades for renters, small spaces, and tight budgets.">
              <span className="hero-line hero-line-mobile" aria-hidden="true">Practical upgrades for renters, small spaces,</span>
              <span className="hero-line hero-line-mobile" aria-hidden="true">and tight budgets.</span>
              <span className="hero-line hero-line-desktop" aria-hidden="true">Practical upgrades for renters, small spaces, and tight budgets.</span>
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

      <div className="container site-page home-page">
        <section className="home-section home-areas-section">
          <div className="dd-section-head home-section-head home-section-head-center">
            <div>
              <h2>What part of your bathroom needs love?</h2>
              <p>Pick an area to explore realistic ideas, product picks, and step-by-step guides.</p>
            </div>
          </div>
          <div className="area-photo-grid home-area-grid">
            {hubs.map((hub) => {
              const visual = areaVisuals[hub.area];
              const articleCount =
                blogSource.filter((blog) => blogMatchesArea(blog, hub.area)).length +
                guideSource.filter((guide) => guide.area === hub.area).length;
              return (
                <Link key={hub.slug} href={`/hub/${hub.slug}`} className="area-photo-card">
                  <img src={visual.image} alt="" />
                  <span className="area-photo-card-shade" aria-hidden="true" />
                  <span className="area-photo-icon" aria-hidden="true">
                    <AreaIcon name={visual.icon} />
                  </span>
                  <span className="area-photo-card-copy">
                    <strong>{hub.title}</strong>
                    <span>
                      {articleCount} {articleCount === 1 ? "article" : "articles"}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="home-section home-inspiration-section">
          <div className="dd-section-head home-section-head">
            <div>
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
          <div className="home-inspo-window">
            <div className="inspo-strip home-inspo-strip" id="home-inspiration-carousel">
              {inspirationLoop.map((style, index) => (
                <Link key={`${style.slug}-${index}`} href={`/inspiration/${style.slug}`} className="inspo-strip-card">
                  <img src={style.cover} alt="" />
                  <span>{style.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="home-section home-blog-section">
          <div className="dd-section-head home-section-head">
            <div>
              <h2>Quick reads to upgrade your bathroom</h2>
            </div>
            <div className="home-section-actions">
              <HomeScrollControls targetId="home-quick-reads" label="Quick reads carousel controls" />
              <Link href="/blog" className="home-section-link">
                All articles <span aria-hidden="true">-&gt;</span>
              </Link>
            </div>
          </div>
          <div className="home-blog-scroll" id="home-quick-reads">
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
                              .slice(0, 1)
                              .map((tag) => (
                                <span key={`${blog.Blog_ID}-${tag}`} className="tag">
                                  {tag}
                                </span>
                              ))}
                            <span className="blog-read-time">{estimateReadTimeMinutes(blog.Draft_Markdown)} min read</span>
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
                          {blog.tags.slice(0, 1).map((tag) => (
                            <span key={`${blog.id}-${tag}`} className="tag">
                              {tag}
                            </span>
                          ))}
                          <span className="blog-read-time">4 min read</span>
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
            <span className="home-free-pill">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20.8 4.6a5.2 5.2 0 0 0-7.4 0L12 6l-1.4-1.4a5.2 5.2 0 0 0-7.4 7.4l1.4 1.4L12 20.8l7.4-7.4 1.4-1.4a5.2 5.2 0 0 0 0-7.4Z" />
              </svg>
              100% Free
            </span>
            <h2>Find the perfect bathroom plant</h2>
            <p>
              Tell us about your bathroom&apos;s light and humidity. We&apos;ll recommend plants that will actually thrive, with
              placement tips included.
            </p>
            <Link href="/plant-picker" className="btn btn-accent">
              Try the Plant Picker
              <svg className="btn-leaf-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 19c9.5 0 14-5.6 14-14-8.4 0-14 4.5-14 14Z" />
                <path d="M5 19c3-5 6.7-8 11-10" />
              </svg>
            </Link>
          </div>
        </section>

        <section className="home-section newsletter-band home-newsletter-dark">
          <div>
            <span className="home-newsletter-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M4 6h16v12H4z" />
                <path d="m4 7 8 6 8-6" />
              </svg>
            </span>
            <h2>Weekly Bathroom Ideas</h2>
            <p>One email, one idea, every Wednesday</p>
          </div>
          <EmailSignupForm
            sourceUrl="/"
            buttonLabel="Join"
            consentText="I agree to receive Diyesu Decor emails and understand I can unsubscribe anytime."
            showContentAreaChecklist={false}
            showConsentNote={false}
          />
        </section>
      </div>
    </SiteShell>
  );
}
