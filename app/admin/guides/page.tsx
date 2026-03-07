import { AdminFrame } from "../../../components/admin/AdminFrame";
import { AreaCountsAction } from "../../../components/admin/AreaCountsAction";
import { DataSheetEditor } from "../../../components/admin/DataSheetEditor";
import { OpsButton } from "../../../components/admin/OpsButton";
import { COMMAND_CENTER_COLUMNS } from "../../../lib/command-center-config";
import { loadEvergreenTab } from "../../../lib/command-center";

export const dynamic = "force-dynamic";

export default async function AdminGuidesPage() {
  const rows = await loadEvergreenTab("guides");

  return (
    <AdminFrame>
      <section className="admin-panel admin-panel-hero">
        <p className="eyebrow admin-eyebrow">Guides</p>
        <h1>Guides</h1>
        <p>
          Guides are short action paths linked to blog IDs. Generate and edit them here, then set `Workflow_Status` to
          `approved` when a guide is ready to publish to a live `/guides/*` page.
        </p>
        <div className="admin-meta-row">
          <span className="admin-meta-pill">Current public route: /guides/*</span>
          <span className="admin-meta-pill">Autosaves to Supabase</span>
        </div>
        <div className="admin-action-stack">
          <AreaCountsAction action="generate_new_guides" label="Generate new guides" mode="checkbox" />
          <div className="admin-actions-inline">
            <OpsButton action="generate_guide_titles_keywords" label="Generate guide titles and keywords" />
            <OpsButton action="update_guide_related_pins" label="Update related pins" variant="ghost" />
            <OpsButton action="publish_approved_guides" label="Publish approved guides" />
          </div>
        </div>
      </section>

      <DataSheetEditor
        tab="guides"
        title="Guides Evergreen"
        columns={[...COMMAND_CENTER_COLUMNS.guides]}
        initialRows={rows}
        dateColumn="Guide_Publish_Date"
      />
    </AdminFrame>
  );
}
