import { AdminFrame } from "../../../components/admin/AdminFrame";
import { AreaCountsAction } from "../../../components/admin/AreaCountsAction";
import { DataSheetEditor } from "../../../components/admin/DataSheetEditor";
import { OpsButton } from "../../../components/admin/OpsButton";
import { COMMAND_CENTER_COLUMNS } from "../../../lib/command-center-config";
import { loadEvergreenTab } from "../../../lib/command-center";

export const dynamic = "force-dynamic";

export default function AdminGuidesPage() {
  const rows = loadEvergreenTab("guides");

  return (
    <AdminFrame>
      <section className="admin-panel">
        <h1>Guides</h1>
        <p>
          Guides are short action paths linked to blog IDs. Generate new guides by area, then fill titles and keywords
          and sync related pins.
        </p>
        <div className="admin-action-stack">
          <AreaCountsAction action="generate_new_guides" label="Generate new guides" mode="checkbox" />
          <div className="admin-actions-inline">
            <OpsButton action="generate_guide_titles_keywords" label="Generate guide titles and keywords" />
            <OpsButton action="update_guide_related_pins" label="Update related pins" variant="ghost" />
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
