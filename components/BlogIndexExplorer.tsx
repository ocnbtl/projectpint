"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

interface BlogCard {
  id: string;
  slug: string;
  href?: string;
  title: string;
  excerpt: string;
  tags: string[];
  keyword: string;
  image: string;
  areaLabel: string;
  areaSlug: string;
  readTime: number;
}

interface BlogIndexExplorerProps {
  blogs: BlogCard[];
  availableTags: string[];
  areaFilters: Array<{ label: string; slug: string }>;
  initialArea?: string;
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7.5v5l3.5 2" />
    </svg>
  );
}

export function BlogIndexExplorer({ blogs, availableTags, areaFilters, initialArea }: BlogIndexExplorerProps) {
  const [query, setQuery] = useState("");
  const initialAreaValue = initialArea && areaFilters.some((area) => area.slug === initialArea) ? initialArea : "all";
  const [activeArea, setActiveArea] = useState(initialAreaValue);

  const filteredBlogs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return blogs.filter((blog) => {
      const matchesArea = activeArea === "all" || blog.areaSlug === activeArea;
      const searchable = `${blog.title} ${blog.excerpt} ${blog.keyword} ${blog.tags.join(" ")}`.toLowerCase();
      const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery);
      return matchesArea && matchesQuery;
    });
  }, [activeArea, blogs, query]);

  return (
    <>
      <section className="blog-index-hero">
        <div className="container blog-index-hero-inner" data-reveal="hero">
          <h1>Curated guides & articles to upgrade your bathroom</h1>
          <ol className="blog-intro-steps">
            <li>Find a relevant article and read in less than 10 minutes</li>
            <li>Follow the upgrade steps and finish your first bathroom upgrade this weekend... or tonight</li>
          </ol>
          <label className="blog-hero-search">
            <span className="screen-reader-text">Search articles</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search articles..."
            />
          </label>
        </div>
      </section>
      <div className="container site-page blog-index-body">
        <section className="blog-explorer">
          <div className="blog-filter-stack">
            <div className="area-filter-chips" aria-label="Filter by area">
              <button
                type="button"
                className={`area-filter-chip${activeArea === "all" ? " is-active" : ""}`}
                onClick={() => setActiveArea("all")}
                aria-pressed={activeArea === "all"}
              >
                All
              </button>
              {areaFilters.map((area) => (
                <button
                  key={area.slug}
                  type="button"
                  className={`area-filter-chip${activeArea === area.slug ? " is-active" : ""}`}
                  onClick={() => setActiveArea(area.slug)}
                  aria-pressed={activeArea === area.slug}
                >
                  {area.label}
                </button>
              ))}
            </div>
          </div>

          {filteredBlogs.length > 0 ? (
            <div className="grid grid-3">
              {filteredBlogs.map((blog) => (
                <Link key={blog.id} href={blog.href ?? `/blog/${blog.slug}`} className="blog-card-link">
                  <article className="blog-image-card">
                    <div className="blog-image-card-media">
                      <img src={blog.image} alt={`${blog.title} article`} loading="lazy" decoding="async" />
                    </div>
                    <div className="blog-image-card-copy">
                      <div className="blog-card-meta">
                        <span className="tag">{blog.areaLabel}</span>
                        <span className="blog-read-time">
                          <ClockIcon />
                          {blog.readTime} min read
                        </span>
                      </div>
                      <h2>{blog.title}</h2>
                      <p>{blog.excerpt}</p>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-state blog-empty">
              <h2>No articles match your search.</h2>
              <p>The live content library does not have a matching article for this filter yet.</p>
              {availableTags.length > 0 ? <p className="small">Available tags: {availableTags.slice(0, 8).join(", ")}</p> : null}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
