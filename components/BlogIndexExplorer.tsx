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
    <section className="dd-section blog-explorer">
      <div className="blog-filter-stack">
        <label className="blog-hero-search">
          <span className="screen-reader-text">Search articles</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search articles..."
          />
        </label>
        <div className="area-filter-chips" aria-label="Filter by area">
          <button
            type="button"
            className={`area-filter-chip${activeArea === "all" ? " is-active" : ""}`}
            onClick={() => setActiveArea("all")}
          >
            All
          </button>
          {areaFilters.map((area) => (
            <button
              key={area.slug}
              type="button"
              className={`area-filter-chip${activeArea === area.slug ? " is-active" : ""}`}
              onClick={() => setActiveArea(area.slug)}
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
                  <img src={blog.image} alt="" />
                </div>
                <div className="blog-image-card-copy">
                  <div className="blog-card-meta">
                    <span className="tag">{blog.areaLabel}</span>
                    <span className="blog-read-time">
                      <ClockIcon />
                      {blog.readTime} min
                    </span>
                  </div>
                  <h2>{blog.title}</h2>
                  <p>{blog.excerpt}</p>
                  <div className="tag-list tag-list-compact">
                    {blog.tags
                      .filter((tag) => tag !== blog.areaLabel)
                      .slice(0, 2)
                      .map((tag) => (
                        <span key={`${blog.id}-${tag}`} className="tag tag-muted">
                          {tag}
                        </span>
                      ))}
                  </div>
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
  );
}
