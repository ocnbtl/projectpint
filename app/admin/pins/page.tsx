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
          <p>Manage evergreen Pinterest pins for content distribution.</p>
        }
        editorTitle="Pins Evergreen"
        columns={[...COMMAND_CENTER_COLUMNS.pins]}
        initialRows={rows}
        dateColumn="Pin_Publish_Date"
      >
        <div className="admin-ops-grid">
          <OpsButton action="generate_new_pins" label="Generate New Pins" payload={{ count: 25 }} icon="plus" />
          <OpsButton action="generate_overlay_cta" label="Generate Overlay & CTA" payload={{ count: 25 }} icon="refresh" variant="ghost" />
          <OpsButton action="prepare_approved_pins_for_export" label="Prepare for Export" icon="play" variant="ghost" />
          <a className="btn btn-ghost" href="/api/admin/exports/pins">
            <span className="admin-action-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M12 4v10" />
                <path d="m7 9 5 5 5-5" />
                <path d="M5 20h14" />
              </svg>
            </span>
            Download CSV
          </a>
        </div>
      </AdminSheetWorkspace>
    </AdminFrame>
  );
}
