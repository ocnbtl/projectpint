import { AdminFrame } from "../../../components/admin/AdminFrame";
import { AdminSheetWorkspace } from "../../../components/admin/AdminSheetWorkspace";
import { AreaCountsAction } from "../../../components/admin/AreaCountsAction";
import { OpsButton } from "../../../components/admin/OpsButton";
import { countRowsMatching, countRowsWith, uniqueValueCount } from "../../../lib/admin-table-stats";
import { COMMAND_CENTER_COLUMNS } from "../../../lib/command-center-config";
import { loadEvergreenTab } from "../../../lib/command-center";

export const dynamic = "force-dynamic";

export default async function AdminBlogsPage() {
  const rows = await loadEvergreenTab("blogs");

  return (
    <AdminFrame>
      <AdminSheetWorkspace
        tab="blogs"
        heroTitle="Blogs"
        heroDescription={
          <p>
            Generate blog rows by area, type your exact topic into <code>Blog_Title</code>, add keywords manually if
            you want them, and let <code>Writer_Brief</code> build the ChatGPT prompt around that title. Paste the
            finished article into <code>Blog_Content</code>, run QC, then set <code>Workflow_Status</code> to{" "}
            <code>approved</code> when the row is ready to publish.
          </p>
        }
        editorTitle="Blogs Evergreen"
        columns={[...COMMAND_CENTER_COLUMNS.blogs]}
        initialRows={rows}
        dateColumn="Blog_Publish_Date"
        summaryCards={[
          { label: "Blogs", value: rows.length.toLocaleString(), detail: "article rows", tone: "green" },
          { label: "Approved", value: countRowsMatching(rows, "Workflow_Status", "approved").toLocaleString(), detail: "ready to publish", tone: "gold" },
          { label: "Published", value: countRowsWith(rows, "Published_To_Public_At").toLocaleString(), detail: "live public rows", tone: "blue" },
          { label: "Areas", value: uniqueValueCount(rows, "Content_Area").toLocaleString(), detail: "content coverage", tone: "brown" }
        ]}
      >
        <div className="admin-action-stack admin-hero-stack">
          <AreaCountsAction action="generate_new_blogs" label="Generate new blogs" mode="checkbox" />
          <div className="admin-ops-grid">
            <OpsButton action="generate_blog_titles_keywords" label="Refresh blog prompts" />
            <OpsButton action="refresh_blog_quality_checks" label="Refresh blog QC" variant="ghost" />
            <OpsButton action="update_blog_related_pins" label="Update related pins" variant="ghost" />
            <OpsButton action="publish_approved_blogs" label="Publish approved blogs" />
          </div>
        </div>
      </AdminSheetWorkspace>
    </AdminFrame>
  );
}
