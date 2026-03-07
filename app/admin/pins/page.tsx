import { AdminFrame } from "../../../components/admin/AdminFrame";
import { DataSheetEditor } from "../../../components/admin/DataSheetEditor";
import { OpsButton } from "../../../components/admin/OpsButton";
import { COMMAND_CENTER_COLUMNS } from "../../../lib/command-center-config";
import { loadEvergreenTab } from "../../../lib/command-center";

export const dynamic = "force-dynamic";

export default async function AdminPinsPage() {
  const rows = await loadEvergreenTab("pins");

  return (
    <AdminFrame>
      <section className="admin-panel admin-panel-hero">
        <p className="eyebrow admin-eyebrow">Pins</p>
        <h1>Pins</h1>
        <p>
          Generate pins after blog and guide destinations exist, then review the copy, add `Media_URL`, and set
          `Workflow_Status` to `approved`. Preparing approved pins finalizes the export data directly from the
          evergreen table without auto-posting anything to Pinterest.
        </p>
        <div className="admin-meta-row">
          <span className="admin-meta-pill">No unofficial posting automation</span>
          <span className="admin-meta-pill">Nano Banana + Canva workflow</span>
        </div>
        <div className="admin-actions-inline">
          <OpsButton action="generate_new_pins" label="Generate new pins" payload={{ count: 25 }} />
          <OpsButton action="generate_overlay_cta" label="Generate overlay and CTA" payload={{ count: 25 }} />
          <OpsButton action="prepare_approved_pins_for_export" label="Prepare approved pins for export" variant="ghost" />
          <a className="btn btn-ghost" href="/api/admin/exports/pins">
            Download approved pins CSV
          </a>
        </div>
      </section>

      <DataSheetEditor
        tab="pins"
        title="Pins Evergreen"
        columns={[...COMMAND_CENTER_COLUMNS.pins]}
        initialRows={rows}
        dateColumn="Pin_Publish_Date"
      />
    </AdminFrame>
  );
}
