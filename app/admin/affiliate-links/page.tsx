import { AdminFrame } from "../../../components/admin/AdminFrame";
import { AdminSheetWorkspace } from "../../../components/admin/AdminSheetWorkspace";
import {
  AFFILIATE_LINK_COLUMNS,
  isAmazonAssociatesTagConfigured,
  readAffiliateLinks
} from "../../../lib/affiliate-links";

export const dynamic = "force-dynamic";

export default async function AdminAffiliateLinksPage() {
  const rows = await readAffiliateLinks();
  const styles = new Set(rows.map((row) => row.Style)).size;
  const active = rows.filter((row) => row.Status === "active").length;
  const tagConfigured = isAmazonAssociatesTagConfigured();

  return (
    <AdminFrame>
      <AdminSheetWorkspace
        tab="affiliate-links"
        heroTitle="Affiliate Links"
        heroDescription={
          <p>Manage every Inspiration product by style. Paste exact Amazon SiteStripe links here before promoting a product.</p>
        }
        editorTitle="Amazon Inspiration Products"
        columns={[...AFFILIATE_LINK_COLUMNS]}
        initialRows={rows}
        summaryCards={[
          { label: "Styles", value: styles, detail: "grouped Inspiration boards", tone: "green" },
          { label: "Products", value: rows.length, detail: "Amazon-only links", tone: "gold" },
          { label: "Active", value: active, detail: "visible product cards", tone: "blue" }
        ]}
      >
        <div className="admin-callout">
          <p><strong>{tagConfigured ? "Associates tag configured." : "Associates tag not configured."}</strong></p>
          <p>
            {tagConfigured
              ? "Direct Amazon URLs without a tag receive the configured environment tag when rendered publicly. Short SiteStripe links are preserved as entered."
              : "The starter rows use Amazon search URLs and do not fabricate tracking. Replace them with exact SiteStripe links, or configure AMAZON_ASSOCIATES_TAG in the deployment environment."}
          </p>
          <p>Amazon Associates performance reporting is intentionally deferred until authorized reporting credentials are connected.</p>
        </div>
      </AdminSheetWorkspace>
    </AdminFrame>
  );
}
