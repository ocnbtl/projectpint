import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AffiliateDisclosure } from "../../../components/AffiliateDisclosure";
import { AffiliateProductGallery } from "../../../components/AffiliateProductGallery";
import { SiteShell } from "../../../components/SiteShell";
import { readPublicAffiliateProduct } from "../../../lib/affiliate-catalog";
import { inspirationStyles } from "../../../lib/redesign-data";
import { pageMetadata } from "../../../lib/seo";

export const dynamic = "force-dynamic";

interface AffiliateProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: AffiliateProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await readPublicAffiliateProduct(slug);
  if (!product) {
    return pageMetadata({
      title: "Product not found",
      description: "This product is not available.",
      path: `/shop/${slug}`,
      indexable: false
    });
  }
  return pageMetadata({
    title: product.name,
    description: product.recommendationRationale,
    path: `/shop/${product.slug}`,
    indexable: product.visibility === "public"
  });
}

export default async function AffiliateProductPage({ params }: AffiliateProductPageProps) {
  const { slug } = await params;
  const product = await readPublicAffiliateProduct(slug);
  if (!product) notFound();

  const primaryStyleSlug = product.styleAssignments.find((assignment) => assignment.role === "primary")?.styleSlug;
  const primaryStyle = inspirationStyles.find((style) => style.slug === primaryStyleSlug);

  return (
    <SiteShell>
      <main className="container affiliate-product-page">
        <nav className="affiliate-product-breadcrumbs" aria-label="Breadcrumb">
          <Link href="/inspiration">Inspiration</Link>
          <span aria-hidden="true">/</span>
          {primaryStyle ? <Link href={`/inspiration/${primaryStyle.slug}`}>{primaryStyle.name}</Link> : null}
          <span aria-hidden="true">/</span>
          <span aria-current="page">{product.name}</span>
        </nav>

        <div className="affiliate-product-layout">
          <AffiliateProductGallery
            product={product}
            styles={inspirationStyles.map((style) => ({ slug: style.slug, name: style.name }))}
          />

          <section className="affiliate-product-copy">
            <p className="eyebrow">{product.brand} · {product.category}</p>
            <h1>{product.name}</h1>
            <p className="affiliate-product-rationale">{product.recommendationRationale}</p>
            <div className="affiliate-product-meta">
              <div><span>Primary style</span><strong>{primaryStyle?.name ?? "Curated bathroom style"}</strong></div>
              <div>
                <span>Availability checked</span>
                <strong>
                  {new Date(product.availabilityObservedAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric"
                  })}
                </strong>
              </div>
            </div>
            {product.caveats.length > 0 ? (
              <div className="affiliate-product-caveats">
                <h2>Before you choose it</h2>
                <ul>{product.caveats.map((caveat) => <li key={caveat}>{caveat}</li>)}</ul>
              </div>
            ) : null}
            {product.associatesUrl ? (
              <a
                className="btn btn-accent affiliate-product-cta"
                href={product.associatesUrl}
                target="_blank"
                rel="sponsored noreferrer"
              >
                View this exact product on Amazon
              </a>
            ) : (
              <span className="btn btn-accent affiliate-product-cta is-disabled" aria-disabled="true">
                Associates link awaiting approval
              </span>
            )}
            <p className="affiliate-product-price-note">
              Price and availability can change. Confirm the seller, variation, dimensions, materials,
              installation requirements, and current total on Amazon.
            </p>
          </section>
        </div>
      </main>
      <AffiliateDisclosure />
    </SiteShell>
  );
}
