"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

interface BlogCard {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
  keyword: string;
  image: string;
}

interface BlogIndexExplorerProps {
  blogs: BlogCard[];
  availableTags: string[];
}

export function BlogIndexExplorer({ blogs, availableTags }: BlogIndexExplorerProps) {
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState("All");

  const filteredBlogs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return blogs.filter((blog) => {
      const matchesTag = activeTag === "All" || blog.tags.includes(activeTag);
      const searchable = `${blog.title} ${blog.excerpt} ${blog.keyword} ${blog.tags.join(" ")}`.toLowerCase();
      const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery);
      return matchesTag && matchesQuery;
    });
  }, [activeTag, blogs, query]);

  return (
    <section className="dd-section blog-explorer">
      <div className="filter-panel">
        <label>
          <span>Search</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search lighting, renters, plants..."
          />
        </label>
        <label>
          <span>Area</span>
          <select value={activeTag} onChange={(event) => setActiveTag(event.target.value)}>
            <option value="All">All areas</option>
            {availableTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </label>
      </div>

      {filteredBlogs.length > 0 ? (
        <div className="grid grid-3">
          {filteredBlogs.map((blog) => (
            <article key={blog.id} className="blog-image-card">
              <div className="blog-image-card-media">
                <img src={blog.image} alt="" />
              </div>
              <div className="blog-image-card-copy">
                <div className="tag-list tag-list-compact">
                  {blog.tags.slice(0, 3).map((tag) => (
                    <span key={`${blog.id}-${tag}`} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
                <h2>
                  <Link href={`/blog/${blog.slug}`}>{blog.title}</Link>
                </h2>
                <p>{blog.excerpt}</p>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p className="eyebrow blog-eyebrow">No Matches</p>
          <h2>Try a different area or search term.</h2>
          <p>The live content library does not have a matching article for this filter yet.</p>
        </div>
      )}
    </section>
  );
}
