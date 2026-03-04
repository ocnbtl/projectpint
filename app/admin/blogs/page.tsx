import { AdminFrame } from "../../../components/admin/AdminFrame";
import { AreaCountsAction } from "../../../components/admin/AreaCountsAction";
import { DataSheetEditor } from "../../../components/admin/DataSheetEditor";
import { OpsButton } from "../../../components/admin/OpsButton";
import { COMMAND_CENTER_COLUMNS } from "../../../lib/command-center-config";
import { loadEvergreenTab } from "../../../lib/command-center";

export const dynamic = "force-dynamic";

export default function AdminBlogsPage() {
  const rows = loadEvergreenTab("blogs");

  return (
    <AdminFrame>
      <section className="admin-panel">
        <h1>Blogs</h1>
        <p>
          Select one or more content areas, generate blog drafts, then generate blog titles and keywords. Use update
          related pins after new pin batches are created.
        </p>
        <div className="admin-action-stack">
          <AreaCountsAction action="generate_new_blogs" label="Generate new blogs" mode="checkbox" />
          <div className="admin-actions-inline">
            <OpsButton action="generate_blog_titles_keywords" label="Generate blog titles and keywords" />
            <OpsButton action="update_blog_related_pins" label="Update related pins" variant="ghost" />
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
