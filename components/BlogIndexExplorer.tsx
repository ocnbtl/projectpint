"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

interface BlogItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
  keyword: string;
}

interface BlogIndexExplorerProps {
  blogs: BlogItem[];
  availableTags: string[];
}

export function BlogIndexExplorer({ blogs, availableTags }: BlogIndexExplorerProps) {
  const [query, setQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return blogs.filter((blog) => {
      const matchesTag = selectedTag === "all" || blog.tags.includes(selectedTag);
      if (!matchesTag) return false;
      if (!normalizedQuery) return true;

      const haystack = `${blog.title} ${blog.excerpt} ${blog.keyword} ${blog.tags.join(" ")}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [blogs, query, selectedTag]);

  return (
    <section className="panel blog-explorer">
      <div className="blog-search-row">
        <div className="field">
          <label htmlFor="blog-search">Search</label>
          <input
            id="blog-search"
            type="search"
            placeholder="Search by topic, title, or keyword"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="blog-tag-filter">Filter by tag</label>
          <select
            id="blog-tag-filter"
            value={selectedTag}
            onChange={(event) => setSelectedTag(event.target.value)}
          >
            <option value="all">All tags</option>
            {availableTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="small">No posts match that search yet. Try another keyword or tag.</p>
      ) : (
        <div className="grid grid-3">
          {filtered.map((blog) => (
            <article key={blog.id} className="card blog-card">
              <h3>
                <Link href={`/blog/${blog.slug}`}>{blog.title}</Link>
              </h3>
              <div className="tag-list blog-tag-list tag-list-compact">
                {blog.tags.map((tag) => (
                  <span key={`${blog.id}-${tag}`} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
              <p className="blog-card-excerpt">{blog.excerpt}...</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
