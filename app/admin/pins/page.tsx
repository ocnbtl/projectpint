import { AdminFrame } from "../../../components/admin/AdminFrame";
import { AdminSheetWorkspace } from "../../../components/admin/AdminSheetWorkspace";
import { OpsButton } from "../../../components/admin/OpsButton";
import { COMMAND_CENTER_COLUMNS } from "../../../lib/command-center-config";
import { loadEvergreenTab } from "../../../lib/command-center";

export const dynamic = "force-dynamic";

export default async function AdminPinsPage() {
  const rows = await loadEvergreenTab("pins");

  return (
    <AdminFrame>
      <AdminSheetWorkspace
        tab="pins"
        heroTitle="Pins"
        heroDescription={
          <p>
            Generate pins after blog and guide destinations exist, review the copy, add <code>Media_URL</code>, and
            set <code>Workflow_Status</code> to <code>approved</code>. Preparing approved pins finalizes the export
            data directly from the evergreen table without auto posting anything to Pinterest.
          </p>
        }
        editorTitle="Pins Evergreen"
        columns={[...COMMAND_CENTER_COLUMNS.pins]}
        initialRows={rows}
        dateColumn="Pin_Publish_Date"
      >
        <div className="admin-ops-grid">
          <OpsButton action="generate_new_pins" label="Generate new pins" payload={{ count: 25 }} />
          <OpsButton action="generate_overlay_cta" label="Generate overlay and CTA" payload={{ count: 25 }} />
          <OpsButton action="prepare_approved_pins_for_export" label="Prepare pins for export" variant="ghost" />
          <a className="btn btn-ghost" href="/api/admin/exports/pins">
            Download pin CSV
          </a>
        </div>
      </AdminSheetWorkspace>
    </AdminFrame>
  );
}
