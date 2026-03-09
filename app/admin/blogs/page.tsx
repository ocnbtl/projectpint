import { AdminFrame } from "../../../components/admin/AdminFrame";
import { AreaCountsAction } from "../../../components/admin/AreaCountsAction";
import { DataSheetEditor } from "../../../components/admin/DataSheetEditor";
import { OpsButton } from "../../../components/admin/OpsButton";
import { COMMAND_CENTER_COLUMNS } from "../../../lib/command-center-config";
import { loadEvergreenTab } from "../../../lib/command-center";

export const dynamic = "force-dynamic";

export default async function AdminBlogsPage() {
  const rows = await loadEvergreenTab("blogs");

  return (
    <AdminFrame>
      <section className="admin-panel admin-panel-hero">
        <p className="eyebrow admin-eyebrow">Blogs</p>
        <h1>Blogs</h1>
        <p>
          Generate blog rows by area, then use the prompt action to create the title, keywords, CTA target, and a full
          copy and paste writer prompt inside the command center. Paste the ChatGPT output into `Blog_Content`, run QC,
          then set `Workflow_Status` to `approved` when a row is ready for public publishing.
        </p>
        <div className="admin-meta-row">
          <span className="admin-meta-pill">Evergreen staging</span>
          <span className="admin-meta-pill">Approval required</span>
          <span className="admin-meta-pill">Prompt pack lives in Writer_Brief</span>
        </div>
        <div className="admin-action-stack">
          <AreaCountsAction action="generate_new_blogs" label="Generate new blogs" mode="checkbox" />
          <div className="admin-actions-inline">
            <OpsButton action="generate_blog_titles_keywords" label="Generate blog prompt packs" />
            <OpsButton action="refresh_blog_quality_checks" label="Refresh blog QC" variant="ghost" />
            <OpsButton action="update_blog_related_pins" label="Update related pins" variant="ghost" />
            <OpsButton action="publish_approved_blogs" label="Publish approved blogs" />
          </div>
        </div>
      </section>

      <DataSheetEditor
        tab="blogs"
        title="Blogs Evergreen"
        columns={[...COMMAND_CENTER_COLUMNS.blogs]}
        initialRows={rows}
        dateColumn="Blog_Publish_Date"
      />
    </AdminFrame>
  );
}
